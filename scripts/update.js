// scripts/update.js
const fs    = require('fs');
const fetch = require('node-fetch');
const USER  = 'radiojotafm';

(async () => {
  // 1) Descagar HTML
  const res  = await fetch(`https://www.instagram.com/${USER}/`, {
    headers: { 'User-Agent': 'Mozilla/5.0' }
  });
  const html = await res.text();

  // 2) Extraer JSON de __NEXT_DATA__
  const m = html.match(
    /<script id="__NEXT_DATA__" type="application\/json">(.+?)<\/script>/s
  );
  if (!m) throw new Error('No se encontró __NEXT_DATA__');
  const data = JSON.parse(m[1]);

  // 3) Buscar edges dentro de props
  const props = data.props?.pageProps || data.props?.apolloState || {};
  const user  = props.graphql?.user 
             || props.user 
             || {};
  const edges = user.edge_owner_to_timeline_media?.edges || [];

  // 4) Mapear primeros 8 posts
  const posts = edges.slice(0, 8).map(e => {
    const n = e.node;
    return {
      link:    `https://instagram.com/p/${n.shortcode}`,
      thumb:   n.display_url || n.thumbnail_src,
      caption: n.edge_media_to_caption?.edges[0]?.node?.text || '',
      type:    n.is_video ? 'video' : 'image',
      video:   n.is_video ? n.video_url || '' : ''
    };
  });

  // 5) Escribir ig_posts.json
  fs.writeFileSync(
    'ig_posts.json',
    JSON.stringify({ posts }, null, 2)
  );
})().catch(err => {
  console.error('SCRAPER ERROR:', err.message);
  process.exit(1);
});
