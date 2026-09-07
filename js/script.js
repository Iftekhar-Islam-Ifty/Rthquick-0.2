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
   4. SHOPPING CART & QUICK ADD
   Manages client-side cart count, badge updates, and quick-add actions.
   ===================================================================== */
let cartCount = 0;

function initCart() {
  const countBadge = document.querySelector("#eq-cart-count") || document.querySelector(".eq-cart-count");
  const cartButton = document.querySelector('[data-action="open-cart"]');

  // Update badge display state
  const updateBadge = () => {
    if (!countBadge) return;
    countBadge.textContent = String(cartCount);
    countBadge.style.display = cartCount > 0 ? "flex" : "none";
  };
  updateBadge();

  // Cart button click handler
  if (cartButton) {
    cartButton.addEventListener("click", () => {
      if (cartCount === 0) {
        Toast.show("Your shopping bag is currently empty.");
      } else {
        Toast.show(`Your bag contains ${cartCount} ${cartCount === 1 ? "item" : "items"}. Checkout ready.`);
      }
    });
  }

  // Quick add / quick view buttons on product cards
  document.querySelectorAll(".eq-product-card__quick-add").forEach((btn) => {
    btn.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();

      const card = btn.closest(".eq-product-card") || btn.closest(".eq-saree-masterpiece");
      if (card && typeof window.openQuickView === "function") {
        window.openQuickView(card);
      } else {
        cartCount++;
        updateBadge();
        const nameEl = card ? card.querySelector(".eq-product-card__name") : null;
        const title = nameEl ? nameEl.textContent.trim() : "Item";
        Toast.show(`Added "${title}" to your bag.`);
      }
    });
  });
}


/* =====================================================================
   5. ACCOUNT ACTIONS
   Handles feedback for the user profile/account icon in header.
   ===================================================================== */
function initAccount() {
  const accountButton = document.querySelector('[data-action="open-account"]');
  if (accountButton) {
    accountButton.addEventListener("click", () => {
      Toast.show("Member Account & Orders portal is coming soon.");
    });
  }
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
    { threshold: 0.12 }
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
document.addEventListener("DOMContentLoaded", () => {
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
});
