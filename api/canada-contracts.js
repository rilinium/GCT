export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 's-maxage=900, stale-while-revalidate=7200');

  const { from, to, limit = 500 } = req.query;

  // Sanitize dates — must be YYYY-MM-DD
  const dateRe = /^\d{4}-\d{2}-\d{2}$/;
  const safeFrom = dateRe.test(from) ? from : null;
  const safeTo   = dateRe.test(to)   ? to   : null;
  const safeLimit = Math.min(parseInt(limit) || 500, 1000);

  const conditions = [`award_value IS NOT NULL`, `vendor_name IS NOT NULL`];
  if (safeFrom) conditions.push(`contract_date >= '${safeFrom}'`);
  if (safeTo)   conditions.push(`contract_date <= '${safeTo}'`);

  const sql = `SELECT reference_number, vendor_name, award_value, description_en, owner_org_title, contract_date, vendor_province, vendor_city FROM "d8f85d91-7dec-4fd1-8055-483b77225d8b" WHERE ${conditions.join(' AND ')} ORDER BY award_value DESC LIMIT ${safeLimit}`;

  try {
    const url = `https://open.canada.ca/data/en/api/3/action/datastore_search_sql?sql=${encodeURIComponent(sql)}`;
    const r = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0', 'Accept': 'application/json' } });
    if (!r.ok) return res.status(r.status).json({ error: `Upstream ${r.status}` });
    const data = await r.json();
    return res.status(200).json(data);
  } catch (e) {
    return res.status(502).json({ error: e.message });
  }
}
