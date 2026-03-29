/**
 * GET /api/admin/auth
 * Redirects the browser to GitHub OAuth authorization.
 * After the user approves, GitHub redirects to /api/admin/callback.
 *
 * Required env vars:
 *   GITHUB_CLIENT_ID     — OAuth App client ID (public, but kept server-side)
 *   ADMIN_SECRET         — random high-entropy string for HMAC + CSRF state
 *                          generate: openssl rand -hex 32
 */
import { createHmac } from 'crypto';

export default function handler(req, res) {
  const clientId = process.env.GITHUB_CLIENT_ID;
  const secret   = process.env.ADMIN_SECRET;

  if (!clientId || !secret) {
    return res.status(503).send('Admin OAuth not configured (missing env vars)');
  }

  // CSRF state: timestamp.hmac — verified in callback
  const ts   = Date.now();
  const hmac = createHmac('sha256', secret)
    .update(`oauth:${ts}`)
    .digest('hex')
    .slice(0, 24);
  const state = `${ts}.${hmac}`;

  const host     = req.headers['x-forwarded-host'] || req.headers.host;
  const protocol = req.headers['x-forwarded-proto'] || 'https';
  const base     = process.env.APP_BASE_URL || `${protocol}://${host}`;

  const params = new URLSearchParams({
    client_id:    clientId,
    redirect_uri: `${base}/api/admin/callback`,
    scope:        'read:user',
    state,
  });

  res.setHeader('Cache-Control', 'no-store');
  res.redirect(302, `https://github.com/login/oauth/authorize?${params}`);
}
