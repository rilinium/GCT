export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 's-maxage=900, stale-while-revalidate=7200');

  const { publishedFrom, publishedTo, size = 100 } = req.query;

  const body = {
    searchCriteria: {
      types: ['Contract'],
      statuses: ['Awarded'],
      ...(publishedFrom ? { publishedFrom } : {}),
      ...(publishedTo   ? { publishedTo }   : {}),
    },
    size: Math.min(parseInt(size) || 100, 1000),
  };

  try {
    const r = await fetch(
      'https://www.contractsfinder.service.gov.uk/api/rest/2/search_notices/json',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'User-Agent': 'Mozilla/5.0' },
        body: JSON.stringify(body),
      }
    );
    if (!r.ok) return res.status(r.status).json({ error: `Upstream ${r.status}` });
    const data = await r.json();
    return res.status(200).json(data);
  } catch (e) {
    return res.status(502).json({ error: e.message });
  }
}
