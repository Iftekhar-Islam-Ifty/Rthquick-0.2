/* =====================================================================
   EARTHQUICK — CORE JAVASCRIPT
   Structured modular script powering site interactions, navigation,
   carousels, accessibility, and interactive feedback.

   MODULE SEQUENCE:
   1. TOAST NOTIFICATION SYSTEM   -> Non-blocking visual feedback for actions
   2. NAVBAR & MOBILE MENU        -> Sticky shadow, mobile drawer toggle
   3. SEARCH MODAL DIALOG         -> Search overlay toggle & input handling
   4. SHOPPING CART & QUICK ADD   -> In-memory cart counter with badge updates
   5. ACCOUNT ACTIONS             -> Account drawer / login feedback
   6. PRODUCT CAROUSELS           -> Arrow buttons + touch swipe navigation
   7. SCROLL REVEAL ANIMATIONS    -> IntersectionObserver viewport entrance
   8. NEWSLETTER SUBSCRIPTION     -> Form validation and submission feedback
   9. INITIALIZATION BOOTSTRAP    -> DOMContentLoaded event listener
   ===================================================================== */


/* =====================================================================
   1. TOAST NOTIFICATION SYSTEM
   Provides non-intrusive, styled alerts matching Earthquick brand tokens.
   Replaces window.alert() which is blocked in sandboxed iframes.
   ===================================================================== */
const Toast = {
  container: null,

  init() {
    if (!this.container) {
      this.container = document.querySelector("#eq-toast-container");
      if (!this.container) {
        this.container = document.createElement("div");
        this.container.id = "eq-toast-container";
        this.container.className = "eq-toast-container";
        this.container.setAttribute("role", "status");
        this.container.setAttribute("aria-live", "polite");
        document.body.appendChild(this.container);
      }
    }
  },

  show(message, duration = 3200) {
    this.init();

    const toast = document.createElement("div");
    toast.className = "eq-toast";
    toast.innerHTML = `
      <svg class="eq-toast__icon" viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="8" x2="12" y2="12"></line>
        <line x1="12" y1="16" x2="12.01" y2="16"></line>
      </svg>
      <span>${message}</span>
    `;

    this.container.appendChild(toast);

    // Trigger enter transition
    requestAnimationFrame(() => {
      toast.classList.add("is-show");
    });

    // Auto-dismiss
    setTimeout(() => {
      toast.classList.remove("is-show");
      toast.addEventListener("transitionend", () => {
        toast.remove();
      });
    }, duration);
  }
};


/* =====================================================================
   2. NAVBAR & MOBILE MENU
   Handles sticky scroll elevation and mobile navigation drawer.
   ===================================================================== */
function initNavbar() {
  const navbar = document.querySelector("#eq-main-navbar") || document.querySelector(".eq-navbar");
  const toggle = document.querySelector("#eq-nav-toggle") || document.querySelector(".eq-navbar__toggle");
  const links = document.querySelector("#eq-nav-links") || document.querySelector(".eq-navbar__links");

  if (!navbar) return;

  // Add elevation shadow when scrolled
  const onScroll = () => {
    navbar.classList.toggle("is-scrolled", window.scrollY > 15);
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  // Mobile toggle behavior
  if (toggle && links) {
    toggle.addEventListener("click", () => {
      const isOpen = links.classList.toggle("is-open");
      toggle.classList.toggle("is-open", isOpen);
      toggle.setAttribute("aria-expanded", String(isOpen));
      document.body.style.overflow = isOpen ? "hidden" : "";
    });

    // Close menu when clicking any link
    links.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        links.classList.remove("is-open");
        toggle.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
        document.body.style.overflow = "";
      });
    });

    // Close on Escape key press
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && links.classList.contains("is-open")) {
        links.classList.remove("is-open");
        toggle.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
        document.body.style.overflow = "";
      }
    });
  }

  // Dropdown toggle handling (for mobile accordion & accessible keyboard navigation)
  const dropdownToggles = document.querySelectorAll(".eq-dropdown-toggle-btn");
  dropdownToggles.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      const parentDropdown = btn.closest(".eq-nav-item--has-dropdown");
      if (parentDropdown) {
        const isExpanded = parentDropdown.classList.toggle("is-expanded");
        btn.setAttribute("aria-expanded", String(isExpanded));
      }
    });
  });
}


