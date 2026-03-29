export default async function handler(req, res) {
  const { ticker, search } = req.query;

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');

  try {
    if (search) {
      const url = `https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(search)}&quotesCount=3&newsCount=0&enableFuzzyQuery=false`;
      const r = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      const data = await r.json();
      return res.status(200).json(data);
    }

    if (ticker) {
      const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ticker)}?interval=1d&range=5d`;
      const r = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      const data = await r.json();
      return res.status(200).json(data);
    }

    return res.status(400).json({ error: 'Missing ticker or search param' });
  } catch (e) {
    return res.status(502).json({ error: e.message });
  }
}
