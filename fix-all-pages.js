const fs = require('fs');
const path = require('path');

function fixHtmlFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  // 1. Fix the broken pagination comment and missing closing grid div
  // Pattern: <div class="eq-catalog-grid" id="catalog-grid">\s*<!-- Product Cards rendered dynamically via js/category.js?v=9.0"eq-pagination-wrap" id="catalog-pagination">
  const corruptPaginationRegex = /<!-- Product Cards rendered dynamically via js\/category\.js\?v=9\.0"eq-pagination-wrap" id="catalog-pagination">([\s\S]*?)<\/div>\s*<\/section>/;
  
  if (corruptPaginationRegex.test(content)) {
    content = content.replace(corruptPaginationRegex, (match, paginationInner) => {
      return `<!-- Product Cards rendered dynamically via js/category.js -->\n          </div>\n\n          <!-- Reusable Catalog Pagination (Laravel Blade: partials/pagination) -->\n          <div class="eq-pagination-wrap" id="catalog-pagination">${paginationInner}</div>\n        </section>`;
    });
    changed = true;
  }

  // Also check if there's any variation of the corrupt comment
  if (content.includes('"eq-pagination-wrap" id="catalog-pagination">') && !content.includes('<div class="eq-pagination-wrap" id="catalog-pagination">')) {
    content = content.replace(/<!--[\s\S]*?"eq-pagination-wrap" id="catalog-pagination">/g, 
      '<!-- Product Cards rendered dynamically via js/category.js -->\n          </div>\n\n          <div class="eq-pagination-wrap" id="catalog-pagination">');
    changed = true;
  }

  // 2. Fix the extra </div> before Availability filter group
  // Extra div pattern: </div>\s*</div>\s*</div>\s*<!-- Filter Group 3: Availability -->
  const extraDivRegex = /<\/div>\s*<\/div>\s*<\/div>\s*<!-- Filter Group 3: Availability -->/g;
  if (extraDivRegex.test(content)) {
    content = content.replace(extraDivRegex, '</div>\n          </div>\n\n          <!-- Filter Group 3: Availability -->');
    changed = true;
  }

  // 3. Ensure Color Palette is completely removed if any remnants remain
  const colorGroupRegex = /<!-- Filter Group 3: Color Palette -->[\s\S]*?<!-- Filter Group 4: Availability -->/;
  if (colorGroupRegex.test(content)) {
    content = content.replace(colorGroupRegex, '<!-- Filter Group 3: Availability -->');
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated: ${filePath}`);
  } else {
    console.log(`No changes needed: ${filePath}`);
  }
}

// Run for all pages in pages/
const pageFiles = fs.readdirSync('pages').filter(f => f.endsWith('.html'));
pageFiles.forEach(f => fixHtmlFile('pages/' + f));

// Also sync to earthquick/pages/ if it exists
if (fs.existsSync('earthquick/pages')) {
  pageFiles.forEach(f => {
    if (fs.existsSync('earthquick/pages/' + f)) {
      fixHtmlFile('earthquick/pages/' + f);
    }
  });
}