/* =====================================================================
   3. SEARCH MODAL DIALOG
   Allows quick search access from the navbar search icon.
   ===================================================================== */
function initSearchModal() {
  const openButtons = document.querySelectorAll('[data-action="open-search"]');
  const modal = document.querySelector("#eq-search-modal");
  const closeButton = document.querySelector("#eq-search-close");
  const searchInput = document.querySelector("#eq-search-input");

  if (!modal) return;

  const openSearch = () => {
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    if (searchInput) {
      setTimeout(() => searchInput.focus(), 150);
    }
  };

  const closeSearch = () => {
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  };

  openButtons.forEach((btn) => btn.addEventListener("click", openSearch));
  if (closeButton) closeButton.addEventListener("click", closeSearch);

  // Close when clicking modal backdrop
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeSearch();
  });

  // Close on Escape key press
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.classList.contains("is-open")) {
      closeSearch();
    }
  });

  // Handle Search Input submit / Enter key
  if (searchInput) {
    searchInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        const query = searchInput.value.trim();
        if (query) {
          Toast.show(`Searching collection for "${query}"...`);
          closeSearch();
          searchInput.value = "";
        }
      }
    });
  }
}


/* =====================================================================
   4. SHOPPING CART & SLIDE-IN DRAWER
   Manages client-side cart storage, badge updates, quick-add actions,
   and dynamic interactive slide-in cart drawer.
   ===================================================================== */
