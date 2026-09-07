const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'pages');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html')).map(f => path.join(dir, f));
files.push(path.join(__dirname, 'index.html'));

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/(css\/style\.css)(\?[^"']*)?/g, '$1?v=9.0');
  content = content.replace(/(js\/category\.js)(\?[^"']*)?/g, '$1?v=9.0');
  content = content.replace(/(js\/script\.js)(\?[^"']*)?/g, '$1?v=9.0');
  fs.writeFileSync(file, content, 'utf8');
}
console.log('Bumped to v=9.0 across', files.length, 'files');
