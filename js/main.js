/* In My Style — oldal-interakciók (függőség nélkül) */
(function () {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

  /* Fejléc árnyék görgetéskor */
  const header = $("[data-header]");
  if (header) {
    const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* Asztali lenyíló menü */
  $$("[data-dropdown]").forEach((item) => {
    const btn = $("button", item);
    let timer;
    const open = (v) => { item.classList.toggle("is-open", v); btn.setAttribute("aria-expanded", String(v)); };
    btn.addEventListener("click", () => open(!item.classList.contains("is-open")));
    item.addEventListener("mouseenter", () => { clearTimeout(timer); open(true); });
    item.addEventListener("mouseleave", () => { timer = setTimeout(() => open(false), 160); });
    document.addEventListener("click", (e) => { if (!item.contains(e.target)) open(false); });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") open(false); });
  });

  /* Mobil menü */
  const body = document.body;
  const setDrawer = (v) => body.classList.toggle("drawer-open", v);
  $$("[data-drawer-open]").forEach((b) => b.addEventListener("click", () => setDrawer(true)));
  $$("[data-drawer-close]").forEach((b) => b.addEventListener("click", () => setDrawer(false)));
  $$(".drawer a").forEach((a) => a.addEventListener("click", () => setDrawer(false)));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") setDrawer(false); });

  /* Megjelenési animáció */
  const reveals = $$(".reveal");
  if ("IntersectionObserver" in window && reveals.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("is-visible"); io.unobserve(en.target); } });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    reveals.forEach((el, i) => { el.style.transitionDelay = (i % 4) * 70 + "ms"; io.observe(el); });
  } else {
    reveals.forEach((el) => el.classList.add("is-visible"));
  }

  /* Fülek (ajánlatkérés) */
  $$("[data-tabs]").forEach((wrap) => {
    const tabs = $$('[role="tab"]', wrap);
    const select = (tab) => {
      tabs.forEach((t) => {
        const on = t === tab;
        t.setAttribute("aria-selected", String(on));
        t.tabIndex = on ? 0 : -1;
        const panel = document.getElementById(t.getAttribute("aria-controls"));
        if (panel) panel.hidden = !on;
      });
    };
    tabs.forEach((t, i) => {
      t.addEventListener("click", () => select(t));
      t.addEventListener("keydown", (e) => {
        if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
          const next = tabs[(i + (e.key === "ArrowRight" ? 1 : tabs.length - 1)) % tabs.length];
          next.focus(); select(next);
        }
      });
    });
  });

  /* Méretsegéd */
  const LINE_RANGE = { mellboseg: ["mell", 20, 50], derekboseg: ["derek", 12, 36], csipoboseg: ["csipo", 22, 54] };
  $$("[data-size-tool]").forEach((root) => {
    $$("[data-size-input]", root).forEach((input) => {
      const key = input.dataset.sizeInput;
      const out = $(`[data-size-output="${key}"]`, root);
      const render = () => {
        const v = Number(input.value);
        if (out) out.textContent = v + " cm";
        const badgeKey = key === "magassag" ? "magassag" : (LINE_RANGE[key] || [])[0];
        const badge = badgeKey && $(`[data-badge="${badgeKey}"] b`, root);
        if (badge) badge.textContent = v + " cm";
        const conf = LINE_RANGE[key];
        if (conf) {
          const [line, lo, hi] = conf;
          const g = $(`.size-line[data-line="${line}"]`, root);
          if (g) {
            const t = (v - input.min) / (input.max - input.min);
            const half = lo + t * (hi - lo);
            const l = $("line", g), c = $("circle", g);
            l.setAttribute("x1", 120 - half); l.setAttribute("x2", 120 + half); c.setAttribute("cx", 120 + half);
          }
        }
      };
      input.addEventListener("input", render);
      render();
    });
    $$("[data-swatch]", root).forEach((group) => {
      const hiddenInput = group.parentElement.querySelector(`input[name="${group.dataset.swatch}"]`);
      $$("button", group).forEach((b) => b.addEventListener("click", () => {
        $$("button", group).forEach((x) => x.setAttribute("aria-pressed", "false"));
        b.setAttribute("aria-pressed", "true");
        if (hiddenInput) hiddenInput.value = b.dataset.value;
      }));
    });
  });

  /* Netlify-űrlapok AJAX-küldése */
  $$("form[data-ajax-form]").forEach((form) => {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const status = $(".form-status", form);
      const btn = $('button[type="submit"]', form);
      const label = btn ? btn.textContent : "";
      if (btn) { btn.disabled = true; btn.textContent = "Küldés…"; }
      if (status) { status.className = "form-status"; status.textContent = ""; }
      try {
        const data = new URLSearchParams(new FormData(form)).toString();
        const res = await fetch("/", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: data });
        if (!res.ok) throw new Error(res.status);
        form.reset();
        $$('[aria-pressed="true"]', form).forEach((x) => x.setAttribute("aria-pressed", "false"));
        $$("[data-size-input]", form).forEach((i) => i.dispatchEvent(new Event("input")));
        if (status) { status.textContent = status.dataset.success; status.classList.add("is-success"); }
      } catch (err) {
        if (status) { status.textContent = status.dataset.error; status.classList.add("is-error"); }
      } finally {
        if (btn) { btn.disabled = false; btn.textContent = label; }
      }
    });
  });

  /* Termékgaléria */
  $$("[data-gallery]").forEach((g) => {
    const main = $(".pd-main img", g);
    const source = $(".pd-main source", g);
    $$(".pd-thumbs button", g).forEach((b) => b.addEventListener("click", () => {
      const src = b.dataset.src;
      if (source) source.srcset = src.replace(/\.(jpe?g|png)$/i, ".webp");
      main.src = src;
      $$(".pd-thumbs button", g).forEach((x) => x.removeAttribute("aria-current"));
      b.setAttribute("aria-current", "true");
    }));
  });

  /* Térkép csak akkor töltődik be, ha a látogató odagörget */
  const lazyEmbeds = $$("[data-lazy-embed]");
  if (lazyEmbeds.length) {
    const load = (el) => { el.innerHTML = el.dataset.lazyEmbed; el.removeAttribute("data-lazy-embed"); };
    if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver((entries) => entries.forEach((en) => { if (en.isIntersecting) { load(en.target); io.unobserve(en.target); } }), { rootMargin: "300px" });
      lazyEmbeds.forEach((el) => io.observe(el));
    } else lazyEmbeds.forEach(load);
  }

  /* Calendly: a naptár csak kattintásra töltődik be (gyorsabb oldal) */
  $$("[data-calendly-load]").forEach((btn) => btn.addEventListener("click", () => {
    const box = btn.closest("[data-calendly]");
    const widget = document.createElement("div");
    widget.className = "calendly-inline-widget";
    widget.dataset.url = box.dataset.calendly + "?hide_gdpr_banner=1&locale=hu";
    box.replaceWith(widget);
    const s = document.createElement("script");
    s.src = "https://assets.calendly.com/assets/external/widget.js";
    s.async = true;
    document.body.appendChild(s);
  }));
})();