const EarthquickCart = {
  storageKey: "earthquick_cart_v1",
  drawerEl: null,
  backdropEl: null,
  freeShippingThreshold: 3000,

  getItems() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  },

  saveItems(items) {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(items));
    } catch (e) {}
    this.updateBadges();
  },

  addItem(product, qty = 1, size = "Standard", color = "") {
    const items = this.getItems();
    const existingIndex = items.findIndex(
      (item) => item.id === product.id && item.size === size && item.color === (color || product.colorName || "")
    );

    if (existingIndex > -1) {
      items[existingIndex].qty += qty;
    } else {
      items.push({
        id: product.id,
        name: product.name,
        price: Number(product.price) || 0,
        image: product.image,
        size: size,
        color: color || product.colorName || "",
        qty: qty
      });
    }

    this.saveItems(items);
    this.renderDrawer();
    this.openDrawer();
    Toast.show(`Added "${product.name}" to your bag.`);
  },

  updateQty(index, delta) {
    const items = this.getItems();
    if (!items[index]) return;

    items[index].qty += delta;
    if (items[index].qty <= 0) {
      items.splice(index, 1);
    }
    this.saveItems(items);
    this.renderDrawer();
  },

  removeItem(index) {
    const items = this.getItems();
    if (!items[index]) return;
    const removedName = items[index].name;
    items.splice(index, 1);
    this.saveItems(items);
    this.renderDrawer();
    Toast.show(`Removed "${removedName}" from bag.`);
  },

  clearCart() {
    this.saveItems([]);
    this.renderDrawer();
  },

  getTotalCount() {
    return this.getItems().reduce((sum, item) => sum + (item.qty || 1), 0);
  },

  getSubtotal() {
    return this.getItems().reduce((sum, item) => sum + (item.price * (item.qty || 1)), 0);
  },

  formatMoney(num) {
    return "৳" + Number(num).toLocaleString("en-IN");
  },

  updateBadges() {
    const count = this.getTotalCount();
    document.querySelectorAll("#eq-cart-count, .eq-cart-count").forEach((badge) => {
      badge.textContent = String(count);
      badge.style.display = count > 0 ? "flex" : "none";
    });
  },

  buildDrawerDOM() {
    if (document.querySelector("#eq-cart-drawer")) {
      this.drawerEl = document.querySelector("#eq-cart-drawer");
      this.backdropEl = document.querySelector("#eq-cart-backdrop");
      return;
    }

    // Backdrop
    const backdrop = document.createElement("div");
    backdrop.id = "eq-cart-backdrop";
    backdrop.className = "eq-cart-backdrop";
    document.body.appendChild(backdrop);
    this.backdropEl = backdrop;

    // Drawer container
    const drawer = document.createElement("aside");
    drawer.id = "eq-cart-drawer";
    drawer.className = "eq-cart-drawer";
    drawer.setAttribute("role", "dialog");
    drawer.setAttribute("aria-label", "Shopping Bag");
    drawer.innerHTML = `
      <div class="eq-cart-drawer__header">
        <h2 class="eq-cart-drawer__title">
          Shopping Bag
          <span class="eq-cart-drawer__count-badge" id="eq-drawer-count">0</span>
        </h2>
        <button type="button" class="eq-cart-drawer__close" id="eq-btn-close-cart" aria-label="Close Shopping Bag">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      <div class="eq-cart-drawer__shipping-bar" id="eq-shipping-bar">
        <div class="eq-cart-drawer__shipping-text" id="eq-shipping-text">
          Free delivery unlocked on orders over ৳3,000
        </div>
        <div class="eq-cart-drawer__progress-track">
          <div class="eq-cart-drawer__progress-fill" id="eq-shipping-fill" style="width: 0%;"></div>
        </div>
      </div>

      <div class="eq-cart-drawer__body" id="eq-cart-items-container">
        <!-- Items dynamically injected -->
      </div>

      <div class="eq-cart-drawer__footer">
        <div class="eq-cart-drawer__subtotal-row">
          <span class="eq-cart-drawer__subtotal-label">Subtotal</span>
          <span class="eq-cart-drawer__subtotal-amount" id="eq-cart-subtotal">৳0</span>
        </div>
        <p class="eq-cart-drawer__note">Delivery fee and taxes calculated at checkout</p>
        <button type="button" class="eq-cart-drawer__btn-checkout" id="eq-btn-checkout">
          Proceed to Checkout &rarr;
        </button>
        <button type="button" class="eq-cart-drawer__btn-continue" id="eq-btn-continue-shopping">
          Continue Shopping
        </button>
      </div>
    `;

    document.body.appendChild(drawer);
    this.drawerEl = drawer;

    // Attach listener events
    backdrop.addEventListener("click", () => this.closeDrawer());
    drawer.querySelector("#eq-btn-close-cart").addEventListener("click", () => this.closeDrawer());
    drawer.querySelector("#eq-btn-continue-shopping").addEventListener("click", () => this.closeDrawer());

    drawer.querySelector("#eq-btn-checkout").addEventListener("click", () => {
      const items = this.getItems();
      if (items.length === 0) {
        Toast.show("Your bag is empty! Add products first.");
        return;
      }
      Toast.show("Directing to secure checkout...");
      const isSubpage = window.location.pathname.includes("/pages/");
      setTimeout(() => {
        window.location.href = isSubpage ? "checkout.html" : "pages/checkout.html";
      }, 350);
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && this.drawerEl.classList.contains("is-open")) {
        this.closeDrawer();
      }
    });
  },

  renderDrawer() {
    this.buildDrawerDOM();
    const items = this.getItems();
    const count = this.getTotalCount();
    const subtotal = this.getSubtotal();

    // Update count badge
    const countBadge = this.drawerEl.querySelector("#eq-drawer-count");
    if (countBadge) countBadge.textContent = String(count);

    // Update Subtotal
    const subtotalEl = this.drawerEl.querySelector("#eq-cart-subtotal");
    if (subtotalEl) subtotalEl.textContent = this.formatMoney(subtotal);

    // Update Shipping Bar
    const shippingText = this.drawerEl.querySelector("#eq-shipping-text");
    const shippingFill = this.drawerEl.querySelector("#eq-shipping-fill");
    if (shippingText && shippingFill) {
      if (subtotal >= this.freeShippingThreshold) {
        shippingText.innerHTML = `<strong>Congratulations!</strong> You have unlocked Free Delivery.`;
        shippingFill.style.width = "100%";
      } else {
        const remaining = this.freeShippingThreshold - subtotal;
        const pct = Math.min(100, Math.round((subtotal / this.freeShippingThreshold) * 100));
        shippingText.innerHTML = `Add <strong>${this.formatMoney(remaining)}</strong> more to unlock <strong>Free Delivery</strong>`;
        shippingFill.style.width = `${pct}%`;
      }
    }

    // Body items container
    const container = this.drawerEl.querySelector("#eq-cart-items-container");
    if (!container) return;

    if (items.length === 0) {
      container.innerHTML = `
        <div class="eq-cart-empty">
          <svg viewBox="0 0 24 24" fill="none" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"></path>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <path d="M16 10a4 4 0 0 1-8 0"></path>
          </svg>
          <div class="eq-cart-empty__title">Your bag is empty</div>
          <p class="eq-cart-empty__desc">Explore our handpicked collection and discover pieces crafted for you.</p>
        </div>
      `;
      return;
    }

    // Resolve relative image path depending on whether on subpage or root
    const isSubpage = window.location.pathname.includes("/pages/");

    container.innerHTML = items
      .map((item, idx) => {
        let imgSrc = item.image || "images/hero/hero-main.jpg";
        if (isSubpage && !imgSrc.startsWith("../") && !imgSrc.startsWith("http") && !imgSrc.startsWith("/")) {
          imgSrc = "../" + imgSrc;
        } else if (!isSubpage && imgSrc.startsWith("../")) {
          imgSrc = imgSrc.replace(/^\.\.\//, "");
        }

        return `
          <div class="eq-cart-item" data-index="${idx}">
            <img class="eq-cart-item__image" src="${imgSrc}" alt="${item.name}" onerror="this.src='${isSubpage ? '../' : ''}images/hero/hero-main.jpg'" />
            <div class="eq-cart-item__info">
              <div>
                <h4 class="eq-cart-item__title">${item.name}</h4>
                <div class="eq-cart-item__variant">${item.size}${item.color ? " • " + item.color : ""}</div>
                <div class="eq-cart-item__price">${this.formatMoney(item.price)}</div>
              </div>
              <div class="eq-cart-item__bottom">
                <div class="eq-cart-item__qty">
                  <button type="button" class="eq-cart-item__qty-btn" onclick="EarthquickCart.updateQty(${idx}, -1)" aria-label="Decrease quantity">&minus;</button>
                  <span class="eq-cart-item__qty-val">${item.qty}</span>
                  <button type="button" class="eq-cart-item__qty-btn" onclick="EarthquickCart.updateQty(${idx}, 1)" aria-label="Increase quantity">&plus;</button>
                </div>
                <button type="button" class="eq-cart-item__remove" onclick="EarthquickCart.removeItem(${idx})" aria-label="Remove item">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        `;
      })
      .join("");
  },

  openDrawer() {
    this.buildDrawerDOM();
    this.renderDrawer();
    this.drawerEl.classList.add("is-open");
    this.backdropEl.classList.add("is-open");
    document.body.style.overflow = "hidden";
  },

  closeDrawer() {
    if (this.drawerEl) this.drawerEl.classList.remove("is-open");
    if (this.backdropEl) this.backdropEl.classList.remove("is-open");
    document.body.style.overflow = "";
  },

  init() {
    this.buildDrawerDOM();
    this.updateBadges();

    // Attach to any open-cart buttons
    document.querySelectorAll('[data-action="open-cart"], #eq-btn-cart').forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        this.openDrawer();
      });
    });

    // Quick add handlers on product cards
    document.querySelectorAll(".eq-product-card__quick-add").forEach((btn) => {
      btn.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();

        const card = btn.closest(".eq-product-card") || btn.closest(".eq-saree-masterpiece");
        if (card && typeof window.openQuickView === "function") {
          window.openQuickView(card);
          return;
        }

        const nameEl = card ? card.querySelector(".eq-product-card__name") : null;
        const priceEl = card ? card.querySelector(".eq-product-card__price") : null;
        const imgEl = card ? card.querySelector("img") : null;

        const name = nameEl ? nameEl.textContent.trim() : "Boutique Collection Item";
        let price = 5500;
        if (priceEl) {
          const match = priceEl.textContent.match(/[\d,]+/);
          if (match) price = parseInt(match[0].replace(/,/g, ""), 10);
        }

        const img = imgEl ? imgEl.getAttribute("src") : "images/hero/hero-main.jpg";

        EarthquickCart.addItem({
          id: "prod-" + Math.abs(name.split("").reduce((a, b) => ((a << 5) - a) + b.charCodeAt(0), 0)),
          name: name,
          price: price,
          image: img,
          colorName: "Curated"
        });
      });
    });
  }
};

