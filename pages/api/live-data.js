// Live Data Feeds - Real-time data aggregator for The Blue Shark
// Supports: NewsAPI, Google Trends (via SerpAPI), and more

const SERP_API_KEY = process.env.SERP_API_KEY;

// Fetch latest news via SerpAPI Google News (works in production)
async function fetchNews(query) {
  if (!SERP_API_KEY) return null;
  try {
    const url = `https://serpapi.com/search.json?engine=google_news&q=${encodeURIComponent(query + ' 2026')}&gl=id&hl=id&api_key=${SERP_API_KEY}`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.news_results?.length > 0) {
      return data.news_results.slice(0, 5).map(a => ({
        title: a.title,
        source: a.source?.name || a.source,
        date: a.date,
        snippet: a.snippet || a.title,
      }));
    }
    return null;
  } catch (e) {
    console.error('SerpAPI News error:', e);
    return null;
  }
}

// Fetch trending topics from Google Trends via SerpAPI
async function fetchTrends(query, country = 'id') {
  if (!SERP_API_KEY) return null;
  try {
    const url = `https://serpapi.com/search.json?engine=google_trends&q=${encodeURIComponent(query)}&geo=${country.toUpperCase()}&api_key=${SERP_API_KEY}`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.interest_over_time) {
      return {
        timeline: data.interest_over_time.timeline_data?.slice(-10).map(t => ({
          date: t.date,
          values: t.values,
        })),
        averages: data.interest_over_time.averages,
      };
    }
    return null;
  } catch (e) {
    console.error('SerpAPI Trends error:', e);
    return null;
  }
}

// Fetch Google search results via SerpAPI for real-time info
async function fetchSearchResults(query) {
  if (!SERP_API_KEY) return null;
  try {
    const url = `https://serpapi.com/search.json?engine=google&q=${encodeURIComponent(query + ' 2026')}&gl=id&hl=id&num=5&api_key=${SERP_API_KEY}`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.organic_results) {
      return data.organic_results.map(r => ({
        title: r.title,
        snippet: r.snippet,
        link: r.link,
        date: r.date,
      }));
    }
    return null;
  } catch (e) {
    console.error('SerpAPI Search error:', e);
    return null;
  }
}

// Main handler
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { query, type = 'all' } = req.body;

  if (!query) {
    return res.status(400).json({ error: 'Missing query' });
  }

  const results = {};

  try {
    if (type === 'all' || type === 'news') {
      results.news = await fetchNews(query);
    }
    if (type === 'all' || type === 'trends') {
      results.trends = await fetchTrends(query);
    }
    if (type === 'all' || type === 'search') {
      results.search = await fetchSearchResults(query);
    }

    return res.status(200).json({
      success: true,
      query,
      timestamp: new Date().toISOString(),
      data: results,
    });
  } catch (error) {
    console.error('Live data error:', error);
    return res.status(500).json({ error: 'Failed to fetch live data' });
  }
}
