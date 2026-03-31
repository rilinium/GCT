const BASE = 'https://open.canada.ca/data/en/api/3/action';
// Known active resource IDs from the proactive disclosure - contracts dataset
// (quarterly files; we try the most recent first and fall through on failure)
const RESOURCE_IDS = [
  'fac950c0-00d5-4ec1-a4d3-9cbebf98a305', // recent quarterly
  '9ee895c5-9df5-4854-9285-9d2e6b90277b',
  'd8f85d91-7dec-4fd1-8055-483b77225d8b', // dataset-level fallback
];

async function tryResource(resourceId, safeLimit, signal) {
  const params = new URLSearchParams({ resource_id: resourceId, limit: safeLimit, sort: 'award_value desc' });
  const r = await fetch(`${BASE}/datastore_search?${params}`, {
    signal,
    headers: { 'User-Agent': 'Mozilla/5.0', Accept: 'application/json' },
  });
  if (!r.ok) throw new Error(`${r.status}`);
  const data = await r.json();
  if (!data.success) throw new Error('CKAN error');
  return data.result?.records || [];
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 's-maxage=900, stale-while-revalidate=7200');

  const { from, to, limit = 500 } = req.query;
  const safeLimit = Math.min(parseInt(limit) || 500, 1000);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    let records = null;
    let lastErr = '';
    for (const id of RESOURCE_IDS) {
      try {
        records = await tryResource(id, safeLimit, controller.signal);
        break;
      } catch (e) {
        lastErr = e.message;
      }
    }
    clearTimeout(timeout);

    if (records === null) return res.status(502).json({ error: `All resources failed. Last: ${lastErr}` });

    const dateRe = /^\d{4}-\d{2}-\d{2}$/;
    if (dateRe.test(from)) records = records.filter(r => (r.contract_date || '') >= from);
    if (dateRe.test(to))   records = records.filter(r => (r.contract_date || '') <= to);

    return res.status(200).json({ result: { records } });
  } catch (e) {
    clearTimeout(timeout);
    return res.status(502).json({ error: e.message });
  }
}
