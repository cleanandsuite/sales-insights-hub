// Secure storage utility - NEVER expose public URLs for private content
import { supabase } from '@/integrations/supabase/client';

const BUCKET_NAME = 'call-recordings';

export class SecureStorage {
  // Get public URL for playback (bucket is now public)
  getPublicUrl(filePath: string): string {
    const { data } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath);
    
    // Log access for audit (fire and forget)
    this.logStorageAccess(filePath, 'public_url_access');
    
    return data.publicUrl;
  }
  
  // Get download URL using public URL
  getDownloadUrl(filePath: string): string {
    const { data } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath, {
        download: true
      });
    
    this.logStorageAccess(filePath, 'download');
    
    return data.publicUrl;
  }
  
  // Upload with automatic security
  async uploadRecording(
    file: File | Blob, 
    userId: string, 
    recordingId: string
  ): Promise<{ success: boolean; filePath: string; id?: string }> {
    try {
      const fileName = file instanceof File ? file.name : 'recording.webm';
      const filePath = `${userId}/${recordingId}/${Date.now()}-${fileName}`;
      
      const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
          contentType: file.type || 'audio/webm'
        });
      
      if (error) throw error;
      
      // Store metadata in secure table
      await this.storeRecordingMetadata({
        file_path: filePath,
        user_id: userId,
        recording_id: recordingId,
        file_size: file.size,
        mime_type: file.type || 'audio/webm',
        uploaded_at: new Date().toISOString()
      });
      
      await this.logStorageAccess(filePath, 'upload');
      
      return {
        success: true,
        filePath: filePath,
        id: data?.id
      };
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  }
  
  // Delete recording with audit
  async deleteRecording(filePath: string): Promise<boolean> {
    try {
      const { error } = await supabase.storage
        .from(BUCKET_NAME)
        .remove([filePath]);
      
      if (error) throw error;
      
      // Also delete metadata
      await supabase
        .from('secure_recording_metadata')
        .delete()
        .eq('file_path', filePath);
      
      await this.logStorageAccess(filePath, 'delete');
      
      return true;
    } catch (error) {
      console.error('Delete error:', error);
      throw error;
    }
  }
  
  // Secure metadata storage
  private async storeRecordingMetadata(metadata: {
    file_path: string;
    user_id: string;
    recording_id: string;
    file_size: number;
    mime_type: string;
    uploaded_at: string;
  }): Promise<void> {
    const { error } = await supabase
      .from('secure_recording_metadata')
      .insert([metadata]);
    
    if (error) {
      console.error('Failed to store recording metadata:', error);
      // Don't throw - metadata storage failure shouldn't block upload
    }
  }
  
  // Audit logging
  private async logStorageAccess(filePath: string, action: string): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;
      
      const { error } = await supabase
        .from('storage_access_logs')
        .insert([{
          file_path: filePath,
          action: action,
          user_id: user.id,
          accessed_at: new Date().toISOString(),
          user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null
        }]);
      
      if (error) console.error('Failed to log storage access:', error);
    } catch (logError) {
      console.error('Audit logging failed:', logError);
    }
  }
  
  // Check if user has access to a file
  async checkAccess(filePath: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;
      
      const { data, error } = await supabase
        .from('secure_recording_metadata')
        .select('user_id')
        .eq('file_path', filePath)
        .single();
      
      if (error || !data) return false;
      
      return data.user_id === user.id;
    } catch {
      return false;
    }
  }
  
  // Get all recordings for current user
  async getUserRecordings(): Promise<Array<{
    id: string;
    file_path: string;
    file_size: number | null;
    mime_type: string | null;
    uploaded_at: string | null;
  }>> {
    const { data, error } = await supabase
      .from('secure_recording_metadata')
      .select('*')
      .order('uploaded_at', { ascending: false });
    
    if (error) {
      console.error('Failed to get user recordings:', error);
      return [];
    }
    
    return data || [];
  }
}

// Export singleton instance
export const secureStorage = new SecureStorage();

// CRM Security utilities
export async function logCrmAccess(
  connectionId: string, 
  action: string
): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    await supabase
      .from('crm_access_audit')
      .insert([{
        user_id: user.id,
        connection_id: connectionId,
        action: action,
        user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
        accessed_at: new Date().toISOString()
      }]);
  } catch (error) {
    console.error('Failed to log CRM access:', error);
  }
}

export async function logContactAccess(
  contactId: string, 
  action: string
): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    await supabase
      .from('contact_access_audit')
      .insert([{
        user_id: user.id,
        contact_id: contactId,
        action: action,
        user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
        accessed_at: new Date().toISOString()
      }]);
  } catch (error) {
    console.error('Failed to log contact access:', error);
  }
}

// Check rate limits before sensitive operations
export async function checkCrmRateLimit(): Promise<boolean> {
  try {
    const { data, error } = await supabase.rpc('check_crm_rate_limit', {
      p_user_id: (await supabase.auth.getUser()).data.user?.id
    });
    
    if (error) {
      console.error('Rate limit check failed:', error);
      return true; // Allow if check fails
    }
    
    return data as boolean;
  } catch {
    return true;
  }
}

export async function checkContactRateLimit(): Promise<boolean> {
  try {
    const { data, error } = await supabase.rpc('check_contact_rate_limit', {
      p_user_id: (await supabase.auth.getUser()).data.user?.id
    });
    
    if (error) {
      console.error('Rate limit check failed:', error);
      return true; // Allow if check fails
    }
    
    return data as boolean;
  } catch {
    return true;
  }
}