// Global expose
window.EarthquickCart = EarthquickCart;

function initCart() {
  EarthquickCart.init();
}


/* =====================================================================
   5. ACCOUNT ACTIONS
   Handles navigation to Customer Account & Orders portal.
   ===================================================================== */
function initAccount() {
  document.addEventListener("click", (e) => {
    const accountButton = e.target.closest('[data-action="open-account"], #eq-btn-account');
    if (!accountButton) return;
    
    e.preventDefault();
    const isSubpage = window.location.pathname.includes("/pages/");
    const activeUser = localStorage.getItem("earthquick_auth_user");

    if (activeUser) {
      window.location.href = isSubpage ? "account.html" : "pages/account.html";
    } else {
      window.location.href = isSubpage ? "login.html" : "pages/login.html";
    }
  });
}


/* =====================================================================
   6. PRODUCT CAROUSELS
   Handles New Arrivals and Three Piece carousels with arrow controls,
   resize re-calculations, and touch swipe gestures.
   ===================================================================== */
function initCarousels() {
  document.querySelectorAll(".eq-carousel").forEach((carousel) => {
    const viewport = carousel.querySelector(".eq-carousel__viewport");
    const track = carousel.querySelector(".eq-carousel__track");
    if (!viewport || !track) return;

    const scope = carousel.closest(".eq-section") || carousel;
    const prevBtn = scope.querySelector('[data-action="prev"]');
    const nextBtn = scope.querySelector('[data-action="next"]');

    let position = 0;

    // Calculate dynamic step per card based on card width + gap
    function cardStep() {
      const card = track.querySelector(".eq-product-card");
      if (!card) return 300;
      const style = window.getComputedStyle(track);
      const gap = parseFloat(style.columnGap || style.gap || "0");
      return card.getBoundingClientRect().width + gap;
    }

    // Maximum scroll boundary
    function maxScroll() {
      return Math.max(0, track.scrollWidth - viewport.clientWidth);
    }

    // Update track position and toggle arrow disabled state
    function update() {
      const max = maxScroll();
      position = Math.min(Math.max(position, 0), max);
      track.style.transform = `translateX(-${position}px)`;

      if (prevBtn) prevBtn.disabled = position <= 0;
      if (nextBtn) nextBtn.disabled = position >= max - 2;
    }

    // Arrow button controls
    if (prevBtn) {
      prevBtn.addEventListener("click", () => {
        position -= cardStep();
        update();
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener("click", () => {
        position += cardStep();
        update();
      });
    }

    // Touch Swipe Support for Mobile & Tablet
    let startX = 0;
    let currentX = 0;
    let isSwiping = false;

    viewport.addEventListener(
      "touchstart",
      (e) => {
        if (!e.touches[0]) return;
        startX = e.touches[0].clientX;
        currentX = startX;
        isSwiping = true;
      },
      { passive: true }
    );

    viewport.addEventListener(
      "touchmove",
      (e) => {
        if (!isSwiping || !e.touches[0]) return;
        currentX = e.touches[0].clientX;
      },
      { passive: true }
    );

    viewport.addEventListener("touchend", () => {
      if (!isSwiping) return;
      isSwiping = false;
      const diffX = startX - currentX;
      const threshold = 40; // minimum swipe distance

      if (diffX > threshold) {
        // Swiped Left -> Move to next
        position += cardStep();
        update();
      } else if (diffX < -threshold) {
        // Swiped Right -> Move to previous
        position -= cardStep();
        update();
      }
    });

    // Re-evaluate on window resize & image load completion
    window.addEventListener("resize", update);
    window.addEventListener("load", update);
    update();
  });
}


/* =====================================================================
   7. SCROLL REVEAL ANIMATIONS
   Applies a subtle, one-time fade and rise to elements with .eq-reveal
   as they enter the user's viewport.
   ===================================================================== */
function initScrollReveal() {
  const items = document.querySelectorAll(".eq-reveal");
  if (!items.length) return;

  // Fail-safe: ensure all items become visible after 1.2s regardless of scroll state
  setTimeout(() => {
    items.forEach((el) => el.classList.add("is-visible"));
  }, 1200);

  if (!("IntersectionObserver" in window)) {
    items.forEach((el) => el.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.05, rootMargin: "0px 0px 120px 0px" }
  );

  items.forEach((el) => observer.observe(el));
}


/* =====================================================================
   8. NEWSLETTER SUBSCRIPTION
   Validates and simulates email signup for the Earthquick house drops.
   ===================================================================== */
function initNewsletterForm() {
  const form = document.querySelector("#eq-newsletter-form") || document.querySelector("[data-newsletter-form]");
  if (!form) return;

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const input = form.querySelector('input[type="email"]');
    const email = input ? input.value.trim() : "";

    if (email && email.includes("@")) {
      Toast.show("Welcome to the House of Earthquick. Thank you for subscribing!");
      form.reset();
    } else {
      Toast.show("Please enter a valid email address.");
    }
  });
}


