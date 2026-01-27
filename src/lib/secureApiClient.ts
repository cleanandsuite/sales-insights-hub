// Secure API client for all backend calls with JWT authentication
import { supabase } from '@/integrations/supabase/client';

type RefreshSessionResult = Awaited<ReturnType<typeof supabase.auth.refreshSession>>;

// Supabase refresh tokens are rotated; if multiple callers refresh concurrently,
// one refresh can revoke the other's token, leading to a cascade of auth failures.
// We guard refreshSession() with a single in-flight promise.
let refreshInFlight: Promise<RefreshSessionResult> | null = null;

async function refreshSessionWithLock(): Promise<RefreshSessionResult> {
  if (!refreshInFlight) {
    refreshInFlight = supabase.auth
      .refreshSession()
      .finally(() => {
        refreshInFlight = null;
      });
  }
  return refreshInFlight;
}

export class SecureApiClient {
  private baseUrl: string;
  
  constructor() {
    this.baseUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`;
  }
  
  async request<T = unknown>(endpoint: string, options: RequestInit = {}, attempt: number = 0): Promise<T> {
    try {
      // Get current session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        throw new Error('Not authenticated');
      }
      
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
        ...options.headers
      };
      
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers
      });
      
      // Handle 429 rate limit
      if (response.status === 429) {
        const retryAfter = response.headers.get('Retry-After') || '60';
        const errorData = await response.json().catch(() => ({}));
        throw new RateLimitError(
          errorData.error || `Rate limited. Please wait ${retryAfter} seconds.`,
          parseInt(retryAfter, 10)
        );
      }
      
      // Handle 401 unauthorized
      if (response.status === 401) {
        // Prevent infinite refresh loops
        if (attempt >= 1) {
          throw new AuthenticationError('Session expired. Please login again.');
        }

        // Try to refresh token (guarded to avoid concurrent refresh storms)
        const { error: refreshError } = await refreshSessionWithLock();

        if (refreshError) {
          const status = (refreshError as any)?.status as number | undefined;

          // IMPORTANT: Do NOT sign the user out on transient refresh failures
          // (rate limits, temporary network issues). Signing out here causes
          // users to get bounced back to /auth even though they just logged in.
          if (status === 429) {
            throw new RateLimitError(
              'Authentication is temporarily rate limited. Please wait a moment and retry.',
              60
            );
          }

          // For other non-auth transient failures, bubble up without nuking session
          if (!status || status >= 500) {
            throw new ApiError('Temporary authentication error. Please try again.', status ?? 500);
          }

          // For true auth failures (invalid/expired refresh token), sign out
          await supabase.auth.signOut();
          throw new AuthenticationError('Session expired. Please login again.');
        }

        // Retry with new token
        return this.request<T>(endpoint, options, attempt + 1);
      }
      
      // Handle 403 forbidden
      if (response.status === 403) {
        const errorData = await response.json().catch(() => ({}));
        throw new AuthorizationError(errorData.error || 'Access denied');
      }
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new ApiError(data.error || `API error: ${response.status}`, response.status);
      }
      
      return data as T;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      console.error(`API request failed for ${endpoint}:`, error);
      throw new ApiError(
        error instanceof Error ? error.message : 'Unknown error',
        500
      );
    }
  }
  
  // Secure transcription with retry logic
  async transcribeAudio(audioFile: File | Blob, language: string = 'en'): Promise<TranscriptionResult> {
    const audioBase64 = await this.fileToBase64(audioFile);
    
    return this.request<TranscriptionResult>('/transcribe-audio', {
      method: 'POST',
      body: JSON.stringify({
        audio: audioBase64,
        language,
        mimeType: audioFile.type || 'audio/webm'
      })
    });
  }
  
  // Secure CRM access with audit logging
  async getCrmConnections(): Promise<CrmConnection[]> {
    return this.request<CrmConnection[]>('/salesforce-sync', {
      method: 'POST',
      body: JSON.stringify({ action: 'get_connections' })
    });
  }
  
  async syncCrmContacts(connectionId: string): Promise<SyncResult> {
    return this.request<SyncResult>('/salesforce-sync', {
      method: 'POST',
      body: JSON.stringify({ 
        action: 'sync_contacts',
        connectionId 
      })
    });
  }
  
  // Secure call analysis
  async analyzeCall(transcript: string, analysisType: string = 'full'): Promise<AnalysisResult> {
    return this.request<AnalysisResult>('/analyze-recording', {
      method: 'POST',
      body: JSON.stringify({ transcript, analysisType })
    });
  }
  
  // Deal coaching with security
  async getDealCoaching(recordingId: string): Promise<CoachingResult> {
    return this.request<CoachingResult>('/deal-coach', {
      method: 'POST',
      body: JSON.stringify({ recordingId })
    });
  }
  
  // Generate call summary
  async generateCallSummary(recordingId: string): Promise<SummaryResult> {
    return this.request<SummaryResult>('/generate-call-summary', {
      method: 'POST',
      body: JSON.stringify({ recordingId })
    });
  }
  
  // Helper method to convert file to base64
  private async fileToBase64(file: File | Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result?.toString() || '';
        const base64 = result.split(',')[1] || '';
        resolve(base64);
      };
      reader.onerror = error => reject(error);
    });
  }
}

// Custom error classes
export class ApiError extends Error {
  constructor(message: string, public statusCode: number) {
    super(message);
    this.name = 'ApiError';
  }
}

export class AuthenticationError extends ApiError {
  constructor(message: string) {
    super(message, 401);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends ApiError {
  constructor(message: string) {
    super(message, 403);
    this.name = 'AuthorizationError';
  }
}

export class RateLimitError extends ApiError {
  constructor(message: string, public retryAfter: number) {
    super(message, 429);
    this.name = 'RateLimitError';
  }
}

// Type definitions
export interface TranscriptionResult {
  success: boolean;
  text?: string;
  words?: Array<{ text: string; start: number; end: number; confidence: number }>;
  duration?: number;
  service?: string;
  error?: string;
}

export interface CrmConnection {
  id: string;
  provider: string;
  instance_url: string;
  is_active: boolean;
  last_sync_at: string;
}

export interface SyncResult {
  success: boolean;
  contacts_synced?: number;
  error?: string;
}

export interface AnalysisResult {
  success: boolean;
  analysis?: {
    sentiment: number;
    topics: string[];
    insights: string[];
    score: number;
  };
  error?: string;
}

export interface CoachingResult {
  success: boolean;
  coaching?: {
    suggestions: string[];
    improvements: string[];
    strengths: string[];
  };
  error?: string;
}

export interface SummaryResult {
  success: boolean;
  summary?: {
    key_points: string[];
    action_items: string[];
    next_steps: string[];
  };
  error?: string;
}

// Export singleton instance
export const secureApi = new SecureApiClient();

// Convenience function for logging security events
export async function logSecurityEvent(
  action: string, 
  details?: Record<string, string | number | boolean | null>
): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    await supabase
      .from('security_logs')
      .insert([{
        user_id: user.id,
        action,
        details: details as Record<string, string | number | boolean | null> | null,
        user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
        created_at: new Date().toISOString()
      }]);
  } catch (error) {
    console.error('Failed to log security event:', error);
  }
}

// Password validation helper
export function validatePasswordStrength(password: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  if (!/[^A-Za-z0-9]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}
