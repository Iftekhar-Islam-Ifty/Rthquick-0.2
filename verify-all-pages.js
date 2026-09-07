const fs = require('fs');

const files = fs.readdirSync('pages').filter(f => f.endsWith('.html'));

let hasError = false;
files.forEach(file => {
  const content = fs.readFileSync('pages/' + file, 'utf8');
  
  // 1. Check if broken comment exists
  if (content.includes('<!-- Product Cards rendered dynamically via js/category.js?v=9.0"')) {
    console.error(`ERROR in ${file}: contains broken comment!`);
    hasError = true;
  }
  
  // 2. Check if catalog-pagination div exists
  if (!content.includes('<div class="eq-pagination-wrap" id="catalog-pagination">')) {
    console.error(`ERROR in ${file}: missing catalog-pagination div!`);
    hasError = true;
  }
  
  // 3. Check if catalog-grid div exists
  if (!content.includes('<div class="eq-catalog-grid" id="catalog-grid"></div>') && 
      !content.includes('<div class="eq-catalog-grid" id="catalog-grid">\n          </div>') &&
      !content.includes('<div class="eq-catalog-grid" id="catalog-grid">\r\n          </div>') &&
      !content.includes('id="catalog-grid"')) {
    console.error(`ERROR in ${file}: missing catalog-grid div!`);
    hasError = true;
  }
  
  // 4. Tag balance check
  ['div', 'section', 'aside', 'main'].forEach(tag => {
    const o = (content.match(new RegExp(`<${tag}(\\s+[^>]*)?>`, 'gi')) || []).length;
    const c = (content.match(new RegExp(`</${tag}>`, 'gi')) || []).length;
    if (o !== c) {
      console.error(`ERROR in ${file}: ${tag} mismatch (open:${o}, close:${c})`);
      hasError = true;
    }
  });
});

if (!hasError) {
  console.log('ALL HTML PAGES ARE 100% CLEAN AND BALANCED!');
}
