const BASE = 'https://open.canada.ca/data/en/api/3/action';
// Direct resource ID for "Contracts over $10,000" – individual contract records
// (package d8f85d91-7dec-4fd1-8055-483b77225d8b, resource fac950c0-00d5-4ec1-a4d3-9cbebf98a305)
const RESOURCE_ID = 'fac950c0-00d5-4ec1-a4d3-9cbebf98a305';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'no-store');

  const { from, to, limit = 500 } = req.query;
  const safeLimit = Math.min(parseInt(limit) || 500, 1000);

  // Build SQL with optional date range filter
  let where = '';
  if (from && to) {
    where = `WHERE contract_date >= '${from}' AND contract_date <= '${to}'`;
  } else if (from) {
    where = `WHERE contract_date >= '${from}'`;
  } else if (to) {
    where = `WHERE contract_date <= '${to}'`;
  }

  const sql = `SELECT * FROM "${RESOURCE_ID}" ${where} ORDER BY contract_date DESC LIMIT ${safeLimit}`;

  try {
    const url = `${BASE}/datastore_search_sql?sql=${encodeURIComponent(sql)}`;
    const dataRes = await fetch(url, {
      headers: { 'User-Agent': 'curl/7.88.1', Accept: 'application/json' },
      signal: AbortSignal.timeout(12000),
    });

    if (!dataRes.ok) {
      const body = await dataRes.text();
      return res.status(dataRes.status).json({ error: `datastore_search_sql HTTP ${dataRes.status}`, body: body.slice(0, 300) });
    }

    const data = await dataRes.json();
    if (!data.success) {
      return res.status(502).json({ error: 'CKAN error', detail: data.error });
    }

    const records = data.result?.records || [];
    const sampleKeys = records[0] ? Object.keys(records[0]) : [];
    return res.status(200).json({ result: { records }, _debug: { sampleKeys, count: records.length } });
  } catch (e) {
    return res.status(502).json({ error: e.message, type: e.constructor?.name });
  }
}
