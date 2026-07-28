const BASE = 'https://open.canada.ca/data/en/api/3/action';
// "Contracts over $10,000" – individual contract records (1.26M total)
// package: d8f85d91-7dec-4fd1-8055-483b77225d8b
const RESOURCE_ID = 'fac950c0-00d5-4ec1-a4d3-9cbebf98a305';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  // Matches the UK/US proxies — the upstream resource is quarterly, so a short
  // edge cache costs nothing in freshness and keeps load off open.canada.ca.
  res.setHeader('Cache-Control', 's-maxage=900, stale-while-revalidate=7200');

  const { limit = 500 } = req.query;
  const safeLimit = Math.min(parseInt(limit) || 500, 1000);

  // datastore_search_sql is disabled on open.canada.ca; use plain datastore_search
  const params = new URLSearchParams({
    resource_id: RESOURCE_ID,
    limit: safeLimit,
    sort: 'contract_date desc',
  });

  try {
    const url = `${BASE}/datastore_search?${params}`;
    const dataRes = await fetch(url, {
      headers: { 'User-Agent': 'curl/7.88.1', Accept: 'application/json' },
      signal: AbortSignal.timeout(12000),
    });

    if (!dataRes.ok) {
      const body = await dataRes.text();
      return res.status(dataRes.status).json({ error: `datastore_search HTTP ${dataRes.status}`, body: body.slice(0, 300) });
    }

    const data = await dataRes.json();
    if (!data.success) {
      return res.status(502).json({ error: 'CKAN error', detail: data.error });
    }

    const records = data.result?.records || [];
    return res.status(200).json({ result: { records, total: data.result?.total } });
  } catch (e) {
    return res.status(502).json({ error: e.message, type: e.constructor?.name });
  }
}
