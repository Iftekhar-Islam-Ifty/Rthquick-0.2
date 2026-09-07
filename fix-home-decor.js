const fs = require('fs');
let content = fs.readFileSync('pages/home-decor.html', 'utf8');

const brokenBlockRegex = /<div class="eq-filter-sidebar__header">[\s\S]*?<\/button>\s*<\/div>\s*<\/div>\s*<\/div>\s*<\/div>/;

const correctBlock = `<div class="eq-filter-sidebar__header">
            <h2 class="eq-filter-sidebar__title">Filter Collection</h2>
            <button type="button" class="eq-filter-sidebar__reset" id="filter-sidebar-reset">
              <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="1 4 1 10 7 10"></polyline><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path></svg>
              <span>Reset All</span>
            </button>
          </div>

          <!-- Filter Group 1: Price Range -->
          <div class="eq-filter-group" id="filter-group-price">
            <button type="button" class="eq-filter-group__header" aria-expanded="true">
              <span>Price Range</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
            </button>
            <div class="eq-filter-group__body">
              <div class="eq-price-slider-wrap">
                <input type="range" class="eq-price-range-slider" id="filter-price-slider" min="1500" max="25000" step="500" value="25000" />
                <div class="eq-price-inputs">
                  <div class="eq-price-input-box">
                    <span>৳</span>
                    <input type="number" id="filter-price-min" value="1500" readonly />
                  </div>
                  <span style="color: var(--eq-charcoal-muted);">-</span>
                  <div class="eq-price-input-box">
                    <span>৳</span>
                    <input type="number" id="filter-price-max" value="25000" min="1500" max="25000" step="500" />
                  </div>
                </div>
              </div>
            </div>
          </div>`;

content = content.replace(brokenBlockRegex, correctBlock);
fs.writeFileSync('pages/home-decor.html', content);
