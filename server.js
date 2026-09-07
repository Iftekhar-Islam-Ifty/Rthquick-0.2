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

// 1. Disable browser caching in development so preview updates instantly
app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  next();
});

// 2. Primary static asset hosting directly from root project directory
app.use(express.static(__dirname, {
  etag: false,
  lastModified: false,
  maxAge: 0
}));

// 3. Prefix alias for /earthquick path requests (mirroring root)
app.use('/earthquick', express.static(__dirname, {
  etag: false,
  lastModified: false,
  maxAge: 0
}));

// 4. Asset paths routing for subpages
app.use('/pages/css', express.static(path.join(__dirname, 'css')));
app.use('/pages/js', express.static(path.join(__dirname, 'js')));
app.use('/pages/images', express.static(path.join(__dirname, 'images')));

// 5. Default fallback: serve root index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, HOST, () => {
  console.log(`Earthquick server running on http://${HOST}:${PORT}`);
});
