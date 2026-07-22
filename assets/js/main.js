/* ===========================================================
   Manfare - main.js
   - Infinity autoplay sliders (Hero + Categories + product rows)
   - Autoplay 3s, pause on hover
   - Add-to-cart counter
   - Mobile menu toggle
   =========================================================== */

document.addEventListener("DOMContentLoaded", function () {
  /* ---------------- Mobile menu ---------------- */
  const menuBtn = document.getElementById("menuBtn");
  const mobileMenu = document.getElementById("mobileMenu");
  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener("click", function () {
      mobileMenu.classList.toggle("hidden");
    });
  }

  /* ---------------- Hero infinity slider (autoplay 3s) ----------------
     Each hero "slide" holds for 3s, then advances. Loops infinitely. */
  document.querySelectorAll("[data-hero]").forEach(function (hero) {
    const track = hero.querySelector("[data-hero-track]");
    if (!track) return;
    const slides = track.children.length;
    let index = 0;

    function go(i) {
      index = (i + slides) % slides;
      track.style.transform = "translateX(" + -index * 100 + "%)";
    }

    let timer = setInterval(function () {
      go(index + 1);
    }, 3000);

    // prev / next controls
    hero.querySelectorAll("[data-hero-prev]").forEach(function (b) {
      b.addEventListener("click", function () {
        go(index - 1);
        reset();
      });
    });
    hero.querySelectorAll("[data-hero-next]").forEach(function (b) {
      b.addEventListener("click", function () {
        go(index + 1);
        reset();
      });
    });

    function reset() {
      clearInterval(timer);
      timer = setInterval(function () {
        go(index + 1);
      }, 3000);
    }

    // pause on hover
    hero.addEventListener("mouseenter", function () {
      clearInterval(timer);
    });
    hero.addEventListener("mouseleave", reset);
  });

  /* ---------------- Arrow-navigated carousels ----------------
     Manual navigation. Each prev/next click moves exactly one product.
     Wraps around at the ends for an infinity feel. Autoplay OFF. */
  document.querySelectorAll("[data-carousel]").forEach(function (root) {
    const track = root.querySelector("[data-carousel-track]");
    if (!track) return;

    let index = 0;

    function cardStep() {
      const first = track.children[0];
      if (!first) return 0;
      const cs = getComputedStyle(first);
      const ml = parseFloat(cs.marginLeft) || 0;
      const mr = parseFloat(cs.marginRight) || 0;
      return first.getBoundingClientRect().width + ml + mr;
    }

    function perView() {
      const step = cardStep();
      if (!step) return 1;
      return Math.max(1, Math.floor((root.getBoundingClientRect().width + 2) / step));
    }

    function maxIndex() {
      return Math.max(0, track.children.length - perView());
    }

    // Dots element container
    const hasDots = root.getAttribute("data-dots") === "true";
    let dotsContainer = null;
    if (hasDots) {
      dotsContainer = document.createElement("div");
      dotsContainer.className = "carousel-dots";
      root.appendChild(dotsContainer);
    }

    function updateDots() {
      if (!dotsContainer) return;
      dotsContainer.innerHTML = "";
      const count = maxIndex() + 1;
      if (count <= 1) return; // No need for dots if all items fit in viewport
      for (let i = 0; i < count; i++) {
        const dot = document.createElement("button");
        dot.type = "button";
        dot.className = "carousel-dot" + (i === index ? " active" : "");
        dot.setAttribute("aria-label", "Go to slide " + (i + 1));
        dot.addEventListener("click", function () {
          index = i;
          apply();
          stopAutoplay();
          startAutoplay();
        });
        dotsContainer.appendChild(dot);
      }
    }

    function apply() {
      const max = maxIndex();
      if (index > max) index = max;

      const totalWidth = track.children.length * cardStep();
      const vpWidth = root.getBoundingClientRect().width;
      const maxTranslate = Math.max(0, totalWidth - vpWidth);

      const x = Math.min(index * cardStep(), maxTranslate);
      track.style.transform = "translateX(" + -x + "px)";
      
      updateDots();
    }

    function go(dir) {
      const max = maxIndex();
      index += dir;
      if (index > max) index = 0; // wrap to start
      else if (index < 0) index = max; // wrap to end
      apply();
    }

    // build prev / next buttons
    const hasArrows = root.getAttribute("data-arrows") !== "false";
    let prev = null;
    let next = null;

    if (hasArrows) {
      prev = document.createElement("button");
      prev.type = "button";
      prev.className = "carousel-btn carousel-prev";
      prev.setAttribute("aria-label", "Previous product");
      prev.innerHTML = '<i data-lucide="chevron-left"></i>';

      next = document.createElement("button");
      next.type = "button";
      next.className = "carousel-btn carousel-next";
      next.setAttribute("aria-label", "Next product");
      next.innerHTML = '<i data-lucide="chevron-right"></i>';

      root.appendChild(prev);
      root.appendChild(next);
    }

    // -------- autoplay (if data-autoplay attribute is set) --------
    var autoplayDelay = root.getAttribute("data-autoplay");
    var timer = null;

    function startAutoplay() {
      if (autoplayDelay) {
        timer = setInterval(function () { go(1); }, parseInt(autoplayDelay, 10));
      }
    }
    function stopAutoplay() {
      if (timer) { clearInterval(timer); timer = null; }
    }

    if (hasArrows && prev && next) {
      prev.addEventListener("click", function () {
        go(-1);
        stopAutoplay();
        startAutoplay();
      });
      next.addEventListener("click", function () {
        go(1);
        stopAutoplay();
        startAutoplay();
      });
    }

    if (autoplayDelay) {
      root.addEventListener("mouseenter", stopAutoplay);
      root.addEventListener("mouseleave", startAutoplay);
    }

    let resizeTimer;
    window.addEventListener("resize", function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(apply, 150);
    });

    apply();
    startAutoplay();
  });

  // render the lucide icons inside the injected carousel buttons
  if (window.lucide && typeof window.lucide.createIcons === "function") {
    window.lucide.createIcons();
  }

  /* ---------------- Add to cart ---------------- */
  const cartCountEls = document.querySelectorAll("[data-cart-count]");
  let cartCount = 0;

  function renderCart() {
    cartCountEls.forEach(function (el) {
      el.textContent = String(cartCount);
      el.classList.toggle("hidden", cartCount === 0);
    });
  }

  document.addEventListener("click", function (e) {
    const btn = e.target.closest("[data-add-cart]");
    if (!btn) return;
    cartCount += 1;
    renderCart();

    const original = btn.textContent;
    btn.textContent = "Added \u2713";
    btn.disabled = true;
    setTimeout(function () {
      btn.textContent = original;
      btn.disabled = false;
    }, 1200);
  });

  renderCart();

  /* ---------------- Newsletter ---------------- */
  const form = document.getElementById("newsletterForm");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      const input = form.querySelector("input[type='email']");
      const note = document.getElementById("newsletterNote");
      if (input && input.value) {
        if (note) {
          note.textContent = "Thanks for subscribing!";
          note.classList.remove("hidden");
        }
        input.value = "";
      }
    });
  }

  /* ---------------- Footer year ---------------- */
  const y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();
});
