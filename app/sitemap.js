export default function sitemap() {
  const baseUrl = 'https://the-blue-shark-ars8.vercel.app';
  return [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: baseUrl + '/landing', lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
  ];
}
