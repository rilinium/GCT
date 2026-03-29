/**
 * GET /api/admin/callback?code=...&state=...
 * GitHub redirects here after OAuth authorization.
 * Exchanges the code for an access token, verifies the user is the
 * allowed admin, generates a session token, and redirects back to the app.
 *
 * Required env vars:
 *   GITHUB_CLIENT_ID      — OAuth App client ID
 *   GITHUB_CLIENT_SECRET  — OAuth App client secret
 *   ADMIN_GITHUB_USER     — your GitHub username (case-insensitive)
 *   ADMIN_SECRET          — same string used in auth.js and overrides.js
 */
import { createHmac } from 'crypto';

export default async function handler(req, res) {
  const { code, state, error } = req.query;

  const secret       = process.env.ADMIN_SECRET;
  const clientId     = process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;
  const allowedUser  = (process.env.ADMIN_GITHUB_USER || '').toLowerCase();

  const host     = req.headers['x-forwarded-host'] || req.headers.host;
  const protocol = req.headers['x-forwarded-proto'] || 'https';
  const base     = process.env.APP_BASE_URL || `${protocol}://${host}`;

  const fail = (reason) => {
    res.setHeader('Cache-Control', 'no-store');
    return res.redirect(302, `${base}/?admin_error=${encodeURIComponent(reason)}`);
  };

  if (error)  return fail(error);
  if (!code)  return fail('no_code');
  if (!secret || !clientId || !clientSecret || !allowedUser) return fail('not_configured');

  // ── Verify CSRF state ────────────────────────────────────────────────────────
  if (!state || !state.includes('.')) return fail('invalid_state');
  const dotIdx = state.indexOf('.');
  const ts     = state.slice(0, dotIdx);
  const given  = state.slice(dotIdx + 1);
  const expect = createHmac('sha256', secret)
    .update(`oauth:${ts}`)
    .digest('hex')
    .slice(0, 24);
  const { timingSafeEqual } = await import('crypto');
  const stateOk = given.length === expect.length &&
    timingSafeEqual(Buffer.from(given, 'utf8'), Buffer.from(expect, 'utf8'));
  if (!stateOk)                                        return fail('state_mismatch');
  if (Date.now() - parseInt(ts, 10) > 600_000)         return fail('state_expired');

  // ── Exchange code for access token ───────────────────────────────────────────
  let accessToken;
  try {
    const tr = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({ client_id: clientId, client_secret: clientSecret, code }),
    });
    const td = await tr.json();
    if (!td.access_token) return fail('token_exchange_failed');
    accessToken = td.access_token;
  } catch {
    return fail('token_fetch_error');
  }

  // ── Fetch GitHub user ────────────────────────────────────────────────────────
  let login;
  try {
    const ur = await fetch('https://api.github.com/user', {
      headers: { Authorization: `token ${accessToken}`, 'User-Agent': 'contractviewer/1.0' },
    });
    const ud = await ur.json();
    if (!ud.login) return fail('user_fetch_failed');
    login = ud.login.toLowerCase();
  } catch {
    return fail('user_fetch_error');
  }

  // ── Authorize ────────────────────────────────────────────────────────────────
  if (login !== allowedUser) return fail('unauthorized');

  // ── Generate session token (48-hour HMAC, matched by overrides.js) ───────────
  const slot  = Math.floor(Date.now() / 3_600_000);
  const token = createHmac('sha256', secret)
    .update(`${login}:${slot}`)
    .digest('hex');

  res.setHeader('Cache-Control', 'no-store');
  res.redirect(302, `${base}/?admin_token=${token}`);
}
