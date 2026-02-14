/**
 * Secure CORS configuration for SellSig Edge Functions
 * 
 * Allowed origins:
 * - https://sellsig.com (production)
 * - http://localhost:* (development)
 * - http://localhost:5173 (Vite dev server)
 * - http://localhost:3000 (Alternative dev server)
 */

// Allowed origins - restrict to these domains only
const ALLOWED_ORIGINS = [
  'https://sellsig.com',
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:8080',
];

/**
 * Get CORS headers based on the request origin
 * Only allows requests from approved origins
 */
export function getCorsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get('Origin') || '';
  
  // Check if origin is in allowed list
  // For development, also allow any localhost origin
  const isLocalhost = origin.match(/^http:\/\/localhost:\d+$/);
  const isAllowedOrigin = ALLOWED_ORIGINS.includes(origin) || isLocalhost;
  
  const allowedOrigin = isAllowedOrigin ? origin : ALLOWED_ORIGINS[0];
  
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  };
}

/**
 * Handle CORS preflight request
 */
export function handleCorsPreflight(req: Request): Response | null {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: getCorsHeaders(req) });
  }
  return null;
}

// Legacy compatibility - use getCorsHeaders() instead for production
export const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://sellsig.com',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};