/* =====================================================================
   9. HERO CAMPAIGN SLIDER
   Smooth crossfade slider with pause-on-hover, arrow keys, and dots.
   ===================================================================== */
function initHeroSlider() {
  const slider = document.querySelector("#hero-section");
  if (!slider) return;

  const slides = slider.querySelectorAll(".eq-hero__slide");
  const dots = slider.querySelectorAll(".eq-hero__dot");
  const prevBtn = slider.querySelector("#hero-prev");
  const nextBtn = slider.querySelector("#hero-next");

  if (!slides.length) return;

  let currentIndex = 0;
  let timer = null;
  const slideCount = slides.length;

  const goToSlide = (index) => {
    currentIndex = (index + slideCount) % slideCount;

    slides.forEach((slide, i) => {
      const isActive = i === currentIndex;
      slide.classList.toggle("is-active", isActive);
      slide.setAttribute("aria-hidden", String(!isActive));
    });

    dots.forEach((dot, i) => {
      const isActive = i === currentIndex;
      dot.classList.toggle("is-active", isActive);
      dot.setAttribute("aria-selected", String(isActive));
    });
  };

  const nextSlide = () => goToSlide(currentIndex + 1);
  const prevSlide = () => goToSlide(currentIndex - 1);

  const startAutoPlay = () => {
    stopAutoPlay();
    timer = setInterval(nextSlide, 6500);
  };

  const stopAutoPlay = () => {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
  };

  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      nextSlide();
      startAutoPlay();
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener("click", () => {
      prevSlide();
      startAutoPlay();
    });
  }

  dots.forEach((dot) => {
    dot.addEventListener("click", () => {
      const idx = parseInt(dot.getAttribute("data-index"), 10);
      if (!isNaN(idx)) {
        goToSlide(idx);
        startAutoPlay();
      }
    });
  });

  // Pause autoplay on mouse hover to allow patron reading
  slider.addEventListener("mouseenter", stopAutoPlay);
  slider.addEventListener("mouseleave", startAutoPlay);

  // Keyboard navigation when focused
  slider.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") {
      prevSlide();
      startAutoPlay();
    } else if (e.key === "ArrowRight") {
      nextSlide();
      startAutoPlay();
    }
  });

  goToSlide(0);
  startAutoPlay();
}


