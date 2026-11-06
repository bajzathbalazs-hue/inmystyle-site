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

  /* Menü (balról nyíló panel) */
  const body = document.body;
  const drawer = $("#drawer");
  const setDrawer = (v) => {
    body.classList.toggle("drawer-open", v);
    if (drawer) drawer.setAttribute("aria-hidden", String(!v));
    $$("[data-drawer-open]").forEach((b) => b.setAttribute("aria-expanded", String(v)));
    if (v && drawer) setTimeout(() => { const f = $("button, a", drawer); if (f) f.focus(); }, 50);
  };
  $$("[data-drawer-open]").forEach((b) => b.addEventListener("click", () => setDrawer(true)));
  $$("[data-drawer-close]").forEach((b) => b.addEventListener("click", () => setDrawer(false)));
  $$(".drawer a").forEach((a) => a.addEventListener("click", () => setDrawer(false)));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") setDrawer(false); });
  if (drawer && window.matchMedia("(min-width: 761px)").matches) { const d = $("details", drawer); if (d) d.open = true; }

  /* Mobil hívás/időpont sáv: a nyitókép után jelenik meg */
  const cta = $("[data-mobile-cta]");
  if (cta) {
    const onScrollCta = () => cta.classList.toggle("is-visible", window.scrollY > window.innerHeight * 0.6);
    onScrollCta();
    window.addEventListener("scroll", onScrollCta, { passive: true });
  }

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
        const fname = (form.querySelector('input[name="form-name"]') || {}).value || "urlap";
        if (fname === "hirlevel") track("sign_up", { method: "hirlevel" }); else track("generate_lead", { form_name: fname });
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
  /* ============ Mérés: GA4 + Meta pixel, csak hozzájárulás után ============ */
  const CFG = window.IMS || {};
  const HAS_TRACKING = !!(CFG.ga4 || CFG.pixel);
  const CONSENT_KEY = "ims-consent";
  const store = { get() { try { return localStorage.getItem(CONSENT_KEY); } catch (e) { return null; } }, set(v) { try { localStorage.setItem(CONSENT_KEY, v); } catch (e) {} } };
  let loaded = false;
  const FB_MAP = { generate_lead: "Lead", sign_up: "CompleteRegistration", booking_complete: "Schedule", phone_click: "Contact", whatsapp_click: "Contact", messenger_click: "Contact", email_click: "Contact", view_item: "ViewContent" };
  function track(name, params) {
    params = params || {};
    window.dataLayer.push(Object.assign({ event: name }, params));
    if (window.gtag && CFG.ga4) window.gtag("event", name, params);
    if (window.fbq && CFG.pixel && FB_MAP[name]) window.fbq("track", FB_MAP[name], params);
  }
  window.imsTrack = track;
  function loadTracking() {
    if (loaded) return; loaded = true;
    if (CFG.ga4) {
      window.gtag = function () { window.dataLayer.push(arguments); };
      window.gtag("consent", "default", { ad_storage: "granted", ad_user_data: "granted", ad_personalization: "granted", analytics_storage: "granted" });
      window.gtag("js", new Date());
      window.gtag("config", CFG.ga4);
      const g = document.createElement("script"); g.async = true; g.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(CFG.ga4); document.head.appendChild(g);
    }
    if (CFG.pixel) {
      !function (f, b, e, v, n, t, s) { if (f.fbq) return; n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); }; if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = "2.0"; n.queue = []; t = b.createElement(e); t.async = !0; t.src = v; s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s); }(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");
      window.fbq("init", CFG.pixel); window.fbq("track", "PageView");
    }
    const vi = $("[data-view-item]");
    if (vi) track("view_item", { item_name: vi.dataset.viewItem, item_category: vi.dataset.itemCategory });
  }
  const banner = $("[data-consent]");
  if (HAS_TRACKING) {
    const choice = store.get();
    if (choice === "granted") loadTracking();
    else if (!choice && banner) banner.hidden = false;
    $$("[data-consent-choice]").forEach((b) => b.addEventListener("click", () => {
      const v = b.dataset.consentChoice; store.set(v); if (banner) banner.hidden = true;
      if (v === "granted") loadTracking(); else if (loaded) location.reload();
    }));
    $$("[data-consent-open]").forEach((b) => b.addEventListener("click", () => { if (banner) banner.hidden = false; }));
  }

  /* Kattintások mérése (hívás, üzenet, e-mail, időpont, útvonal, közösségi oldalak) */
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a, button"); if (!a) return;
    const href = a.getAttribute("href") || "";
    const where = a.closest("[data-help]") ? "sugo" : a.closest(".site-footer") ? "lablec" : a.closest(".site-header, .drawer") ? "fejlec" : a.closest(".mobile-cta") ? "mobil_sav" : a.closest(".pd-actions") ? "termekoldal" : "tartalom";
    if (href.startsWith("tel:")) track("phone_click", { location: where });
    else if (href.includes("wa.me/")) track("whatsapp_click", { location: where });
    else if (href.includes("m.me/")) track("messenger_click", { location: where });
    else if (href.startsWith("mailto:")) track("email_click", { location: where });
    else if (href.includes("google.com/maps")) track("directions_click", { location: where });
    else if (/instagram\.com|facebook\.com/.test(href)) track("social_click", { network: href.includes("instagram") ? "instagram" : "facebook", location: where });
    else if (a.hasAttribute("data-calendly-load")) track("booking_open", { location: where });
    else if (href.endsWith("#ajanlatkeres")) track("quote_cta_click", { location: where });
  });
  /* Calendly: sikeres foglalás */
  window.addEventListener("message", (e) => {
    if (e.origin.indexOf("calendly.com") === -1 || !e.data || typeof e.data.event !== "string") return;
    if (e.data.event === "calendly.event_scheduled") track("booking_complete", {});
  });

  /* ============ Súgó automatikus válaszokkal ============ */
  const help = $("[data-help]");
  if (help) {
    let DATA = []; try { DATA = JSON.parse($("#help-data").textContent); } catch (e) {}
    const panel = $(".help-panel", help), fab = $(".help-fab", help), log = $("[data-help-log]", help), input = $("#help-input", help);
    const norm = (t) => t.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
    const escH = (t) => t.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
    let opened = false;
    const setOpen = (v) => {
      panel.hidden = !v; fab.setAttribute("aria-expanded", String(v)); help.classList.toggle("is-open", v);
      if (v) { setTimeout(() => input.focus(), 60); if (!opened) { opened = true; track("help_open", {}); } }
      else fab.focus();
    };
    $$("[data-help-toggle]", help).forEach((b) => b.addEventListener("click", () => setOpen(panel.hidden)));
    document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !panel.hidden) setOpen(false); });
    const say = (html, who) => { const d = document.createElement("div"); d.className = "help-msg " + who; d.innerHTML = html; log.appendChild(d); log.scrollTop = log.scrollHeight; };
    const answer = (item) => {
      let html = escH(item.a);
      if (item.cta) html += `<a class="help-cta" href="${escH(item.cta[1])}"${/^https?:/.test(item.cta[1]) ? ' target="_blank" rel="noopener"' : ""}>${escH(item.cta[0])} →</a>`;
      setTimeout(() => say(html, "bot"), 250);
    };
    const fallback = () => setTimeout(() => say("Erre most nem tudok pontos választ adni, de szívesen segítünk személyesen: írj nekünk Messengeren vagy WhatsAppon, vagy hívj minket a lenti gombokkal.", "bot"), 250);
    $$("[data-help-q]", help).forEach((b) => b.addEventListener("click", () => {
      const item = DATA.find((d) => d.id === b.dataset.helpQ); if (!item) return;
      say(escH(item.q), "user"); answer(item); track("help_topic", { topic: item.id });
    }));
    $("[data-help-form]", help).addEventListener("submit", (e) => {
      e.preventDefault();
      const q = input.value.trim(); if (!q) return;
      say(escH(q), "user"); input.value = "";
      const words = norm(q).split(/[^a-z0-9]+/).filter(Boolean);
      let best = null, score = 0;
      DATA.forEach((d) => { let sc = 0; d.k.forEach((k) => { if (words.some((w) => w.startsWith(k) || (w.length > 3 && k.startsWith(w)))) sc++; }); if (sc > score) { score = sc; best = d; } });
      if (best) { answer(best); track("help_topic", { topic: best.id, source: "szabad_szoveg" }); }
      else { fallback(); track("help_unanswered", {}); }
    });
    if (location.hash === "#segitseg") setOpen(true);
  }

})();
