const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;
const HOST = '0.0.0.0';

const staticDir = path.join(__dirname, 'earthquick');

// Serve static assets from the earthquick directory
app.use(express.static(staticDir));
// Also serve /earthquick prefix in case links use absolute or relative paths with /earthquick
app.use('/earthquick', express.static(staticDir));

// Fallback to index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(staticDir, 'index.html'));
});

app.listen(PORT, HOST, () => {
  console.log(`Earthquick server running on http://${HOST}:${PORT}`);
});
