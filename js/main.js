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

  /* ============ Súgó: szövegértés, termékkeresés, oldalra irányítás ============ */
  const help = $("[data-help]");
  if (help) {
    const panel = $(".help-panel", help), fab = $(".help-fab", help), log = $("[data-help-log]", help), input = $("#help-input", help);
    const SS = "ims-help";
    const ss = { get() { try { return JSON.parse(sessionStorage.getItem(SS)) || null; } catch (e) { return null; } }, set(v) { try { sessionStorage.setItem(SS, JSON.stringify(v)); } catch (e) {} } };
    const state = ss.get() || { open: false, msgs: [], last: null };
    let DATA = null;
    const loadData = () => DATA ? Promise.resolve(DATA) : fetch(help.dataset.src).then((r) => r.json()).then((d) => (DATA = d)).catch(() => (DATA = { faq: [], cats: [], prods: [], pages: [] }));
    const escH = (t) => String(t).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
    const norm = (t) => t.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
    /* egyszerű magyar toldalékleválasztás és elírástűrés */
    const SUFFIX = ["okat", "eket", "akat", "ainkat", "einket", "jaitok", "ban", "ben", "bol", "bol", "rol", "nak", "nek", "val", "vel", "hoz", "hez", "hoz", "nal", "nel", "tol", "ert", "ig", "ok", "ek", "ak", "ot", "et", "at", "os", "es", "as", "t", "k", "a", "e"];
    const stem = (w) => { for (const s of SUFFIX) if (w.length - s.length >= 3 && w.endsWith(s)) return w.slice(0, -s.length); return w; };
    const lev = (a, b) => { if (Math.abs(a.length - b.length) > 1) return 2; const m = a.length, n = b.length; let prev = Array.from({ length: n + 1 }, (_, k) => k); for (let x = 1; x <= m; x++) { const cur = [x]; for (let y = 1; y <= n; y++) cur[y] = Math.min(prev[y] + 1, cur[y - 1] + 1, prev[y - 1] + (a[x - 1] === b[y - 1] ? 0 : 1)); prev = cur; } return prev[n]; };
    const tokenize = (t) => norm(t).split(/[^a-z0-9]+/).filter((w) => w.length > 1);
    /* egy kulcsszó és a kérdés szavainak egyezése: 1 = pontos, 0.8 = toldalékos, 0.6 = elírás */
    const hit = (kw, toks, raw) => {
      if (kw.includes(" ")) return raw.includes(kw) ? 1.2 : 0;
      let best = 0;
      for (const w of toks) {
        if (w === kw) return 1;
        const sw = stem(w), sk = stem(kw);
        if (sw === sk || (sk.length >= 3 && w.startsWith(sk) && (w.length - sk.length <= 5 || sk.length >= 5)) || (sw.length >= 5 && kw.startsWith(sw) && kw.length - sw.length <= 1)) best = Math.max(best, 0.8);
        else if (w.length >= 5 && kw.length >= 5 && lev(w, kw) <= 1) best = Math.max(best, 0.6);
      }
      return best;
    };
    const scoreItem = (keys, toks, raw) => keys.reduce((sum, k) => sum + hit(k, toks, raw), 0);
    const NAV = /(mutas|nyis|vigy|vinn|menj|ugor|hol talal|hol lat|lapoz|oldalra)/;

    const render = (m) => {
      const d = document.createElement("div"); d.className = "help-msg " + m.who; d.innerHTML = m.html; log.appendChild(d); log.scrollTop = log.scrollHeight;
    };
    const push = (html, who) => { const m = { html, who }; state.msgs.push(m); state.msgs = state.msgs.slice(-30); ss.set(state); render(m); };
    const bot = (html, delay) => setTimeout(() => push(html, "bot"), delay == null ? 280 : delay);
    const link = (n, u) => `<a class="help-cta" href="${escH(u)}"${/^https?:/.test(u) ? ' target="_blank" rel="noopener"' : ""}>${escH(n)} →</a>`;
    const cards = (list) => `<div class="help-cards">${list.map((p) => `<a class="help-card" href="${escH(p.u)}"><img src="${escH(p.img)}" alt="" loading="lazy" width="48" height="60"><span><b>${escH(p.n)}</b><small>${escH(p.cn)} · ${escH(p.p || "Ár egyeztetés alapján")}</small></span></a>`).join("")}</div>`;
    const suggest = (list) => `<div class="help-suggest">${list.map((f) => `<button type="button" class="chip" data-help-q="${escH(f.id)}">${escH(f.q)}</button>`).join("")}</div>`;
    const go = (u, n) => { bot(`Megnyitom: <b>${escH(n)}</b>…`, 200); track("help_navigate", { target: u }); state.open = true; ss.set(state); setTimeout(() => { location.href = u; if (u.startsWith("/#") && location.pathname === "/") setOpen(true); }, 1100); };

    function respond(q) {
      const raw = " " + norm(q) + " ", toks = tokenize(q);
      const wantsNav = NAV.test(raw);
      const faq = DATA.faq.map((f) => ({ f, s: scoreItem(f.k, toks, raw) })).filter((x) => x.s > 0.5).sort((a, b) => b.s - a.s);
      const cats = DATA.cats.map((c) => ({ c, s: scoreItem(c.k, toks, raw) })).filter((x) => x.s > 0.5).sort((a, b) => b.s - a.s);
      /* termék: a név szavainak legalább fele egyezzen, vagy egy jellegzetes szó (pl. szín + típus) */
      const prods = DATA.prods.map((p) => { const s = scoreItem(p.k.filter((k) => k.length > 2), toks, raw); return { p, s }; }).filter((x) => x.s >= 1.6).sort((a, b) => b.s - a.s);
      if (prods.length) { const top = prods[0].s; for (let k = prods.length - 1; k > 0; k--) if (prods[k].s < top * 0.75) prods.splice(k, 1); }
      const pages = DATA.pages.map((g) => ({ g, s: scoreItem(g.k, toks, raw) })).filter((x) => x.s > 0.5).sort((a, b) => b.s - a.s);
      const topCat = cats[0] && cats[0].c;
      const priceQ = faq.length && faq[0].f.id === "arak";
      const SERVICE = ["igazitas", "estelyi", "ferfi", "ajandek", "fizetes", "kapcsolat", "tavoli", "alkat", "stilus"];
      const serviceFirst = faq.length && SERVICE.includes(faq[0].f.id) && !wantsNav;

      /* 1) konkrét termék(ek) */
      if (prods.length) {
        const list = prods.slice(0, 3).map((x) => x.p);
        state.last = { cat: list[0].c };
        if (wantsNav && prods.length === 1) { go(list[0].u, list[0].n); return "termek"; }
        let html = list.length === 1 ? `Ezt a darabot találtam:` : `Ezeket a darabokat találtam:`;
        if (priceQ) {
          list.sort((x, y) => (y.p ? 1 : 0) - (x.p ? 1 : 0));
          const priced = list.filter((p) => p.p);
          html = priced.length ? priced.map((p) => `A(z) <b>${escH(p.n)}</b> ára ${escH(p.p)}.`).join(" ") + (priced.length < list.length ? " A többi darab egyedi méretre készül, ezek árát a díjmentes konzultáción adjuk meg." : "") + " " + html
            : "Ez a darab egyedi méretre készül, ezért az ára a modelltől és az anyagtól függ. A pontos árat a díjmentes konzultáción adjuk meg. " + html;
        }
        bot(html + cards(list)); return "termek";
      }
      /* 2) kategória (ár vagy navigáció kérdéssel együtt is) */
      if (topCat && !serviceFirst && (!faq.length || cats[0].s > faq[0].s || priceQ || wantsNav)) {
        const inCat = DATA.prods.filter((p) => p.c === topCat.id);
        state.last = { cat: topCat.id };
        if (wantsNav) { go(topCat.u, topCat.n); return "kategoria"; }
        let html;
        if (priceQ) {
          const priced = inCat.filter((p) => p.p);
          html = priced.length ? `A(z) <b>${escH(topCat.n)}</b> kategóriában például: ${priced.slice(0, 3).map((p) => `${escH(p.n)} – ${escH(p.p)}`).join("; ")}. Egyedi méretre készülő darabnál a pontos árat a díjmentes konzultáción adjuk meg.`
            : `A(z) <b>${escH(topCat.n)}</b> kategória darabjai egyedi méretre készülnek, ezért az áruk a modelltől és az anyagtól függ. A pontos árat a díjmentes konzultáción adjuk meg.`;
          html += link("Ajánlatot kérek", "/#ajanlatkeres");
        } else html = `A(z) <b>${escH(topCat.n)}</b> kategóriában ${inCat.length ? `${inCat.length} darabot találsz` : "egyedi méretre is készítünk darabokat"}:`;
        bot(html + (inCat.length ? cards(inCat.slice(0, 3)) : "") + link(`Összes: ${topCat.n}`, topCat.u)); return "kategoria";
      }
      /* 3) kifejezett oldalkérés („vigyél az időpontfoglaláshoz”) */
      if (wantsNav && pages.length && (!faq.length || pages[0].s >= faq[0].s * 0.8)) { const g = pages[0].g; go(g.u, g.n); return "oldal"; }
      /* 4) gyakori kérdés */
      if (faq.length) {
        const f = faq[0].f;
        /* követő kérdés: „és mennyibe kerül?” az előző kategóriára */
        if (f.id === "arak" && state.last && state.last.cat) { const c = DATA.cats.find((x) => x.id === state.last.cat); if (c) return respond(c.n + " ár"); }
        let html = escH(f.a) + (f.cta ? link(f.cta[0], f.cta[1]) : "");
        const others = faq.slice(1, 3).filter((x) => x.s >= faq[0].s * 0.7 && !x.f.small).map((x) => x.f);
        if (others.length) html += `<span class="help-more">Ez is érdekelhet:</span>` + suggest(others);
        if (wantsNav && f.cta && !/^https?:/.test(f.cta[1]) && pages.length === 0) { bot(escH(f.a)); go(f.cta[1], f.cta[0]); return f.id; }
        bot(html); return f.id;
      }
      /* 4) oldal */
      if (pages.length) { const g = pages[0].g; if (wantsNav) go(g.u, g.n); else bot(`Ezt itt találod: ${link(g.n, g.u)}`); return "oldal"; }
      return null;
    }

    function setOpen(v) {
      panel.hidden = !v; fab.setAttribute("aria-expanded", String(v)); help.classList.toggle("is-open", v);
      state.open = v; ss.set(state);
      if (v) { loadData(); setTimeout(() => input.focus({ preventScroll: true }), 60); if (!help.dataset.tracked) { help.dataset.tracked = "1"; track("help_open", {}); } }
    }
    /* előző beszélgetés visszaállítása oldalváltás után */
    state.msgs.forEach(render);
    if (state.open || location.hash === "#segitseg") setOpen(true);

    $$("[data-help-toggle]", help).forEach((b) => b.addEventListener("click", () => { setOpen(panel.hidden); if (panel.hidden) fab.focus(); }));
    document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !panel.hidden) { setOpen(false); fab.focus(); } });
    help.addEventListener("click", (e) => {
      const b = e.target.closest("[data-help-q]"); if (!b) return;
      loadData().then(() => {
        const f = DATA.faq.find((d) => d.id === b.dataset.helpQ); if (!f) return;
        push(escH(f.q), "user"); bot(escH(f.a) + (f.cta ? link(f.cta[0], f.cta[1]) : "")); track("help_topic", { topic: f.id, source: "gomb" });
      });
    });
    $("[data-help-form]", help).addEventListener("submit", (e) => {
      e.preventDefault();
      const q = input.value.trim(); if (!q) return;
      push(escH(q), "user"); input.value = "";
      loadData().then(() => {
        const r = respond(q);
        if (r) track("help_topic", { topic: r, source: "szabad_szoveg" });
        else { bot("Erre most nem tudok pontos választ adni, de Szilvia szívesen segít személyesen: írj neki Messengeren vagy WhatsAppon, vagy hívd a lenti gombokkal." + suggest(DATA.faq.filter((f) => ["arak", "idopont", "nyitvatartas"].includes(f.id)))); track("help_unanswered", {}); }
      });
    });
  }
})();
