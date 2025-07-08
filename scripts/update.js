// scripts/update.js
const fs    = require('fs');
const fetch = require('node-fetch');
const USER  = 'radiojotafm';

(async () => {
  // 1) Descarga HTML
  const res  = await fetch(`https://www.instagram.com/${USER}/`, {
    headers: { 'User-Agent': 'Mozilla/5.0' }
  });
  const html = await res.text();

  // 2) Extrae JSON de window.__additionalDataLoaded
  const re = new RegExp(
    `window\\.__additionalDataLoaded\\('/${USER}/',\\s*(${  
      '{[\\s\\S]*?}'  
    })\\);`
  );
  const m = html.match(re);
  if (!m) throw new Error('No se encontró additionalDataLoaded');
  const data = JSON.parse(m[1]);

  // 3) Llegar a los edges
  const edges =
    data?.graphql?.user?.edge_owner_to_timeline_media?.edges || [];

  // 4) Mapear 8 posts
  const posts = edges.slice(0, 8).map(e => {
    const n = e.node;
    return {
      link:    `https://instagram.com/p/${n.shortcode}`,
      thumb:   n.display_url || n.thumbnail_src,
      caption: n.edge_media_to_caption?.edges[0]?.node?.text || '',
      type:    n.is_video ? 'video' : 'image',
      video:   n.is_video ? (n.video_url || '') : ''
    };
  });

  // 5) Escribir ig_posts.json
  fs.writeFileSync('ig_posts.json', JSON.stringify({ posts }, null, 2));
  console.log('✔ ig_posts.json actualizado');
})().catch(err => {
  console.error('SCRAPER ERROR:', err.message);
  process.exit(1);
});
