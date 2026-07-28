/**
 * GET  /api/admin/overrides          — returns all overrides (public, no auth)
 * POST /api/admin/overrides          — upsert/delete an override (requires Bearer token)
 *
 * POST body: { company, ticker?, description? }
 *   Pass ticker: '' or description: '' to clear that field.
 *   Pass both as '' to delete the entire company override.
 *
 * Overrides are stored in a GitHub Gist as contractviewer-overrides.json.
 *
 * Requires env vars:
 *   ADMIN_GITHUB_USER    — your GitHub username (must match who logs in via OAuth)
 *   ADMIN_SECRET         — same as auth.js / callback.js
 *   GITHUB_TOKEN         — Personal Access Token with 'gist' scope
 *   OVERRIDES_GIST_ID    — ID of an existing gist (public or private)
 *                          Create one at https://gist.github.com and grab the ID from the URL
 */
import { createHmac, timingSafeEqual } from 'crypto';

const FILENAME = 'contractviewer-overrides.json';
const HMAC_BYTES = 32; // SHA-256 = 32 bytes = 64 hex chars

// ── Token verification ────────────────────────────────────────────────────────
// Uses timingSafeEqual to prevent timing-based token inference.
// Always runs all 48 slot checks regardless of early match to avoid
// leaking which slot matched via response time.
function verifyToken(token) {
  const secret = process.env.ADMIN_SECRET;
  const user   = (process.env.ADMIN_GITHUB_USER || '').toLowerCase();
  if (!secret || !user || !token) return false;

  // Reject obviously wrong lengths before buffer allocation
  if (typeof token !== 'string' || token.length !== HMAC_BYTES * 2) return false;

  let tokenBuf;
  try {
    tokenBuf = Buffer.from(token, 'hex');
    if (tokenBuf.length !== HMAC_BYTES) return false;
  } catch {
    return false;
  }

  const now = Math.floor(Date.now() / 3_600_000);
  let valid = false;
  for (let i = 0; i < 48; i++) {
    const expected = createHmac('sha256', secret)
      .update(`${user}:${now - i}`)
      .digest();
    // timingSafeEqual throws if buffers differ in length — lengths are both
    // HMAC_BYTES here so it's safe. We OR instead of short-circuit so all
    // 48 slots always run (no timing leak on which slot matched).
    if (timingSafeEqual(tokenBuf, expected)) valid = true;
  }
  return valid;
}

// ── GitHub Gist I/O ──────────────────────────────────────────────────────────
async function readGist() {
  const id = process.env.OVERRIDES_GIST_ID;
  if (!id) return {};
  const headers = { 'User-Agent': 'contractviewer/1.0' };
  if (process.env.GITHUB_TOKEN) headers['Authorization'] = `token ${process.env.GITHUB_TOKEN}`;
  const r = await fetch(`https://api.github.com/gists/${id}`, { headers });
  if (!r.ok) return {};
  const data = await r.json();
  const content = data.files?.[FILENAME]?.content;
  if (!content) return {};
  try { return JSON.parse(content); } catch { return {}; }
}

async function writeGist(overrides) {
  const id    = process.env.OVERRIDES_GIST_ID;
  const token = process.env.GITHUB_TOKEN;
  if (!id || !token) throw new Error('OVERRIDES_GIST_ID or GITHUB_TOKEN not set');
  const r = await fetch(`https://api.github.com/gists/${id}`, {
    method: 'PATCH',
    headers: {
      'Authorization': `token ${token}`,
      'User-Agent': 'contractviewer/1.0',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      files: { [FILENAME]: { content: JSON.stringify(overrides, null, 2) } },
    }),
  });
  if (!r.ok) {
    const err = await r.text();
    throw new Error(`GitHub API ${r.status}: ${err.slice(0, 200)}`);
  }
}

// ── Handler ──────────────────────────────────────────────────────────────────
export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  // GET — anyone can read overrides
  if (req.method === 'GET') {
    try {
      const overrides = await readGist();
      // Every page load and every tab refocus hits this, and each miss proxies to
      // the GitHub Gist API (60 req/hr unauthenticated). Cache at the edge so
      // traffic doesn't exhaust the rate limit; a 60s lag on an override is fine.
      res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=600');
      return res.status(200).json(overrides);
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }

  // POST — admin only
  if (req.method === 'POST') {
    const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
    if (!verifyToken(token)) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    try {
      const { company, ticker, description } = req.body || {};
      if (!company) return res.status(400).json({ error: 'company is required' });

      const overrides = await readGist();

      const clearTicker = ticker === '' || ticker === null;
      const clearDesc   = description === '' || description === null;

      if (clearTicker && clearDesc) {
        // Remove all overrides for this company
        delete overrides[company];
      } else {
        if (!overrides[company]) overrides[company] = {};
        if (ticker      !== undefined) overrides[company].ticker      = clearTicker  ? undefined : ticker;
        if (description !== undefined) overrides[company].description = clearDesc    ? undefined : description;
        // Drop undefined keys
        Object.keys(overrides[company]).forEach(k => {
          if (overrides[company][k] === undefined) delete overrides[company][k];
        });
        if (!Object.keys(overrides[company]).length) delete overrides[company];
      }

      await writeGist(overrides);
      return res.status(200).json({ ok: true, overrides });
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }

  return res.status(405).end();
}
