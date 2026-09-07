/* =====================================================================
   EARTHQUICK APPLICATION SERVER
   Lightweight Node.js Express server to host the Earthquick static web app
   and support clean routing across all pages, assets, and future updates.
   ===================================================================== */

const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;
const HOST = '0.0.0.0';

const staticDir = path.join(__dirname, 'earthquick');

// 1. Primary static asset hosting for /earthquick directory
app.use(express.static(staticDir));

// 2. Prefix alias for /earthquick path requests
app.use('/earthquick', express.static(staticDir));

// 3. Fallback routing for relative asset paths from subpages (e.g. /pages)
app.use('/pages/css', express.static(path.join(staticDir, 'css')));
app.use('/pages/js', express.static(path.join(staticDir, 'js')));
app.use('/pages/images', express.static(path.join(staticDir, 'images')));

// 4. Default fallback: serve index.html for undefined SPA routes
app.get('*', (req, res) => {
  res.sendFile(path.join(staticDir, 'index.html'));
});

app.listen(PORT, HOST, () => {
  console.log(`Earthquick server running on http://${HOST}:${PORT}`);
});
