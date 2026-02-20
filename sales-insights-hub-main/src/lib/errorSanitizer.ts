/**
 * Sanitizes error messages to prevent database schema and internal details from leaking to users
 */
export function getSafeErrorMessage(error: unknown, fallback: string): string {
  if (!error) return fallback;
  
  const message = error instanceof Error ? error.message : String(error);
  
  // Map common database errors to user-friendly messages
  if (message.includes('unique constraint') || message.includes('duplicate key')) {
    return 'This item already exists';
  }
  if (message.includes('foreign key') || message.includes('violates foreign key')) {
    return 'Invalid reference to another record';
  }
  if (message.includes('not-null') || message.includes('null value')) {
    return 'A required field is missing';
  }
  if (message.includes('permission denied') || message.includes('insufficient_privilege')) {
    return 'You do not have permission to perform this action';
  }
  if (message.includes('RLS') || message.includes('row-level security')) {
    return 'You do not have access to this resource';
  }
  if (message.includes('JWT') || message.includes('token')) {
    return 'Your session has expired. Please sign in again';
  }
  if (message.includes('network') || message.includes('fetch')) {
    return 'Network error. Please check your connection';
  }
  if (message.includes('timeout')) {
    return 'Request timed out. Please try again';
  }
  if (message.includes('storage') && message.includes('bucket')) {
    return 'File storage error. Please try again';
  }
  if (message.includes('already exists')) {
    return 'This item already exists';
  }
  if (message.includes('Invalid login credentials') || message.includes('invalid_credentials')) {
    return 'Invalid email or password';
  }
  if (message.includes('Email not confirmed')) {
    return 'Please confirm your email address';
  }
  if (message.includes('User already registered')) {
    return 'An account with this email already exists';
  }
  if (message.includes('Password')) {
    return 'Invalid password format';
  }
  
  // For any unrecognized errors, return the generic fallback
  // Log the actual error for debugging (server-side only in edge functions)
  console.error('Unhandled error:', message);
  return fallback;
}

/**
 * Wrapper for toast error messages
 */
export function getToastErrorMessage(error: unknown, operation: string): string {
  const fallbacks: Record<string, string> = {
    upload: 'Unable to upload file. Please try again',
    download: 'Unable to download file. Please try again',
    save: 'Unable to save changes. Please try again',
    delete: 'Unable to delete. Please try again',
    fetch: 'Unable to load data. Please try again',
    auth: 'Authentication failed. Please try again',
    sync: 'Sync failed. Please try again',
    default: 'An error occurred. Please try again'
  };
  
  return getSafeErrorMessage(error, fallbacks[operation] || fallbacks.default);
}
