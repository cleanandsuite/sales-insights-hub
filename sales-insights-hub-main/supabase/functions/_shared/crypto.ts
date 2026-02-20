/**
 * Shared encryption utilities for sensitive data
 * Uses AES-GCM for authenticated encryption
 */

// Base64 encoding/decoding utilities
function base64Encode(data: Uint8Array): string {
  return btoa(String.fromCharCode(...data));
}

function base64Decode(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

// Get or derive encryption key from environment
async function getEncryptionKey(): Promise<CryptoKey> {
  const keyMaterial = Deno.env.get('TOKEN_ENCRYPTION_KEY');
  
  if (!keyMaterial) {
    throw new Error('TOKEN_ENCRYPTION_KEY environment variable not set');
  }
  
  // Derive a key from the secret using PBKDF2
  const encoder = new TextEncoder();
  const keyData = encoder.encode(keyMaterial);
  
  const baseKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'PBKDF2' },
    false,
    ['deriveBits', 'deriveKey']
  );
  
  // Use a fixed salt (derived from app identifier) for deterministic key derivation
  const salt = encoder.encode('gritcall-oauth-tokens-v1');
  
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: 100000,
      hash: 'SHA-256'
    },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypt a string value using AES-GCM
 * Returns base64-encoded ciphertext with IV prepended
 */
export async function encryptToken(plaintext: string): Promise<string> {
  const key = await getEncryptionKey();
  const encoder = new TextEncoder();
  const data = encoder.encode(plaintext);
  
  // Generate random IV for each encryption
  const iv = crypto.getRandomValues(new Uint8Array(12));
  
  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    data
  );
  
  // Prepend IV to ciphertext
  const combined = new Uint8Array(iv.length + ciphertext.byteLength);
  combined.set(iv);
  combined.set(new Uint8Array(ciphertext), iv.length);
  
  return base64Encode(combined);
}

/**
 * Decrypt a base64-encoded ciphertext
 * Expects IV to be prepended to ciphertext
 */
export async function decryptToken(encrypted: string): Promise<string> {
  const key = await getEncryptionKey();
  
  const combined = base64Decode(encrypted);
  
  // Extract IV (first 12 bytes) and ciphertext
  const iv = combined.slice(0, 12);
  const ciphertext = combined.slice(12);
  
  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    ciphertext
  );
  
  const decoder = new TextDecoder();
  return decoder.decode(decrypted);
}

/**
 * Check if a value appears to be encrypted (base64 with expected length)
 * Used for backward compatibility during migration
 */
export function isEncrypted(value: string): boolean {
  // Encrypted tokens will be base64 and have at least IV (12 bytes) + some ciphertext
  // Minimum length: 12 (IV) + 1 (min data) = 13 bytes = ~18 base64 chars
  // Salesforce tokens are typically 300+ chars unencrypted
  try {
    // If it's valid base64 and decodes to reasonable length, likely encrypted
    const decoded = base64Decode(value);
    // Encrypted values have IV (12) + at least some ciphertext
    // Unencrypted Salesforce tokens are much longer and don't decode cleanly
    return decoded.length >= 13 && decoded.length < 1000;
  } catch {
    return false;
  }
}
