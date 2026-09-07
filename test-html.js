const fs = require('fs');

function checkFile(filename) {
  const content = fs.readFileSync(filename, 'utf8');
  
  // Check open and closing tags
  const tags = ['div', 'section', 'aside', 'main', 'article', 'header', 'footer', 'nav'];
  const counts = {};
  for (const tag of tags) {
    const openRegex = new RegExp(`<${tag}(\\s+[^>]*)?>`, 'gi');
    const closeRegex = new RegExp(`</${tag}>`, 'gi');
    const openCount = (content.match(openRegex) || []).length;
    const closeCount = (content.match(closeRegex) || []).length;
    if (openCount !== closeCount) {
      console.log(`${filename}: MISMATCH for <${tag}>: open=${openCount}, close=${closeCount}`);
    }
  }
}

const files = fs.readdirSync('pages').filter(f => f.endsWith('.html'));
files.forEach(f => checkFile('pages/' + f));
