export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 's-maxage=900, stale-while-revalidate=7200');

  const { page = 0, size = 100, publishedFrom, publishedTo, order = 'NewestFirst' } = req.query;

  const params = new URLSearchParams({ noticeType: 'AWARD', page, size, order });
  if (publishedFrom) params.set('publishedFrom', publishedFrom);
  if (publishedTo)   params.set('publishedTo',   publishedTo);

  try {
    const r = await fetch(
      `https://www.contractsfinder.service.gov.uk/api/rest/2/search_notices/json?${params}`,
      { headers: { 'Accept': 'application/json', 'User-Agent': 'Mozilla/5.0' } }
    );
    if (!r.ok) return res.status(r.status).json({ error: `Upstream ${r.status}` });
    const data = await r.json();
    return res.status(200).json(data);
  } catch (e) {
    return res.status(502).json({ error: e.message });
  }
}
