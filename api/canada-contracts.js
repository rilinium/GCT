const DATASET_ID = 'd8f85d91-7dec-4fd1-8055-483b77225d8b';
const BASE = 'https://open.canada.ca/data/en/api/3/action';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 's-maxage=900, stale-while-revalidate=7200');

  const { from, to, limit = 500 } = req.query;
  const safeLimit = Math.min(parseInt(limit) || 500, 1000);

  try {
    // Step 1: get resource IDs from the dataset
    const pkgRes = await fetch(`${BASE}/package_show?id=${DATASET_ID}`, {
      headers: { 'User-Agent': 'Mozilla/5.0', Accept: 'application/json' },
    });
    if (!pkgRes.ok) return res.status(pkgRes.status).json({ error: `package_show ${pkgRes.status}` });
    const pkg = await pkgRes.json();
    const resources = (pkg.result?.resources || []).filter(r => r.datastore_active);
    if (!resources.length) return res.status(404).json({ error: 'No active datastore resources found' });

    // Use the most recently modified resource
    resources.sort((a, b) => (b.last_modified || b.created || '').localeCompare(a.last_modified || a.created || ''));
    const resourceId = resources[0].id;

    // Step 2: query with datastore_search
    const params = new URLSearchParams({
      resource_id: resourceId,
      limit: safeLimit,
      sort: 'award_value desc',
    });
    if (from || to) {
      // CKAN datastore_search doesn't support range filters natively — use q for basic text, or filters
      // We'll fetch and filter on our side for date range (limit is already capped)
    }

    const dataRes = await fetch(`${BASE}/datastore_search?${params}`, {
      headers: { 'User-Agent': 'Mozilla/5.0', Accept: 'application/json' },
    });
    if (!dataRes.ok) return res.status(dataRes.status).json({ error: `datastore_search ${dataRes.status}` });
    const data = await dataRes.json();

    // Filter by date range if provided
    const dateRe = /^\d{4}-\d{2}-\d{2}$/;
    let records = data.result?.records || [];
    if (dateRe.test(from)) records = records.filter(r => (r.contract_date || '') >= from);
    if (dateRe.test(to))   records = records.filter(r => (r.contract_date || '') <= to);

    return res.status(200).json({ result: { records } });
  } catch (e) {
    return res.status(502).json({ error: e.message });
  }
}
