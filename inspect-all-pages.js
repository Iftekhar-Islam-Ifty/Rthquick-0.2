const fs = require('fs');

const files = fs.readdirSync('pages').filter(f => f.endsWith('.html'));

files.forEach(file => {
  const content = fs.readFileSync('pages/' + file, 'utf8');
  const issues = [];
  
  if (content.includes('eq-pagination-wrap" id="catalog-pagination">')) {
    issues.push('CORRUPT_PAGINATION_COMMENT');
  }
  if (content.includes('<!-- Product Cards rendered dynamically via js/category.js?v=9.0"eq-pagination-wrap"')) {
    issues.push('BROKEN_COMMENT_TAG');
  }
  if (content.includes('</div>\n          </div>\n          </div>\n\n          <!-- Filter Group 3: Availability -->') ||
      content.includes('</div>          </div>          </div>          <!-- Filter Group 3: Availability -->') ||
      content.includes('</div>\r\n          </div>\r\n          </div>\r\n\r\n          <!-- Filter Group 3: Availability -->')) {
    issues.push('EXTRA_DIV_BEFORE_AVAILABILITY');
  }
  
  // Tag counts
  ['div', 'section', 'aside', 'main'].forEach(tag => {
    const o = (content.match(new RegExp(`<${tag}(\\s+[^>]*)?>`, 'gi')) || []).length;
    const c = (content.match(new RegExp(`</${tag}>`, 'gi')) || []).length;
    if (o !== c) issues.push(`MISMATCH_${tag.toUpperCase()}(open:${o},close:${c})`);
  });

  console.log(`${file.padEnd(28)}: ${issues.length ? issues.join(', ') : 'CLEAN'}`);
});
