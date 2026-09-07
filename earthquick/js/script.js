/* =====================================================================
   EARTHQUICK — MAIN SCRIPT (Homepage)
   This file currently powers only the homepage. It is organized into
   small, independent modules so future pages (category pages, product
   detail page) can be added here later without restructuring anything:

   1. NAVBAR          -> sticky shadow on scroll, mobile menu toggle
   2. CART (mock)      -> in-memory cart counter, no backend yet
   3. CAROUSEL         -> powers "New Arrivals" and "Three Piece"
   4. SCROLL REVEAL    -> one-time fade/rise when a section enters view
   5. NEWSLETTER FORM  -> demo submit handler for the final CTA section
   6. INIT             -> runs everything once the page has loaded

   NOTE FOR FUTURE STEPS: when the category pages and product.html are
   built, a shared product-data array (id, name, price, images, etc.)
   and reusable render functions will be added here so every page pulls
   from the same source of truth. Not needed yet for the homepage alone.
   ===================================================================== */


/* =====================================================================
   1. NAVBAR — sticky shadow on scroll + mobile menu toggle
   ===================================================================== */
function initNavbar() {
  const navbar = document.querySelector(".eq-navbar");
  const toggle = document.querySelector(".eq-navbar__toggle");
  const links = document.querySelector(".eq-navbar__links");

  if (!navbar) return;

  // Add a subtle shadow/border once the page has scrolled a little.
  const onScroll = () => {
    navbar.classList.toggle("is-scrolled", window.scrollY > 12);
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  if (toggle && links) {
    toggle.addEventListener("click", () => {
      const isOpen = links.classList.toggle("is-open");
      toggle.classList.toggle("is-open", isOpen);
      toggle.setAttribute("aria-expanded", String(isOpen));
    });

    // Close the mobile menu automatically when a link is tapped.
    links.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        links.classList.remove("is-open");
        toggle.classList.remove("is-open");
      });
    });
  }
}


/* =====================================================================
   2. CART (mock)
   This is a frontend demo, so the cart is an in-memory counter only —
   nothing is persisted or sent anywhere yet. Real add-to-cart behavior
   will be wired up once product pages exist.
   ===================================================================== */
function initCartIcon() {
  const countEl = document.querySelector(".eq-cart-count");
  const cartButton = document.querySelector('[data-action="open-cart"]');
  if (!countEl) return;

  countEl.style.display = "none"; // hidden until something is actually added

  if (cartButton) {
    cartButton.addEventListener("click", () => {
      try {
        alert("This is a frontend demo — the cart drawer isn't wired up yet.");
      } catch (e) {
        console.log("This is a frontend demo — the cart drawer isn't wired up yet.");
      }
    });
  }
}


/* =====================================================================
   3. CAROUSEL
   Powers any ".eq-carousel" block (New Arrivals, Three Piece). Moves
   the track by exactly one product-card width per arrow click.
   ===================================================================== */
function initCarousels() {
  document.querySelectorAll(".eq-carousel").forEach((carousel) => {
    const viewport = carousel.querySelector(".eq-carousel__viewport");
    const track = carousel.querySelector(".eq-carousel__track");
    if (!viewport || !track) return;

    // The prev/next arrow buttons live in the section header just above
    // the carousel (see the "New Arrivals" / "Three Piece" markup in
    // index.html), not inside .eq-carousel itself — so we look for them
    // anywhere within the enclosing <section>.
    const scope = carousel.closest(".eq-section") || carousel;
    const prevBtn = scope.querySelector('[data-action="prev"]');
    const nextBtn = scope.querySelector('[data-action="next"]');

    let position = 0;

    function cardStep() {
      const card = track.querySelector(".eq-product-card");
      if (!card) return 0;
      const style = window.getComputedStyle(track);
      const gap = parseFloat(style.columnGap || style.gap || "0");
      return card.getBoundingClientRect().width + gap;
    }

    function maxScroll() {
      return Math.max(0, track.scrollWidth - viewport.clientWidth);
    }

    function update() {
      position = Math.min(Math.max(position, 0), maxScroll());
      track.style.transform = `translateX(-${position}px)`;
      if (prevBtn) prevBtn.disabled = position <= 0;
      if (nextBtn) nextBtn.disabled = position >= maxScroll() - 1;
    }

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

    window.addEventListener("resize", update);
    update();
  });
}


/* =====================================================================
   4. SCROLL REVEAL
   A single, deliberate fade + rise applied once per element the first
   time it enters the viewport. Kept intentionally subtle.
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
    { threshold: 0.15 }
  );

  items.forEach((el) => observer.observe(el));
}


/* =====================================================================
   5. NEWSLETTER FORM
   Demo-only submit handler for the final brand story section.
   ===================================================================== */
function initNewsletterForm() {
  const form = document.querySelector("[data-newsletter-form]");
  if (!form) return;

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    try {
      alert("Thanks for subscribing — this demo does not send data anywhere.");
    } catch (e) {
      console.log("Thanks for subscribing — this demo does not send data anywhere.");
    }
    form.reset();
  });
}


/* =====================================================================
   6. INIT
   ===================================================================== */
document.addEventListener("DOMContentLoaded", () => {
  initNavbar();
  initCartIcon();
  initCarousels();
  initScrollReveal();
  initNewsletterForm();
});
