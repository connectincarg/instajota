// scripts/update.js
const fs    = require('fs');
const fetch = require('node-fetch');
const USER  = 'radiojotafm';

(async () => {
  const res  = await fetch(`https://www.instagram.com/${USER}/?__a=1&__d=dis`, {
    headers: { 'User-Agent': 'Mozilla/5.0' }
  });
  const json = await res.json();
  const edges = json.graphql?.user?.edge_owner_to_timeline_media?.edges || [];
  const posts = edges.slice(0,8).map(e => {
    const n = e.node;
    return {
      link:    `https://instagram.com/p/${n.shortcode}`,
      thumb:   n.display_url,
      caption: n.edge_media_to_caption.edges[0]?.node?.text || '',
      type:    n.is_video ? 'video' : 'image',
      video:   n.is_video ? (n.video_url||'') : ''
    };
  });
  fs.writeFileSync('ig_posts.json', JSON.stringify({ posts }, null, 2));
})();
