const PARTIALS_VERSION = "2";

async function includePartials() {
  const nodes = document.querySelectorAll("[data-include]");
  await Promise.all(
    Array.from(nodes).map(async (node) => {
      const file = node.getAttribute("data-include");
      const res = await fetch(`partials/${file}?v=${PARTIALS_VERSION}`, { cache: "no-cache" });
      node.innerHTML = await res.text();

      // <script> tags set via innerHTML never execute — recreate each one so
      // things like the Calendly embed actually load.
      Array.from(node.querySelectorAll("script")).forEach((oldScript) => {
        const newScript = document.createElement("script");
        Array.from(oldScript.attributes).forEach((attr) =>
          newScript.setAttribute(attr.name, attr.value)
        );
        newScript.textContent = oldScript.textContent;
        oldScript.replaceWith(newScript);
      });

      // Unwrap the placeholder div: a wrapper here would make position:sticky
      // children (the header) only stick within the wrapper's own short height.
      const parent = node.parentNode;
      while (node.firstChild) parent.insertBefore(node.firstChild, node);
      parent.removeChild(node);
    })
  );
  initNav();
  initNavAccordion();
  initHeaderScroll();
  initReveal();
}

function initHeaderScroll() {
  const header = document.querySelector(".site-header");
  if (!header) return;
  function onScroll() {
    header.classList.toggle("is-scrolled", window.scrollY > 12);
  }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
}

function initReveal() {
  const selector = [
    ".two-col > div", ".feature", ".help-item", ".testimonial-card",
    ".category-panel", ".category-card", ".info-card", ".gallery-item",
    ".product-card", ".event-banner", ".contact-grid > *", ".process-step", ".size-tool"
  ].join(", ");
  const items = Array.from(document.querySelectorAll(selector));
  if (!items.length) return;

  items.forEach((el, i) => {
    el.classList.add("reveal");
    el.style.transitionDelay = (i % 3) * 90 + "ms";
  });

  let pending = items.slice();
  let ticking = false;

  function sweep() {
    ticking = false;
    const vh = window.innerHeight;
    pending = pending.filter((el) => {
      const r = el.getBoundingClientRect();
      const visible = r.top < vh + 200 && r.bottom > -200;
      if (visible) el.classList.add("is-visible");
      return !visible;
    });
    if (pending.length === 0) {
      window.removeEventListener("scroll", onScrollOrResize);
      window.removeEventListener("resize", onScrollOrResize);
    }
  }

  function onScrollOrResize() {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(sweep);
    }
  }

  sweep();
  window.addEventListener("scroll", onScrollOrResize, { passive: true });
  window.addEventListener("resize", onScrollOrResize);
}

function initNav() {
  const drawer = document.querySelector("[data-nav-drawer]");
  const backdrop = document.querySelector("[data-nav-backdrop]");
  const openBtn = document.querySelector("[data-nav-open]");
  const closeBtn = document.querySelector("[data-nav-close]");

  function open() {
    drawer.classList.add("open");
    backdrop.classList.add("open");
  }
  function close() {
    drawer.classList.remove("open");
    backdrop.classList.remove("open");
  }
  openBtn?.addEventListener("click", open);
  closeBtn?.addEventListener("click", close);
  backdrop?.addEventListener("click", close);
}

function initNavAccordion() {
  document.querySelectorAll("[data-toggle]").forEach((btn) => {
    const targetId = btn.getAttribute("data-toggle");
    const panel = document.getElementById(targetId);
    if (!panel) return;
    btn.setAttribute("aria-expanded", "false");
    btn.addEventListener("click", () => {
      const isOpen = btn.classList.toggle("is-open");
      panel.classList.toggle("is-open", isOpen);
      btn.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });
  });
}

function initFilterPills() {
  const pills = document.querySelectorAll("[data-filter]");
  const cards = document.querySelectorAll("[data-category]");
  pills.forEach((pill) => {
    pill.addEventListener("click", () => {
      pills.forEach((p) => p.classList.remove("active"));
      pill.classList.add("active");
      const filter = pill.getAttribute("data-filter");
      cards.forEach((card) => {
        const match = filter === "all" || card.getAttribute("data-category") === filter;
        card.style.display = match ? "" : "none";
      });
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  includePartials();
  initFilterPills();
});