/* =====================================================================
   10. QUICK VIEW MODAL
   Allows patrons to inspect pieces, select sizing, and add to bag
   without interrupting page flow.
   ===================================================================== */
function initQuickViewModal() {
  const modal = document.querySelector("#eq-quickview-modal");
  const backdrop = document.querySelector("#eq-quickview-backdrop");
  const closeBtn = document.querySelector("#eq-quickview-close");
  const body = document.querySelector("#eq-quickview-body");

  if (!modal || !body) return;

  const closeModal = () => {
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  };

  if (backdrop) backdrop.addEventListener("click", closeModal);
  if (closeBtn) closeBtn.addEventListener("click", closeModal);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.classList.contains("is-open")) {
      closeModal();
    }
  });

  // Global handler to open quick view modal with card data
  window.openQuickView = function(card) {
    if (!card) return;

    const name = card.querySelector(".eq-product-card__name, .eq-saree-masterpiece__name")?.textContent.trim() || "Earthquick Piece";
    const category = card.querySelector(".eq-product-card__category")?.textContent.trim() || "Artisanal Collection";
    const priceEl = card.querySelector(".eq-product-card__price, .eq-saree-masterpiece__price");
    const priceHtml = priceEl ? priceEl.innerHTML.trim() : "৳4,200";
    const imgEl = card.querySelector(".eq-product-card__frame img, .eq-saree-masterpiece__frame img");
    const imgSrc = imgEl ? imgEl.getAttribute("src") : "images/saree/saree-01.jpg";
    const linkEl = card.querySelector(".eq-product-card__link, .eq-saree-masterpiece__link");
    const linkHref = linkEl ? linkEl.getAttribute("href") : "pages/product.html";

    const isSaree = category.toLowerCase().includes("saree") || name.toLowerCase().includes("saree");

    body.innerHTML = `
      <div class="eq-quickview-layout">
        <div class="eq-quickview-gallery">
          <div class="eq-quickview-main-image">
            <img src="${imgSrc}" alt="${name}" />
          </div>
        </div>
        <div class="eq-quickview-details">
          <span class="eq-quickview-category">${category}</span>
          <h2 class="eq-quickview-title">${name}</h2>
          <div class="eq-quickview-price-row">
            <span class="eq-quickview-price">${priceHtml}</span>
          </div>
          <p class="eq-quickview-desc">
            Handcrafted with meticulous detail using heritage looms and artisanal dyes. Designed for longevity, effortless draping, and timeless occasion wear.
          </p>
          <div class="eq-quickview-spec-list">
            <div class="eq-quickview-spec-item">
              <span class="eq-quickview-spec-label">Origin:</span>
              <span>Tangail &amp; Narayanganj Handlooms</span>
            </div>
            <div class="eq-quickview-spec-item">
              <span class="eq-quickview-spec-label">Care:</span>
              <span>Dry Clean Recommended &bull; Azo-free Natural Dyes</span>
            </div>
            <div class="eq-quickview-spec-item">
              <span class="eq-quickview-spec-label">Sizing:</span>
              <span>${isSaree ? "5.5m Standard Drape with 0.8m Blouse Piece" : "Tailored Relaxed Silhouette"}</span>
            </div>
          </div>
          <div class="eq-quickview-actions">
            <button type="button" class="eq-btn eq-btn--primary eq-btn--pill" id="quickview-add-bag">
              Add to Bag
            </button>
            <a href="${linkHref}" class="eq-btn eq-btn--outline eq-btn--pill">
              View Full Details
            </a>
          </div>
        </div>
      </div>
    `;

    // Bind Add to Bag button inside modal
    const addBagBtn = body.querySelector("#quickview-add-bag");
    if (addBagBtn) {
      addBagBtn.addEventListener("click", () => {
        cartCount++;
        const countBadge = document.querySelector("#eq-cart-count") || document.querySelector(".eq-cart-count");
        if (countBadge) {
          countBadge.textContent = String(cartCount);
          countBadge.style.display = "flex";
        }
        Toast.show(`Added "${name}" to your shopping bag.`);
        closeModal();
      });
    }

    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  };
}


/* =====================================================================
   11. INITIALIZATION BOOTSTRAP
   Mounts all components cleanly after the document is loaded.
   ===================================================================== */
function initEarthquickApp() {
  Toast.init();
  initNavbar();
  initHeroSlider();
  initSearchModal();
  initQuickViewModal();
  initCart();
  initAccount();
  initCarousels();
  initScrollReveal();
  initNewsletterForm();
}

// Re-bind navbar, search, and cart if common layout components load dynamically
document.addEventListener("eq:components-loaded", () => {
  Toast.init();
  initNavbar();
  initSearchModal();
  if (window.EarthquickCart && typeof window.EarthquickCart.init === "function") {
    window.EarthquickCart.init();
  }
});

// Expose globally for layout loader
window.initNavbar = initNavbar;
window.initSearchModal = initSearchModal;
window.initEarthquickApp = initEarthquickApp;

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initEarthquickApp);
} else {
  initEarthquickApp();
}

