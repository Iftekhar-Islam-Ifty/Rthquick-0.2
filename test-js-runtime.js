const fs = require('fs');

// Create a minimal DOM-like environment to run category.js on home-decor.html
const html = fs.readFileSync('pages/home-decor.html', 'utf8');

// Check if any element queried in category.js is missing
const queries = [
  "#filter-sidebar",
  "#filter-sidebar-reset",
  "#filter-price-slider",
  "#filter-price-min",
  "#filter-price-max",
  "#filter-in-stock",
  "#catalog-sort-select",
  "#catalog-grid",
  "#catalog-counter",
  "#active-filter-chips",
  "#catalog-pagination",
  "#mobile-filter-trigger",
  "#filter-backdrop"
];

for (const q of queries) {
  const exists = html.includes(q.replace('#', 'id="'));
  console.log(`${q}: ${exists ? 'EXISTS' : 'MISSING'}`);
}
