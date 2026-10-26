const PARTIALS_VERSION = "6";

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
  initTopbar();
}

function initTopbar() {
  const items = document.querySelectorAll(".topbar-item");
  if (items.length < 2) return;
  let i = 0;
  setInterval(() => {
    items[i].classList.remove("is-active");
    i = (i + 1) % items.length;
    items[i].classList.add("is-active");
  }, 4200);
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
    ".two-col > div", ".feature", ".service-card", ".testimonial-card",
    ".category-panel", ".category-card", ".info-card", ".gallery-item",
    ".product-card", ".event-banner", ".contact-grid > *", ".process-step", ".size-tool",
    ".voucher-card"
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

function initSwatchGroups() {
  document.querySelectorAll("[data-swatch-group]").forEach((group) => {
    group.querySelectorAll("button").forEach((btn) => {
      btn.addEventListener("click", () => {
        group.querySelectorAll("button").forEach((b) => b.classList.remove("is-selected"));
        btn.classList.add("is-selected");
        const scope = group.closest(".size-tool-form, .quote-form") || document;
        const summary = scope.querySelector("[data-quote-summary]");
        if (summary) {
          const anyag = scope.querySelector('[data-swatch-group="anyag"] .is-selected')?.getAttribute("data-value");
          const szin = scope.querySelector('[data-swatch-group="szin"] .is-selected')?.getAttribute("data-value");
          const parts = [];
          if (anyag) parts.push(`Anyag: ${anyag}`);
          if (szin) parts.push(`Szín: ${szin}`);
          summary.textContent = parts.length ? parts.join(" · ") : "Válassz anyagot és színt a fentiek közül.";
        }
      });
    });
  });
}

function initQuoteTabs() {
  document.querySelectorAll(".quote-tabs").forEach((tabs) => {
    const wrap = tabs.parentElement;
    tabs.querySelectorAll(".quote-tab").forEach((tab) => {
      tab.addEventListener("click", () => {
        tabs.querySelectorAll(".quote-tab").forEach((t) => t.classList.remove("is-active"));
        tab.classList.add("is-active");
        const key = tab.getAttribute("data-tab");
        wrap.querySelectorAll(".quote-panel").forEach((p) => {
          p.classList.toggle("is-active", p.getAttribute("data-panel") === key);
        });
      });
    });
  });
}

function submitCallbackForm(event) {
  event.preventDefault();
  const form = event.target;
  const category = form.closest("[data-category]")?.dataset.category || "";
  const name = form.querySelector('[name="name"]').value.trim();
  const phone = form.querySelector('[name="phone"]').value.trim();
  const subject = encodeURIComponent(category ? `Visszahívás kérés – ${category}` : "Visszahívás kérés – In My Style");
  const body = encodeURIComponent(`${category ? "Kategória: " + category + "\n" : ""}Név: ${name}\nTelefonszám: ${phone}`);
  window.location.href = `mailto:hello@inmystyle.hu?subject=${subject}&body=${body}`;
  return false;
}

function initSizeQuoteSubmit() {
  document.querySelectorAll("[data-size-quote-submit]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const panel = btn.closest(".size-tool");
      const category = btn.closest("[data-category]")?.dataset.category || "";
      const name = panel.querySelector('[name="name"]')?.value.trim() || "";
      const phone = panel.querySelector('[name="phone"]')?.value.trim() || "";
      if (!name || !phone) {
        alert("Kérlek add meg a neved és telefonszámod az ajánlatkéréshez.");
        return;
      }
      const magassag = panel.querySelector('[data-size-output="magassag"]')?.textContent || "";
      const mell = panel.querySelector('[data-size-output="mell"]')?.textContent || "";
      const derek = panel.querySelector('[data-size-output="derek"]')?.textContent || "";
      const csipo = panel.querySelector('[data-size-output="csipo"]')?.textContent || "";
      const anyag = panel.querySelector('[data-swatch-group="anyag"] .is-selected')?.getAttribute("data-value") || "nincs megadva";
      const szin = panel.querySelector('[data-swatch-group="szin"] .is-selected')?.getAttribute("data-value") || "nincs megadva";
      const subject = encodeURIComponent(category ? `Egyedi méret- és stílustervezés – ${category}` : "Egyedi méret- és stílustervezés – In My Style");
      const body = encodeURIComponent(
        `${category ? "Kategória: " + category + "\n" : ""}Magasság: ${magassag}\nMellbőség: ${mell}\nDerékbőség: ${derek}\nCsípőbőség: ${csipo}\nAnyag: ${anyag}\nSzín: ${szin}\nNév: ${name}\nTelefonszám: ${phone}`
      );
      window.location.href = `mailto:hello@inmystyle.hu?subject=${subject}&body=${body}`;
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  includePartials();
  initFilterPills();
  initSwatchGroups();
  initQuoteTabs();
  initSizeQuoteSubmit();
});
