const fs = require('fs');

function extractSidebar(file) {
  const content = fs.readFileSync(file, 'utf8');
  const match = content.match(/<aside class="eq-filter-sidebar"[\s\S]*?<\/aside>/);
  return match ? match[0] : 'NOT FOUND';
}

console.log('=== WOMEN SIDEBAR ===');
console.log(extractSidebar('pages/women.html').substring(0, 500));
console.log('...\n=== HOME DECOR SIDEBAR ===');
console.log(extractSidebar('pages/home-decor.html').substring(0, 500));
