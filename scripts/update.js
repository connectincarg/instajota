// scripts/update.js
const fs    = require('fs');
const fetch = require('node-fetch');
const USER  = 'radiojotafm';

(async () => {
  // 1) Descarga HTML de la página
  const res  = await fetch(`https://www.instagram.com/${USER}/`, {
    headers: { 'User-Agent': 'Mozilla/5.0' }
  });
  const html = await res.text();

  // 2) Extrae JSON de window._sharedData
  const m = html.match(/window\._sharedData\s*=\s*(\{.+?\});<\/script>/s);
  if (!m) throw new Error('No se encontró window._sharedData');
  const sd = JSON.parse(m[1]);

  // 3) Navega hasta los edges
  const edges = 
    sd.entry_data?.ProfilePage?.[0]?.graphql?.user
      ?.edge_owner_to_timeline_media?.edges
    || [];

  // 4) Mapea los primeros 8 posts
  const posts = edges.slice(0, 8).map(e => {
    const n = e.node;
    return {
      link:    `https://instagram.com/p/${n.shortcode}`,
      thumb:   n.display_url,
      caption: n.edge_media_to_caption.edges[0]?.node?.text || '',
      type:    n.is_video ? 'video' : 'image',
      video:   n.is_video ? (n.video_url || '') : ''
    };
  });

  // 5) Escribe ig_posts.json
  fs.writeFileSync(
    'ig_posts.json',
    JSON.stringify({ posts }, null, 2)
  );
})().catch(err => {
  console.error('SCRAPER ERROR:', err.message);
  process.exit(1);
});
