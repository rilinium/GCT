const BASE = 'https://open.canada.ca/data/en/api/3/action';
const DATASET = 'd8f85d91-7dec-4fd1-8055-483b77225d8b';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'no-store');

  const { from, to, limit = 500 } = req.query;
  const safeLimit = Math.min(parseInt(limit) || 500, 1000);

  // Step 1: probe the API with a lightweight call
  let pkgText = '';
  try {
    const probe = await fetch(`${BASE}/package_show?id=${DATASET}`, {
      headers: { 'User-Agent': 'curl/7.88.1', Accept: 'application/json' },
      signal: AbortSignal.timeout(9000),
    });
    pkgText = await probe.text();
    if (!probe.ok) return res.status(probe.status).json({ error: `package_show HTTP ${probe.status}`, body: pkgText.slice(0, 300) });

    const pkg = JSON.parse(pkgText);
    const resources = (pkg.result?.resources || []).filter(r => r.datastore_active);
    if (!resources.length) return res.status(404).json({ error: 'No active datastore resources', all: pkg.result?.resources?.map(r => ({ id: r.id, name: r.name, active: r.datastore_active })) });

    resources.sort((a, b) => (b.last_modified || b.created || '').localeCompare(a.last_modified || a.created || ''));
    const resourceId = resources[0].id;

    const params = new URLSearchParams({ resource_id: resourceId, limit: safeLimit, sort: 'award_value desc' });
    const dataRes = await fetch(`${BASE}/datastore_search?${params}`, {
      headers: { 'User-Agent': 'curl/7.88.1', Accept: 'application/json' },
      signal: AbortSignal.timeout(9000),
    });
    if (!dataRes.ok) return res.status(dataRes.status).json({ error: `datastore_search HTTP ${dataRes.status}` });

    const data = await dataRes.json();
    let records = data.result?.records || [];
    const dateRe = /^\d{4}-\d{2}-\d{2}$/;
    if (dateRe.test(from)) records = records.filter(r => (r.contract_date || '') >= from);
    if (dateRe.test(to))   records = records.filter(r => (r.contract_date || '') <= to);

    return res.status(200).json({ result: { records } });
  } catch (e) {
    return res.status(502).json({ error: e.message, type: e.constructor?.name, pkgPreview: pkgText.slice(0, 200) });
  }
}
