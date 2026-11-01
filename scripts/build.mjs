/* In My Style — statikus oldalgenerátor (függőség nélkül).
   Futtatás: node scripts/build.mjs  →  kimenet: dist/
   Tartalom: js/products-data.js (termékek, kategóriák), src/content/ (szövegek). */

import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DIST = path.join(ROOT, "dist");
const require = createRequire(import.meta.url);
const { CATEGORIES, PRODUCTS } = require(path.join(ROOT, "js/products-data.js"));

const SITE = {
  url: "https://inmystyle.hu",
  name: "In My Style",
  phone: "+36 20 320 2996",
  phoneHref: "tel:+36203202996",
  email: "hello@inmystyle.hu",
  street: "Kapás utca 45.",
  city: "Budapest",
  zip: "1027",
  address: "1027 Budapest, Kapás utca 45.",
  hours: "Kedd–csütörtök 10–18, péntek 10–16",
  hoursShort: "K–Cs 10–18, P 10–16",
  facebook: "https://www.facebook.com/inmystyle.hu",
  instagram: "https://www.instagram.com/inmystyle.hu/",
  calendly: "https://calendly.com/inmystyle-hu/szemelyes-konzultacio",
  maps: "https://www.google.com/maps/search/?api=1&query=In+My+Style+Kap%C3%A1s+utca+45+Budapest",
  geo: { lat: 47.51046617118123, lng: 19.03103207727521 },
  ogImage: "/assets/icons/og-image.jpg",
};

/* ---------------- helpers ---------------- */
const esc = (s = "") => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const catBySlug = Object.fromEntries(CATEGORIES.map((c) => [c.slug, c]));
const catUrl = (c) => `/kategoria/${c.slug}/`;
const prodUrl = (p) => `/termek/${p.slug}/`;
const groups = [
  { key: "ruhazat", title: "Ruházat", lead: "Minden darab a te alkatodra készül — vagy válogass az aktuális kollekcióból." },
  { key: "kiegeszito", title: "Kiegészítők", lead: "Táskák, sálak és apró részletek, köztük saját márkás darabok." },
];

function fileHash(rel) {
  return crypto.createHash("md5").update(fs.readFileSync(path.join(ROOT, rel))).digest("hex").slice(0, 8);
}

function imageSize(file) {
  const buf = fs.readFileSync(file);
  if (buf[0] === 0x89 && buf[1] === 0x50) return { w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) };
  if (buf[0] === 0xff && buf[1] === 0xd8) {
    let i = 2;
    while (i < buf.length) {
      if (buf[i] !== 0xff) { i++; continue; }
      const marker = buf[i + 1];
      const len = buf.readUInt16BE(i + 2);
      if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) {
        return { h: buf.readUInt16BE(i + 5), w: buf.readUInt16BE(i + 7) };
      }
      i += 2 + len;
    }
  }
  return { w: 800, h: 1000 };
}

const sizeCache = {};
function pic(file, alt, { eager = false, cls = "", sizes = "" } = {}) {
  if (!file) return "";
  const abs = path.join(ROOT, "assets/photos", file);
  if (!fs.existsSync(abs)) throw new Error(`Hiányzó fotó: assets/photos/${file}`);
  const { w, h } = (sizeCache[file] ||= imageSize(abs));
  const webp = file.replace(/\.(jpe?g|png)$/i, ".webp");
  const hasWebp = webp !== file && fs.existsSync(path.join(ROOT, "assets/photos", webp));
  const img = `<img src="/assets/photos/${file}" alt="${esc(alt)}" width="${w}" height="${h}"${eager ? ' fetchpriority="high"' : ' loading="lazy"'} decoding="async"${cls ? ` class="${cls}"` : ""}>`;
  return hasWebp ? `<picture><source type="image/webp" srcset="/assets/photos/${webp}"${sizes ? ` sizes="${sizes}"` : ""}>${img}</picture>` : img;
}

const I = {
  arrow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
  chevron: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>',
  phone: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z"/></svg>',
  mail: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></svg>',
  pin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 22s7-6.2 7-12a7 7 0 0 0-14 0c0 5.8 7 12 7 12z"/><circle cx="12" cy="10" r="2.5"/></svg>',
  clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
  calendar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/></svg>',
  facebook: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M13.5 22v-8h2.7l.4-3.2h-3.1V8.8c0-.9.3-1.5 1.6-1.5h1.7V4.4c-.3 0-1.3-.1-2.4-.1-2.4 0-4 1.5-4 4.1v2.4H7.7V14h2.7v8h3.1z"/></svg>',
  instagram: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor"/></svg>',
  menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h10"/></svg>',
  close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>',
  star: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2.8l2.8 5.8 6.3.9-4.6 4.4 1.1 6.3L12 17.2l-5.6 3 1.1-6.3L2.9 9.5l6.3-.9z"/></svg>',
  needle: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 4L7 17"/><path d="M17 4h3v3"/><path d="M7 17c-2 2-4 2.5-4 2.5S3.5 17.5 5.5 15.5"/></svg>',
  ruler: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2.5" y="8" width="19" height="8" rx="1.5"/><path d="M6.5 8v3M10.5 8v4M14.5 8v3M18.5 8v4"/></svg>',
  heart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 20s-7-4.4-9.3-9C1.2 7.8 3.2 4.5 6.6 4.5c2.2 0 3.6 1.4 5.4 3.3 1.8-1.9 3.2-3.3 5.4-3.3 3.4 0 5.4 3.3 3.9 6.5C19 15.6 12 20 12 20z"/></svg>',
  chat: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 5h16a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H9l-4 4v-4H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z"/></svg>',
  swatch: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" aria-hidden="true"><rect x="3.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="13.5" width="7" height="7" rx="1.5"/></svg>',
  scissors: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><circle cx="6" cy="6" r="2.5"/><circle cx="6" cy="18" r="2.5"/><path d="M20 4L8 16M8 8l12 12"/></svg>',
  check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M8 12.5l2.5 2.5L16 9.5"/></svg>',
  bag: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" aria-hidden="true"><path d="M6 8h12l1 12H5L6 8z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/></svg>',
  home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" aria-hidden="true"><path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z"/></svg>',
};

/* ---------------- layout ---------------- */
const CSS_V = fileHash("css/style.css");
const JS_V = fileHash("js/main.js");

function head({ title, description, url, image, noindex, jsonld = [] }) {
  const canonical = SITE.url + url;
  const img = SITE.url + (image || SITE.ogImage);
  return `<!doctype html>
<html lang="hu">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${canonical}">
${noindex ? '<meta name="robots" content="noindex, follow">\n' : ""}<meta property="og:type" content="website">
<meta property="og:locale" content="hu_HU">
<meta property="og:site_name" content="In My Style">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${canonical}">
<meta property="og:image" content="${img}">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#ffffff">
<link rel="icon" href="/assets/icons/favicon-light.png" media="(prefers-color-scheme: light)">
<link rel="icon" href="/assets/icons/favicon-dark.png" media="(prefers-color-scheme: dark)">
<link rel="apple-touch-icon" href="/assets/icons/apple-touch-icon.png">
<link rel="preconnect" href="https://api.fontshare.com" crossorigin>
<link rel="preconnect" href="https://cdn.fontshare.com" crossorigin>
<link rel="preload" href="/assets/fonts/dancing-script-latin-600-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="https://api.fontshare.com/v2/css?f[]=cabinet-grotesk@400,500,700,800&display=swap">
<link rel="stylesheet" href="/css/style.css?v=${CSS_V}">
<script>document.documentElement.classList.add("js")</script>
${jsonld.map((j) => `<script type="application/ld+json">${JSON.stringify(j)}</script>`).join("\n")}
</head>`;
}

function header(active = "") {
  const cur = (k) => (active === k ? ' aria-current="page"' : "");
  return `<a class="skip-link" href="#tartalom">Ugrás a tartalomra</a>
<div class="topbar">
  <div class="container">
    <span>${I.clock}Nyitva: ${SITE.hoursShort}</span>
    <span class="topbar-hide-m">${I.pin}${SITE.address}</span>
    <a class="topbar-hide-m" href="${SITE.phoneHref}">${SITE.phone}</a>
  </div>
</div>
<header class="site-header" data-header>
  <div class="container header-inner">
    <div class="header-left">
      <button class="menu-btn" type="button" data-drawer-open aria-controls="drawer" aria-expanded="false"><span class="burger" aria-hidden="true"><span></span></span><span class="label">Menü</span></button>
      <nav class="header-quick" aria-label="Gyorslinkek"><a href="/#kollekcio">Kollekció</a><a href="/akcio/"${cur("akcio")}>Akció</a></nav>
    </div>
    <a class="logo" href="/" aria-label="In My Style – főoldal"><img src="/assets/logo/in-my-style-logo.png" alt="In My Style" width="190" height="40"></a>
    <div class="header-right">
      <a class="icon-link hide-m" href="${SITE.instagram}" target="_blank" rel="noopener" aria-label="In My Style az Instagramon">${I.instagram}</a>
      <a class="icon-link" href="${SITE.phoneHref}" aria-label="Hívás: ${SITE.phone}">${I.phone}</a>
      <a class="btn btn-dark btn-sm" href="/#idopont">Időpontfoglalás</a>
    </div>
  </div>
</header>
<div class="drawer-backdrop" data-drawer-close></div>
<aside class="drawer" id="drawer" aria-label="Menü" aria-hidden="true">
  <div class="drawer-head"><img src="/assets/logo/in-my-style-logo.png" alt="In My Style" width="150" height="32"><button class="icon-link" type="button" data-drawer-close aria-label="Menü bezárása">${I.close}</button></div>
  <nav aria-label="Fő navigáció">
    <a href="/">Főoldal</a>
    <details>
      <summary>Kollekció</summary>
      <div class="sub">${groups.map((g) => `<h3>${g.title}</h3>${CATEGORIES.filter((c) => c.group === g.key).map((c) => `<a href="${catUrl(c)}">${esc(c.name)}</a>`).join("")}`).join("")}</div>
    </details>
    <a href="/#szolgaltatasok">Szolgáltatások</a>
    <a href="/akcio/">Akció</a>
    <a href="/#rolunk">Rólunk</a>
    <a href="/#velemenyek">Vélemények</a>
    <a href="/#ajanlatkeres">Ajánlatkérés</a>
    <a href="/#kapcsolat">Kapcsolat</a>
  </nav>
  <div class="drawer-foot">
    <div class="row"><a class="btn btn-dark" href="/#idopont">${I.calendar}Időpontfoglalás</a><a class="btn btn-outline" href="${SITE.phoneHref}">${I.phone}${SITE.phone}</a></div>
    <div class="drawer-contact"><span>${SITE.address}</span><span>${SITE.hoursShort}</span><a href="${SITE.instagram}" target="_blank" rel="noopener">Instagram</a><a href="${SITE.facebook}" target="_blank" rel="noopener">Facebook</a></div>
  </div>
</aside>`;
}

function newsletter() {
  return `<section class="section-sm" aria-labelledby="hirlevel-cim">
  <div class="container">
    <div class="newsletter">
      <div>
        <h2 id="hirlevel-cim">Iratkozz fel a hírlevelünkre!</h2>
        <p>Elsőként értesülhetsz az új kollekciókról, az exkluzív ajánlatokról és a stílustippekről.</p>
      </div>
      <form class="newsletter-form" name="hirlevel" method="POST" action="/koszonjuk/" data-netlify="true" netlify-honeypot="bot-field" data-ajax-form>
        <input type="hidden" name="form-name" value="hirlevel">
        <p class="hidden-field"><label>Ne töltsd ki: <input name="bot-field"></label></p>
        <label class="sr-only" for="nl-nev">Név</label>
        <input id="nl-nev" type="text" name="nev" placeholder="Neved" autocomplete="name" required>
        <label class="sr-only" for="nl-email">E-mail-cím</label>
        <input id="nl-email" type="email" name="email" placeholder="E-mail-címed" autocomplete="email" required>
        <button class="btn btn-light" type="submit">Feliratkozom</button>
        <label class="consent"><input type="checkbox" name="hozzajarulas" value="igen" required><span>Hozzájárulok, hogy az In My Style hírlevelet küldjön nekem. A feliratkozás bármikor visszavonható. <a href="/adatkezelesi-tajekoztato/">Adatkezelési tájékoztató</a></span></label>
        <div class="form-status" role="status" aria-live="polite" data-success="Köszönjük a feliratkozást! Hamarosan jelentkezünk." data-error="Hiba történt a küldés során. Kérjük, próbáld újra, vagy írj nekünk: ${SITE.email}"></div>
      </form>
    </div>
  </div>
</section>`;
}

function footer() {
  return `${newsletter()}
<footer class="site-footer">
  <div class="container">
    <div class="footer-top">
      <div class="footer-brand">
        <img src="/assets/logo/in-my-style-logo.png" alt="In My Style" width="170" height="36" loading="lazy">
        <p>Sportos elegancia a rád szabott ruha élményével. Budapesti szalonunkban egyedi méretre készülő darabokkal várunk.</p>
        <div class="footer-social">
          <a class="icon-link" href="${SITE.facebook}" target="_blank" rel="noopener" aria-label="In My Style a Facebookon">${I.facebook}</a>
          <a class="icon-link" href="${SITE.instagram}" target="_blank" rel="noopener" aria-label="In My Style az Instagramon">${I.instagram}</a>
        </div>
      </div>
      <div>
        <h3>Kollekció</h3>
        <ul class="footer-links">${CATEGORIES.filter((c) => c.group === "ruhazat").slice(0, 6).map((c) => `<li><a href="${catUrl(c)}">${esc(c.name)}</a></li>`).join("")}<li><a href="/#kollekcio">Összes kategória</a></li></ul>
      </div>
      <div>
        <h3>Szalon</h3>
        <ul class="footer-links">
          <li><a href="/#szolgaltatasok">Szolgáltatások</a></li>
          <li><a href="/#folyamat">Így készül a ruhád</a></li>
          <li><a href="/akcio/">Akció</a></li>
          <li><a href="/#ajandekutalvany">Ajándékutalvány</a></li>
          <li><a href="/#velemenyek">Vélemények</a></li>
          <li><a href="/#gyik">Gyakori kérdések</a></li>
        </ul>
      </div>
      <div>
        <h3>Kapcsolat</h3>
        <ul class="footer-links">
          <li><a href="${SITE.maps}" target="_blank" rel="noopener">${SITE.address}</a></li>
          <li><a href="${SITE.phoneHref}">${SITE.phone}</a></li>
          <li><a href="mailto:${SITE.email}">${SITE.email}</a></li>
          <li><span>Kedd–csütörtök: 10–18<br>Péntek: 10–16</span></li>
        </ul>
      </div>
    </div>
    <div class="footer-bottom">
      <span>© ${new Date().getFullYear()} In My Style · Mitterer Szilvia E.V.</span>
      <div class="payments" aria-label="Elfogadott fizetési módok">
        <img src="/assets/photos/Nw90SIdLQKIdHiNqfLWxw5MZGs.png" alt="Visa" width="46" height="26" loading="lazy">
        <img src="/assets/photos/QUXCWKuepJu9WOicM1GGa9eFw.png" alt="Mastercard" width="46" height="26" loading="lazy">
        <img src="/assets/photos/mFN7qRFb6aBfqn8RZtBNQ5G678.png" alt="Apple Pay" width="46" height="26" loading="lazy">
        <img src="/assets/photos/wF1FvkGQKavYUtCR8N43p7LHvpk.png" alt="Google Pay" width="46" height="26" loading="lazy">
      </div>
      <nav aria-label="Jogi információk"><a href="/adatkezelesi-tajekoztato/">Adatkezelési tájékoztató</a></nav>
    </div>
  </div>
</footer>
<div class="mobile-cta" data-mobile-cta><a class="btn btn-outline" href="${SITE.phoneHref}">${I.phone}Hívás</a><a class="btn btn-dark" href="/#idopont">${I.calendar}Időpont</a></div>
<script src="/js/main.js?v=${JS_V}" defer></script>`;
}

function page({ title, description, url, image, noindex, jsonld, active, body }) {
  return `${head({ title, description, url, image, noindex, jsonld })}
<body>
${header(active)}
<main id="tartalom">
${body}
</main>
${footer()}
</body>
</html>
`;
}

/* ---------------- shared blocks ---------------- */
function productCard(p, { showCat = true } = {}) {
  const c = catBySlug[p.category];
  const badges = [];
  if (p.badge) badges.push(`<span class="tag ${/elfogy/i.test(p.badge) ? "tag-dark" : /kiárus|akci/i.test(p.badge) ? "tag-rose" : "tag-accent"}">${esc(p.badge)}</span>`);
  else if (p.type === "egyedi") badges.push('<span class="tag">Egyedi méretre</span>');
  return `<article class="product-card reveal">
  <div class="product-card-media">${pic(p.photos[0], p.name)}<div class="badges">${badges.join("")}</div></div>
  <div class="product-card-body">
    ${showCat && c ? `<span class="product-card-cat">${esc(c.name)}</span>` : ""}
    <h3><a href="${prodUrl(p)}">${esc(p.name)}</a></h3>
    ${p.price ? `<span class="product-card-price">${esc(p.price)}</span>` : '<span class="product-card-price is-quote">Ár egyeztetés alapján</span>'}
  </div>
</article>`;
}

function categoryTile(c) {
  const n = PRODUCTS.filter((p) => p.category === c.slug).length;
  return `<a class="cat-tile reveal" href="${catUrl(c)}">${pic(c.heroPhoto, "")}
  <span class="cat-tile-arrow">${I.arrow}</span>
  <span class="cat-tile-body"><b>${esc(c.name)}</b><span>${esc(c.tagline)}</span></span>
</a>`;
}

function categoryGroups() {
  return `<div class="cat-groups">${groups.map((g) => `
  <div>
    <div class="cat-group-head"><h3>${g.title}</h3><p>${g.lead}</p></div>
    <div class="cat-grid" style="--cols:${g.key === "ruhazat" ? 5 : 6}">${CATEGORIES.filter((c) => c.group === g.key).map(categoryTile).join("")}</div>
  </div>`).join("")}
</div>`;
}

const FAQ = [
  ["Mennyi idő alatt készül el a ruhám?", "Az egyedi méretre készülő darabok átfutási ideje jellemzően 1–2 hét, a naptártól és a választott modelltől függően. A pontos határidőt a konzultáción egyeztetjük."],
  ["Van-e méretsor az aktuális kollekcióban?", "Az aktuális kollekció darabjai korlátozott számban, fix méretben érhetők el. Üzletünkben vagy a Facebook-oldalunkon mindig látod, mi van éppen készleten."],
  ["Hozott anyagból is készítenek ruhát?", "Igen. Ha van saját kedvenc anyagod, hozd magaddal a konzultációra — együtt megnézzük, milyen modellhez illik a legjobban."],
  ["Egyedi ötlet vagy fotó alapján is készítenek ruhát?", "Igen, szívesen dolgozunk elképzelés, inspirációs fotó vagy vázlat alapján is. Ezekből közösen alakítjuk ki a végleges modellt."],
  ["Szükséges bejelentkezni?", "Igen. Az időpontfoglalás segít abban, hogy nyugodt körülmények között, teljes figyelemmel foglalkozhassunk veled."],
  ["Vállalnak igazítást és javítást is?", "Igen. Ha egy kedvenc darabod megsérült vagy méretre kell igazítani, megjavítjuk, hogy továbbra is tökéletesen szolgáljon."],
];

function faqSection() {
  return `<section class="section" id="gyik" aria-labelledby="gyik-cim">
  <div class="container faq-layout">
    <div class="section-head">
      <div class="eyebrow">Gyakori kérdések</div>
      <h2 class="h2" id="gyik-cim">Amit érdemes tudni, mielőtt jelentkezel</h2>
      <p class="lead">Nem találod a választ? Hívj minket bátran a <a class="link-arrow" href="${SITE.phoneHref}">${SITE.phone}</a> számon.</p>
    </div>
    <div class="faq-list">${FAQ.map(([q, a], i) => `<details${i === 0 ? " open" : ""}><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join("")}</div>
  </div>
</section>`;
}

function contactSection() {
  return `<section class="section bg-soft" id="kapcsolat" aria-labelledby="kapcsolat-cim">
  <div class="container">
    <div class="section-head">
      <div class="eyebrow">Kapcsolat</div>
      <h2 class="h2" id="kapcsolat-cim">Foglalj időpontot a szalonba</h2>
      <p class="lead">Kérdésed van, vagy rendelni szeretnél? Foglalj időpontot online, vagy keress minket az alábbi elérhetőségek egyikén. Szeretettel várlak: Mitterer Szilvia.</p>
    </div>
    <div class="call-band" id="idopont">
      <div><h3>Hívj minket közvetlenül!</h3><p>Egyetlen hívással azonnal egyeztetünk időpontot.</p></div>
      <a class="btn btn-light" href="${SITE.phoneHref}">${I.phone}${SITE.phone}</a>
    </div>
    <div class="contact-grid">
      <div class="contact-card">
        <h3 class="h3">In My Style szalon</h3>
        <ul class="contact-list">
          <li><span class="ico">${I.pin}</span><div><small>Cím</small><a href="${SITE.maps}" target="_blank" rel="noopener">${SITE.address}</a></div></li>
          <li><span class="ico">${I.phone}</span><div><small>Telefon</small><a href="${SITE.phoneHref}">${SITE.phone}</a></div></li>
          <li><span class="ico">${I.mail}</span><div><small>E-mail</small><a href="mailto:${SITE.email}">${SITE.email}</a></div></li>
          <li><span class="ico">${I.clock}</span><div><small>Nyitvatartás</small>${SITE.hours}</div></li>
        </ul>
      </div>
      <div class="map-frame" data-lazy-embed='<iframe src="https://www.google.com/maps?q=In+My+Style,+Kap%C3%A1s+utca+45,+Budapest&amp;output=embed" title="In My Style a térképen" loading="lazy" referrerpolicy="no-referrer-when-downgrade" allowfullscreen></iframe>'></div>
    </div>
    <div class="contact-card booking">
      <h3 class="h3">Online időpontfoglalás</h3>
      <p class="muted" style="margin:8px 0 18px">Válaszd ki a neked megfelelő időpontot a személyes konzultációra.</p>
      <div class="calendly-placeholder" data-calendly="${SITE.calendly}">
        <p class="muted">Az időpontfoglaló naptár a Calendly szolgáltatásán keresztül töltődik be.</p>
        <button class="btn btn-dark" type="button" data-calendly-load>${I.calendar}Naptár megnyitása</button>
      </div>
    </div>
  </div>
</section>`;
}

function sizeFigure() {
  const body = "M108,67 C96,70 85,80 82,92 C78,104 80,116 85,128 C93,156 99,176 97,204 C95,222 86,238 80,264 C75,286 85,303 89,318 C93,342 95,360 93,376 C91,404 95,430 99,454 L93,467 L109,467 L113,454 C109,430 107,404 111,376 C113,350 118,320 120,301 C122,320 127,350 129,376 C133,404 131,430 127,454 L131,467 L147,467 L141,454 C145,430 149,404 147,376 C145,360 147,342 151,318 C155,303 165,286 160,264 C154,238 145,222 143,204 C141,176 147,156 155,128 C160,116 162,104 158,92 C155,80 144,70 132,67 Q120,78 108,67 Z";
  return `<div class="size-figure">
  <svg viewBox="0 0 240 480" class="size-svg" aria-hidden="true">
    <defs>
      <linearGradient id="figureGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#fbfdfe"/><stop offset="45%" stop-color="#d2e1e5"/><stop offset="100%" stop-color="#7d99a4"/></linearGradient>
      <radialGradient id="figureSheen" cx="38%" cy="18%" r="55%"><stop offset="0%" stop-color="#fff" stop-opacity=".6"/><stop offset="100%" stop-color="#fff" stop-opacity="0"/></radialGradient>
      <radialGradient id="groundShadow" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#15242e" stop-opacity=".25"/><stop offset="100%" stop-color="#15242e" stop-opacity="0"/></radialGradient>
      <filter id="figureShadow" x="-40%" y="-10%" width="180%" height="130%"><feDropShadow dx="4" dy="10" stdDeviation="8" flood-color="#15242e" flood-opacity=".2"/></filter>
      <clipPath id="bodyClip"><path d="${body}"/></clipPath>
    </defs>
    <ellipse cx="120" cy="472" rx="56" ry="9" fill="url(#groundShadow)"/>
    <g filter="url(#figureShadow)">
      <path class="size-arm" d="M82,94 Q58,108 54,145 Q52,168 61,188"/>
      <path class="size-arm" d="M158,94 Q182,108 186,145 Q188,168 179,188"/>
      <path class="size-body" d="${body}"/>
      <ellipse class="size-body" cx="120" cy="42" rx="22" ry="25"/>
      <ellipse cx="97" cy="118" rx="42" ry="75" fill="url(#figureSheen)" clip-path="url(#bodyClip)"/>
      <ellipse cx="112" cy="36" rx="14" ry="16" fill="url(#figureSheen)"/>
    </g>
    <g class="size-line" data-line="mell"><line x1="120" y1="128" x2="120" y2="128"/><circle cx="120" cy="128" r="2.5"/></g>
    <g class="size-line" data-line="derek"><line x1="120" y1="205" x2="120" y2="205"/><circle cx="120" cy="205" r="2.5"/></g>
    <g class="size-line" data-line="csipo"><line x1="120" y1="265" x2="120" y2="265"/><circle cx="120" cy="265" r="2.5"/></g>
    <g class="size-height"><line x1="20" y1="15" x2="20" y2="467"/><line x1="14" y1="15" x2="26" y2="15"/><line x1="14" y1="467" x2="26" y2="467"/></g>
  </svg>
  <div class="size-badges">
    <div class="size-badge" data-badge="magassag"><span>Magasság</span><b>—</b></div>
    <div class="size-badge" data-badge="mell"><span>Mell</span><b>—</b></div>
    <div class="size-badge" data-badge="derek"><span>Derék</span><b>—</b></div>
    <div class="size-badge" data-badge="csipo"><span>Csípő</span><b>—</b></div>
  </div>
</div>`;
}

function hidden(name) {
  return `<input type="hidden" name="form-name" value="${name}"><p class="hidden-field"><label>Ne töltsd ki: <input name="bot-field"></label></p>`;
}

const formStatus = `<div class="form-status" role="status" aria-live="polite" data-success="Köszönjük! Megkaptuk az üzenetedet, hamarosan jelentkezünk." data-error="Hiba történt a küldés során. Kérjük, próbáld újra, vagy hívj minket: ${SITE.phone}"></div>`;
const privacyNote = `<p class="form-note">Az űrlap elküldésével elfogadod az <a href="/adatkezelesi-tajekoztato/">adatkezelési tájékoztatót</a>. Adataidat kizárólag a kapcsolatfelvételhez használjuk.</p>`;

function quoteSection({ id = "ajanlatkeres", subject = "", title = "Kérj ajánlatot", lead } = {}) {
  const ctx = esc(subject || "Általános érdeklődés");
  const range = (key, label, min, max, val) => `<div class="range-row"><label for="r-${key}">${label}</label><output data-size-output="${key}" for="r-${key}">${val} cm</output><input id="r-${key}" type="range" name="${key}" min="${min}" max="${max}" value="${val}" data-size-input="${key}"></div>`;
  const pills = ["Pamut popelin", "Selyem", "Vászon", "Szatén", "Gyapjú-keverék"];
  const colors = [["Fehér", "#ffffff"], ["Fekete", "#1f1f1f"], ["Sötétkék", "#1c2b45"], ["Bordó", "#7c1f2d"], ["Drapp", "#c8a96a"], ["Szürke", "#9aa9b0"], ["Púderrózsaszín", "#d88ea0"]];
  return `<section class="section bg-soft" id="${id}" aria-labelledby="${id}-cim">
  <div class="container">
    <div class="section-head center">
      <div class="eyebrow">Ajánlatkérés</div>
      <h2 class="h2" id="${id}-cim">${esc(title)}</h2>
      <p class="lead">${esc(lead || "Kérj gyors visszahívást, vagy add meg előre a méreteidet és az elképzelésedet — így már felkészülten várunk a konzultáción.")}</p>
    </div>
    <div class="quote-wrap" data-tabs>
      <div class="tabs" role="tablist" aria-label="Ajánlatkérés módja">
        <button class="tab" type="button" role="tab" id="${id}-t1" aria-controls="${id}-p1" aria-selected="true">Visszahívást kérek</button>
        <button class="tab" type="button" role="tab" id="${id}-t2" aria-controls="${id}-p2" aria-selected="false" tabindex="-1">Egyedi méret és stílus</button>
      </div>
      <div class="tab-panel" role="tabpanel" id="${id}-p1" aria-labelledby="${id}-t1">
        <form name="visszahivas" method="POST" action="/koszonjuk/" data-netlify="true" netlify-honeypot="bot-field" data-ajax-form>
          ${hidden("visszahivas")}
          <input type="hidden" name="targy" value="${ctx}">
          <div class="form-grid">
            <div class="field"><label for="${id}-nev">Neved</label><input id="${id}-nev" type="text" name="nev" autocomplete="name" required></div>
            <div class="field"><label for="${id}-tel">Telefonszámod</label><input id="${id}-tel" type="tel" name="telefon" autocomplete="tel" inputmode="tel" required></div>
            <div class="field full"><label for="${id}-msg">Miben segíthetünk? <span class="muted">(nem kötelező)</span></label><textarea id="${id}-msg" name="uzenet" rows="3"></textarea></div>
            <div class="form-actions full">${privacyNote}<button class="btn btn-dark btn-block" type="submit">Visszahívást kérek</button>${formStatus}</div>
          </div>
        </form>
      </div>
      <div class="tab-panel" role="tabpanel" id="${id}-p2" aria-labelledby="${id}-t2" hidden>
        <form class="size-tool" name="ajanlatkeres" method="POST" action="/koszonjuk/" data-netlify="true" netlify-honeypot="bot-field" data-ajax-form data-size-tool>
          ${hidden("ajanlatkeres")}
          <input type="hidden" name="targy" value="${ctx}">
          ${sizeFigure()}
          <div class="size-fields">
            ${range("magassag", "Magasság", 150, 190, 168)}
            ${range("mellboseg", "Mellbőség", 78, 130, 94)}
            ${range("derekboseg", "Derékbőség", 60, 120, 76)}
            ${range("csipoboseg", "Csípőbőség", 80, 135, 100)}
            <div class="field"><span class="field-label">Anyag</span><div class="swatches" data-swatch="anyag">${pills.map((v) => `<button type="button" class="swatch-pill" aria-pressed="false" data-value="${v}">${v}</button>`).join("")}</div><input type="hidden" name="anyag" value=""></div>
            <div class="field"><span class="field-label">Szín</span><div class="swatches" data-swatch="szin">${colors.map(([n, c]) => `<button type="button" class="color-swatch" aria-pressed="false" data-value="${n}" title="${n}" aria-label="${n}" style="background:${c}"></button>`).join("")}</div><input type="hidden" name="szin" value=""></div>
            <div class="form-grid">
              <div class="field"><label for="${id}-nev2">Neved</label><input id="${id}-nev2" type="text" name="nev" autocomplete="name" required></div>
              <div class="field"><label for="${id}-tel2">Telefonszámod</label><input id="${id}-tel2" type="tel" name="telefon" autocomplete="tel" inputmode="tel" required></div>
              <div class="field full"><label for="${id}-email2">E-mail-címed <span class="muted">(nem kötelező)</span></label><input id="${id}-email2" type="email" name="email" autocomplete="email"></div>
              <div class="field full"><label for="${id}-msg2">Elképzelésed <span class="muted">(nem kötelező)</span></label><textarea id="${id}-msg2" name="uzenet" rows="3" placeholder="Milyen alkalomra, milyen fazont szeretnél?"></textarea></div>
            </div>
            <p class="field-hint">A csúszkák tájékoztató jellegűek — a pontos méretet mindig személyesen vesszük fel a szalonban.</p>
            <div class="form-actions">${privacyNote}<button class="btn btn-dark btn-block" type="submit">Ajánlatkérés elküldése</button>${formStatus}</div>
          </div>
        </form>
      </div>
    </div>
  </div>
</section>`;
}

/* ---------------- JSON-LD ---------------- */
const businessLd = {
  "@context": "https://schema.org",
  "@type": "ClothingStore",
  "@id": SITE.url + "/#szalon",
  name: "In My Style",
  description: "Egyedi méretre készülő női ruhák, aktuális kollekció, igazítás és javítás budapesti szalonunkban.",
  url: SITE.url + "/",
  image: SITE.url + "/assets/photos/hero-szilvia-2.jpg",
  logo: SITE.url + "/assets/logo/in-my-style-logo.png",
  telephone: "+36203202996",
  email: SITE.email,
  address: { "@type": "PostalAddress", streetAddress: SITE.street, addressLocality: SITE.city, postalCode: SITE.zip, addressCountry: "HU" },
  geo: { "@type": "GeoCoordinates", latitude: SITE.geo.lat, longitude: SITE.geo.lng },
  openingHoursSpecification: [
    { "@type": "OpeningHoursSpecification", dayOfWeek: ["Tuesday", "Wednesday", "Thursday"], opens: "10:00", closes: "18:00" },
    { "@type": "OpeningHoursSpecification", dayOfWeek: "Friday", opens: "10:00", closes: "16:00" },
  ],
  sameAs: [SITE.facebook, SITE.instagram],
  founder: { "@type": "Person", name: "Mitterer Szilvia" },
};

function breadcrumbLd(items) {
  return { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: items.map(([name, url], i) => ({ "@type": "ListItem", position: i + 1, name, item: SITE.url + url })) };
}
function breadcrumbHtml(items) {
  return `<nav class="breadcrumb" aria-label="Morzsamenü">${items.map(([name, url], i) => (i < items.length - 1 ? `<a href="${url}">${esc(name)}</a><span aria-hidden="true">/</span>` : `<span aria-current="page">${esc(name)}</span>`)).join("")}</nav>`;
}

/* ---------------- pages ---------------- */
function homePage() {
  const featured = PRODUCTS.filter((p) => p.featured).slice(0, 4);
  const steps = [
    [I.chat, "Konzultáció", "Elmondod az elképzelésed, megmutatod, ami inspirál."],
    [I.swatch, "Anyagválasztás", "Közösen kiválasztjuk a hozzád illő anyagot és színt."],
    [I.ruler, "Méretvétel", "Pontos méretet veszünk, hogy tökéletesen álljon."],
    [I.scissors, "Szabás és varrás", "Kézzel, a te alkatodra készül el a ruha."],
    [I.check, "Próba és igazítás", "Felpróbálod, és ha kell, finomhangoljuk."],
    [I.bag, "Átvétel", "A kész, rád szabott darab a tiéd."],
  ];
  const reviews = [
    ["V. Bernadett", "Néhány napja vettem át az első In My Style ruhámat, ami csodaszép lett. Szilvi rendkívül kedves és segítőkész! Szívből ajánlom minden hölgynek, aki egyedi, finom, nőies ruhatárra vágyik. Én biztosan visszatérő vásárló leszek!"],
    ["Sz. Krisztina", "Igazi nőtől, valódi nőknek, akiknek fontos, hogy hétköznapokon is csinosak legyenek. Ebben az üzletben a lelkes és pörgős Szilvivel nemcsak jól érezheted magad, hanem közben rátalálsz a saját stílusodra, ha eddig nem sikerült."],
    ["Cs. Anita", "Szilvi nagyon kedves, gyors, és nem utolsósorban remekül ért a munkájához! Végre egy hely, ahol nem kell utólag alakítani a ruhát ahhoz, hogy tökéletesen álljon rajtam! Csodaszép színek és fazonok! Szívből ajánlom mindenkinek!"],
  ];
  const gallery = ["Y4sAXNy1J7sbea58QacwT0D9O0.jpg", "1ZtdorXsHBKEc4bN2LHremaGBo.jpg", "upWGtveMvi615CIZmXjEm2wyQ4.jpg", "si9qbKa5ffmxJrftg6g3nZ7Uc.jpg", "PqalPo2E1o6IkCRlDFZGPw2KVeU.jpeg", "wq8ayEOnBljen6JcuzQavA5640.jpg"];
  const faqLd = { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: FAQ.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })) };

  const body = `
<section class="hero" aria-labelledby="hero-cim">
  <div class="hero-media">${pic("hero-szilvia-2.jpg", "Mitterer Szilvia, az In My Style alapítója, saját tervezésű sötétkék kosztümben", { eager: true })}</div>
  <div class="container">
    <div class="hero-inner">
      <div class="eyebrow">Budapesti szalon · Kapás utca 45.</div>
      <h1 id="hero-cim">Egyedi méretre készülő női ruhák <span class="script">rád szabva</span></h1>
      <p class="lead">Sportos elegancia, kényelem és nőiesség: minden darabot a te alkatodra, a te ízlésed szerint készítünk el — a konzultációtól az utolsó próbáig.</p>
      <div class="hero-actions">
        <a class="btn btn-light" href="#idopont">${I.calendar}Időpontot foglalok</a>
        <a class="btn btn-outline-light" href="#kollekcio">Kollekció megtekintése</a>
      </div>
      <div class="hero-proof">
        <div><b>100%</b><span>egyedi méretre</span></div>
        <div><b>1–2 hét</b><span>átfutási idő</span></div>
        <div><b>Hozott anyagból</b><span>is elkészítjük</span></div>
      </div>
    </div>
  </div>
  <a class="scroll-cue" href="#szolgaltatasok" aria-label="Tovább a tartalomhoz"></a>
</section>

<section class="trust" aria-label="Miért az In My Style?">
  <div class="container">
    <div class="trust-item">${I.ruler}<div><b>Pontos méretvétel</b><span>személyesen, a szalonban</span></div></div>
    <div class="trust-item">${I.needle}<div><b>Kézzel varrva</b><span>hazai műhelyben</span></div></div>
    <div class="trust-item">${I.check}<div><b>Próba és igazítás</b><span>amíg tökéletes nem lesz</span></div></div>
    <div class="trust-item">${I.heart}<div><b>Személyes figyelem</b><span>bejelentkezés alapján</span></div></div>
  </div>
</section>

<section class="section" id="szolgaltatasok" aria-labelledby="szolg-cim">
  <div class="container">
    <div class="section-head-row">
      <div class="section-head">
        <div class="eyebrow">Szolgáltatásaink</div>
        <h2 class="h2" id="szolg-cim">Minden, amire a ruhatáradnak szüksége van — egy helyen</h2>
      </div>
      <a class="link-arrow" href="#ajanlatkeres">Ajánlatot kérek</a>
    </div>
    <div class="services">
      <article class="service reveal">
        <div class="service-media">${pic("7QEfZIBCOvWiBL8ZPmcs1Mi8.jpg", "Egyedi méretre készült sötétkék fodros blúz")}</div>
        <div class="service-body"><span class="num">01</span><h3 class="h3">Egyedi méretre készülő ruhák</h3><p>Közösen választott anyagból, a te alkatodra szabva — a mindennapokra és a különleges alkalmakra.</p><a class="link-arrow" href="#egyedi">Részletek</a></div>
      </article>
      <article class="service reveal">
        <div class="service-media">${pic("6es6MykWWyAqSyt10cTe4pX4k.png", "Rózsaszín csíkos ingruhák az aktuális kollekcióból")}</div>
        <div class="service-body"><span class="num">02</span><h3 class="h3">Aktuális kollekció</h3><p>Kézzel készülő, korlátozott számú darabok, amelyeket azonnal megvásárolhatsz vagy megrendelhetsz.</p><a class="link-arrow" href="#kollekcio">Kollekció</a></div>
      </article>
      <article class="service reveal">
        <div class="service-media">${pic("5bFqnTfSOc9hMkRM7WxmDFQFQjs.jpg", "Varrókellékek az In My Style műhelyében")}</div>
        <div class="service-body"><span class="num">03</span><h3 class="h3">Igazítás és javítás</h3><p>A kedvenc darabjaid is megérdemlik a törődést: megjavítjuk és méretre igazítjuk őket.</p><a class="link-arrow" href="#igazitas">Részletek</a></div>
      </article>
    </div>
    <div class="extras"><span>További szolgáltatások:</span><span class="chip">Privát shopping</span><span class="chip">Kapszulagardrób kialakítása</span><span class="chip">Vásárlás stylisttal</span><span class="chip">Stíluscoaching</span></div>
  </div>
</section>

<section class="section bg-soft" id="kollekcio" aria-labelledby="kollekcio-cim">
  <div class="container">
    <div class="section-head-row">
      <div class="section-head">
        <div class="eyebrow">Aktuális kollekció</div>
        <h2 class="h2" id="kollekcio-cim">A mindennapok luxusa</h2>
        <p class="lead">Kézzel, egyedileg készülő darabok, amelyeket most rendelhetsz meg.</p>
      </div>
      <a class="link-arrow" href="/akcio/">Akciós darabok</a>
    </div>
    <div class="product-grid">${featured.map((p) => productCard(p)).join("")}</div>
    <div style="margin-top:clamp(56px,7vw,88px)">
      <div class="section-head"><div class="eyebrow">Termékkategóriák</div><h2 class="h2">Válogass kedvedre</h2></div>
      ${categoryGroups()}
    </div>
  </div>
</section>

<section class="section" id="egyedi" aria-labelledby="egyedi-cim">
  <div class="container split">
    <div class="split-media reveal">${pic("oykK1W4tn84ILiycFjGjKvkFjU.jpg", "Egyedi méretre készült fehér ing")}</div>
    <div class="split-body">
      <div class="eyebrow">Testre szabva</div>
      <h2 class="h2" id="egyedi-cim">Egyedi ruhák minden alkalomra</h2>
      <p class="lead">A mindennapok is megérdemlik a személyre szabott tökéletességet.</p>
      <p class="muted">Egyedi méretre, közös anyagválasztással, az alkatodnak megfelelően készítjük el a kívánt modellt — legyen szó egy tökéletes fehér ingről, egy szabott nadrágról vagy egy alkalmi ruháról.</p>
      <ul class="checklist">
        <li>Hozott anyagból vagy inspirációs fotó alapján is</li>
        <li>Próbával és finomhangolással</li>
        <li>Jellemzően 1–2 hét alatt elkészül</li>
      </ul>
      <a class="btn btn-dark" href="#ajanlatkeres">Ajánlatot kérek</a>
    </div>
  </div>
</section>

<section class="section bg-tint" id="folyamat" aria-labelledby="folyamat-cim">
  <div class="container">
    <div class="section-head center">
      <div class="eyebrow">A folyamat</div>
      <h2 class="h2" id="folyamat-cim">Így készül a ruhád</h2>
      <p class="lead">Hat egyszerű lépés az első beszélgetéstől a kész, rád szabott darabig.</p>
    </div>
    <ol class="process" style="list-style:none;margin:0;padding:0">${steps.map(([ic, t, d], i) => `<li class="step reveal"><div class="step-icon">${ic}</div><div class="step-num">${String(i + 1).padStart(2, "0")}</div><h3>${t}</h3><p>${d}</p></li>`).join("")}</ol>
  </div>
</section>

<section class="section" id="igazitas" aria-labelledby="igazitas-cim">
  <div class="container split">
    <div class="split-body">
      <div class="eyebrow">Törődés</div>
      <h2 class="h2" id="igazitas-cim">Igazítás és javítás</h2>
      <p class="lead">Még a legfinomabb darabok is megérdemlik a törődést.</p>
      <p class="muted">Ha elszakadt, megjavítjuk; ha szükséges, méretre igazítjuk, hogy továbbra is tökéletesen szolgáljon. Hozd be a ruhát a szalonba, és helyben megbeszéljük a teendőket.</p>
      <a class="btn btn-outline" href="#idopont">Időpontot foglalok</a>
    </div>
    <div class="split-media reveal">${pic("ZHXenMDNxDUohhIi2cLGZ0mYT4.jpg", "Ruhaigazítás próbán az In My Style szalonban")}</div>
  </div>
</section>

<section class="section bg-ink" id="rolunk" aria-labelledby="rolunk-cim">
  <div class="container split">
    <div class="split-media reveal">${pic("npAcJL2BvKL0vi51wMBNg1Ozks.png", "Az In My Style szalon a Kapás utcában")}</div>
    <div class="split-body">
      <div class="eyebrow" style="color:#a9c6e2">Rólunk</div>
      <h2 class="h2" id="rolunk-cim">Valódi nőknek, valódi nőktől</h2>
      <p class="lead" style="color:#d5dde0">Olyan márka vagyunk, amely értékeli a valódi szépséget és a kifogástalan szabást.</p>
      <p style="color:#c9d3d6">Célunk, hogy minden nő megtapasztalja a személyre szabott luxust — akár a hétköznapokban is —, és hogy a ruhái igazán kiemeljék az egyéniségét. Üzleti, sportos megjelenés, kényelem és nőiesség, a megfizethetőség jegyében.</p>
      <ul class="checklist checklist-light" style="color:#e6ecee">
        <li>Személyes konzultáció Mitterer Szilviával</li>
        <li>Kézzel készülő darabok hazai műhelyből</li>
        <li>Barátságos szalon a Kapás utcában</li>
      </ul>
      <a class="btn btn-light" href="#kapcsolat">Látogass el hozzánk</a>
    </div>
  </div>
</section>

<section class="section" id="velemenyek" aria-labelledby="velemeny-cim">
  <div class="container">
    <div class="section-head center">
      <div class="eyebrow">Vásárlói vélemények</div>
      <h2 class="h2" id="velemeny-cim">Akik már nálunk jártak</h2>
      <p class="lead">Valódi vélemények azoktól, akik már megtapasztalták a tökéletes szabást.</p>
    </div>
    <div class="testimonials">${reviews.map(([n, t]) => `<figure class="testimonial reveal"><div class="testimonial-stars" aria-label="5 csillag">${I.star.repeat(5)}</div><blockquote>„${esc(t)}”</blockquote><figcaption>${esc(n)}</figcaption></figure>`).join("")}</div>
  </div>
</section>

<section class="section bg-tint" id="galeria" aria-labelledby="galeria-cim">
  <div class="container">
    <div class="section-head-row">
      <div class="section-head"><div class="eyebrow">Galéria</div><h2 class="h2" id="galeria-cim">Sportos elegancia minden részletben</h2></div>
      <a class="link-arrow" href="${SITE.instagram}" target="_blank" rel="noopener">Kövess az Instagramon</a>
    </div>
    <div class="gallery">${gallery.map((g) => `<figure class="reveal">${pic(g, "In My Style ruha — inspiráció")}</figure>`).join("")}</div>
  </div>
</section>

<section class="section" id="ajandekutalvany" aria-label="Ajándékutalvány és születésnapi élmény">
  <div class="container offers">
    <article class="offer reveal">
      <div class="offer-media">${pic("8Itt096HFQA0HT3NX6dYMC0PHcM.jpg", "In My Style ajándékkártya")}</div>
      <div class="offer-body">
        <div class="eyebrow">Meglepetés</div>
        <h2 class="h3">Ajándékutalvány</h2>
        <p class="muted">Lepd meg az ünnepeltet egy In My Style ajándékkártyával — bármelyik szolgáltatásunkra beváltható.</p>
        <div class="chips"><span class="chip">Ruhatervezés, ruharendelés</span><span class="chip">Privát shopping</span><span class="chip">Kapszulagardrób</span><span class="chip">Vásárlás stylisttal</span><span class="chip">Stíluscoaching</span></div>
        <a class="btn btn-dark" href="#ajanlatkeres">Utalványt igénylek</a>
      </div>
    </article>
    <article class="offer offer-dark reveal">
      <div class="offer-media">${pic("s0kyJSUrJ3nebAMkxarE4o4a4.jpg", "Születésnapi ünneplés az In My Style szalonban")}</div>
      <div class="offer-body">
        <div class="eyebrow">Ünnepeld velünk</div>
        <h2 class="h3">Születésnapi élmény az In My Style-ban</h2>
        <p class="muted">Tedd felejthetetlenné a születésnapodat, vagy ajándékozz stílusos ünneplést!</p>
        <ul class="checklist checklist-light" style="margin-top:4px">
          <li>VIP-tagság kedvezményekkel</li>
          <li>Ünnepi dekoráció és mini catering</li>
          <li>Személyre szabott ruhák, tanácsadás és coaching</li>
        </ul>
        <a class="btn btn-light" href="#idopont">Időpontot foglalok</a>
      </div>
    </article>
  </div>
</section>

${quoteSection()}
${faqSection()}
${contactSection()}`;
  return page({
    title: "In My Style – egyedi méretre készülő női ruhák Budapesten",
    description: "Egyedi méretre készülő női ruhák, aktuális kollekció, igazítás és javítás a budapesti In My Style szalonban (1027 Budapest, Kapás utca 45.). Foglalj időpontot!",
    url: "/",
    image: "/assets/icons/og-image.jpg",
    jsonld: [businessLd, { "@context": "https://schema.org", "@type": "WebSite", name: "In My Style", url: SITE.url + "/", inLanguage: "hu-HU" }, faqLd],
    body,
  });
}

function categoryPage(c) {
  const items = PRODUCTS.filter((p) => p.category === c.slug);
  const crumbs = [["Főoldal", "/"], ["Kollekció", "/#kollekcio"], [c.name, catUrl(c)]];
  const siblings = CATEGORIES.filter((x) => x.group === c.group);
  const body = `
<section class="page-hero" aria-labelledby="kat-cim">
  <div class="page-hero-media">${pic(c.heroPhoto, "", { eager: true })}</div>
  <div class="container">
    ${breadcrumbHtml(crumbs)}
    <div class="eyebrow">${esc(c.tagline)}</div>
    <h1 id="kat-cim">${esc(c.title)}</h1>
    <p class="lead">${esc(c.intro)}</p>
  </div>
</section>

<section class="section" aria-labelledby="darabok-cim">
  <div class="container">
    <div class="section-head-row">
      <div class="section-head"><div class="eyebrow">Most elérhető</div><h2 class="h2" id="darabok-cim">${esc(c.name)} — jelenleg elérhető darabok</h2></div>
      <a class="link-arrow" href="#ajanlatkeres">Egyedit szeretnék</a>
    </div>
    <div class="product-grid">${items.length ? items.map((p) => productCard(p, { showCat: false })).join("") : `<div class="empty-state"><p>Hamarosan új darabok érkeznek ebbe a kategóriába. Egyedi méretre azonban most is elkészítjük a neked tetsző modellt!</p><a class="btn btn-dark" href="#ajanlatkeres">Ajánlatot kérek</a></div>`}</div>
  </div>
</section>
${c.gallery && c.gallery.length ? `
<section class="section bg-tint" aria-labelledby="ref-cim">
  <div class="container">
    <div class="section-head"><div class="eyebrow">Referenciák</div><h2 class="h2" id="ref-cim">Ilyeneket készítettünk már</h2><p class="lead">Néhány korábbi, egyedi méretre készült darabunk — inspirációnak.</p></div>
    <div class="product-grid scroll-row">${c.gallery.map((g) => `<figure class="product-card-media reveal" style="margin:0">${pic(g, `${c.name} – In My Style referencia`)}</figure>`).join("")}</div>
  </div>
</section>` : ""}
${quoteSection({ subject: `Kategória: ${c.name}`, title: `Kérj ajánlatot — ${c.name}`, lead: `Kérj visszahívást, vagy add meg előre a méreteidet és az elképzelésedet, és felkészülten várunk a konzultáción.` })}
<section class="section-sm" aria-label="További kategóriák">
  <div class="container">
    <h2 class="h3" style="margin-bottom:18px">További ${c.group === "ruhazat" ? "ruházati" : "kiegészítő"} kategóriák</h2>
    <nav class="cat-chips">${siblings.map((x) => `<a href="${catUrl(x)}"${x.slug === c.slug ? ' aria-current="page"' : ""}>${esc(x.name)}</a>`).join("")}</nav>
  </div>
</section>
${faqSection()}
${contactSection()}`;
  return page({
    title: `${c.title} – In My Style, Budapest`,
    description: `${c.intro} Budapesti szalon: 1027 Budapest, Kapás utca 45.`.slice(0, 300),
    url: catUrl(c),
    image: `/assets/photos/${c.heroPhoto}`,
    jsonld: [breadcrumbLd(crumbs), {
      "@context": "https://schema.org", "@type": "CollectionPage", name: c.title, url: SITE.url + catUrl(c),
      mainEntity: { "@type": "ItemList", itemListElement: items.map((p, i) => ({ "@type": "ListItem", position: i + 1, url: SITE.url + prodUrl(p), name: p.name })) },
    }],
    body,
  });
}

function priceNumber(price) {
  const n = String(price || "").replace(/[^\d]/g, "");
  return n ? Number(n) : null;
}

function productPage(p) {
  const c = catBySlug[p.category];
  const crumbs = [["Főoldal", "/"], [c.name, catUrl(c)], [p.name, prodUrl(p)]];
  const specs = Object.entries(p.specs || {});
  const related = PRODUCTS.filter((x) => x.slug !== p.slug && x.category === p.category).concat(PRODUCTS.filter((x) => x.slug !== p.slug && x.category !== p.category && x.featured)).slice(0, 4);
  const badges = [];
  badges.push(p.type === "egyedi" ? '<span class="tag tag-soft">Egyedi méretre készül</span>' : '<span class="tag tag-soft">Kész darab</span>');
  if (p.badge) badges.push(`<span class="tag ${/elfogy/i.test(p.badge) ? "tag-dark" : /kiárus|akci/i.test(p.badge) ? "tag-rose" : "tag-accent"}">${esc(p.badge)}</span>`);
  const num = priceNumber(p.price);
  const productLd = {
    "@context": "https://schema.org", "@type": "Product", name: p.name, description: p.description,
    image: p.photos.map((f) => SITE.url + "/assets/photos/" + f), category: c.name, brand: { "@type": "Brand", name: "In My Style" },
    url: SITE.url + prodUrl(p),
  };
  if (num) productLd.offers = { "@type": "Offer", price: num, priceCurrency: "HUF", url: SITE.url + prodUrl(p), availability: /elfogy/i.test(p.badge || "") ? "https://schema.org/OutOfStock" : "https://schema.org/InStoreOnly", seller: { "@id": SITE.url + "/#szalon" } };

  const body = `
<section class="section-sm" aria-labelledby="termek-cim">
  <div class="container">
    ${breadcrumbHtml(crumbs)}
    <div class="pd">
      <div class="pd-gallery" data-gallery>
        <div class="pd-main">${pic(p.photos[0], p.name, { eager: true })}</div>
        ${p.photos.length > 1 ? `<div class="pd-thumbs">${p.photos.map((f, i) => `<button type="button" data-src="/assets/photos/${f}" aria-label="${i + 1}. kép"${i === 0 ? ' aria-current="true"' : ""}>${pic(f, "")}</button>`).join("")}</div>` : ""}
      </div>
      <div class="pd-info">
        <div class="badges">${badges.join("")}</div>
        <h1 id="termek-cim">${esc(p.name)}</h1>
        <p class="lead">${esc(p.description)}</p>
        <div class="pd-price"><span>Ár</span>${p.price ? `<b>${esc(p.price)}</b>` : '<b class="is-quote">Egyeztetés alapján</b>'}</div>
        ${specs.length ? `<dl class="pd-specs">${specs.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join("")}<div><dt>Átfutás</dt><dd>${p.type === "egyedi" ? "Jellemzően 1–2 hét" : "Azonnal elvihető"}</dd></div></dl>` : `<dl class="pd-specs"><div><dt>Kategória</dt><dd>${esc(c.name)}</dd></div><div><dt>Átfutás</dt><dd>${p.type === "egyedi" ? "Jellemzően 1–2 hét" : "Azonnal elvihető"}</dd></div></dl>`}
        <div class="pd-actions">
          <a class="btn btn-dark" href="#ajanlatkeres">Ajánlatot kérek erre a darabra</a>
          <a class="btn btn-outline" href="${SITE.phoneHref}">${I.phone}Hívás</a>
          <a class="btn btn-outline" href="${SITE.instagram}" target="_blank" rel="noopener">${I.instagram}Üzenet</a>
        </div>
        <div class="pd-note">
          <h2>Rád szabva</h2>
          <p>${p.type === "egyedi" ? "Ez a darab egyedi méretre készül: a konzultáción felvesszük a méreteidet, és közösen kiválasztjuk az anyagot és a színt." : "Ez a darab kész, fix méretű termék. Ha nem a te méreted, szívesen elkészítjük egyedi méretre is, vagy igazítunk rajta."}</p>
        </div>
      </div>
    </div>
  </div>
</section>
${quoteSection({ subject: `Termék: ${p.name} (${c.name})`, title: `Ajánlatkérés — ${p.name}`, lead: "Kérj visszahívást, vagy add meg előre a méreteidet — a kért darabot már előkészítve várjuk." })}
${related.length ? `<section class="section" aria-labelledby="hasonlo-cim">
  <div class="container">
    <div class="section-head-row"><div class="section-head"><div class="eyebrow">Neked ajánljuk</div><h2 class="h2" id="hasonlo-cim">Hasonló darabok</h2></div><a class="link-arrow" href="${catUrl(c)}">Összes: ${esc(c.name)}</a></div>
    <div class="product-grid">${related.map((x) => productCard(x)).join("")}</div>
  </div>
</section>` : ""}
${contactSection()}`;
  return page({
    title: `${p.name} – ${c.name} | In My Style`,
    description: `${p.description} ${p.price ? `Ár: ${p.price}.` : "Ár egyeztetés alapján."} In My Style szalon, 1027 Budapest, Kapás utca 45.`,
    url: prodUrl(p),
    image: `/assets/photos/${p.photos[0]}`,
    jsonld: [breadcrumbLd(crumbs), productLd],
    body,
  });
}

function salePage() {
  const items = PRODUCTS.filter((p) => p.sale);
  const crumbs = [["Főoldal", "/"], ["Akció", "/akcio/"]];
  const body = `
<section class="page-hero page-hero-plain" aria-labelledby="akcio-cim">
  <div class="container">
    ${breadcrumbHtml(crumbs)}
    <div class="eyebrow">Kiárusítás</div>
    <h1 id="akcio-cim">Akciós darabok</h1>
    <p class="lead">Korlátozott számú, leárazott darabjaink — amíg a készlet tart. Ha kérdésed van egy adott ruháról, hívj vagy írj nekünk!</p>
  </div>
</section>
<section class="section">
  <div class="container">
    <div class="product-grid">${items.length ? items.map((p) => productCard(p)).join("") : `<div class="empty-state"><p>Jelenleg nincs aktív akció — nézz vissza hamarosan, vagy iratkozz fel a hírlevelünkre!</p><a class="btn btn-dark" href="/#kollekcio">Kollekció megtekintése</a></div>`}</div>
  </div>
</section>
${contactSection()}`;
  return page({
    title: "Akciós női ruhák és kiárusítás – In My Style",
    description: "Leárazott, korlátozott számú darabok az In My Style budapesti szalonjából — amíg a készlet tart.",
    url: "/akcio/", active: "akcio", jsonld: [breadcrumbLd(crumbs)], body,
  });
}

function privacyPage() {
  const crumbs = [["Főoldal", "/"], ["Adatkezelési tájékoztató", "/adatkezelesi-tajekoztato/"]];
  const content = fs.readFileSync(path.join(ROOT, "src/content/adatkezeles.html"), "utf8");
  const body = `
<section class="page-hero page-hero-plain"><div class="container">${breadcrumbHtml(crumbs)}<h1>Adatkezelési tájékoztató</h1><p class="lead">Az In My Style (Mitterer Szilvia E.V.) adatkezelési tájékoztatója.</p></div></section>
<section class="section"><div class="container legal">${content}</div></section>`;
  return page({ title: "Adatkezelési tájékoztató – In My Style", description: "Az In My Style (Mitterer Szilvia E.V.) weboldalának adatkezelési tájékoztatója.", url: "/adatkezelesi-tajekoztato/", jsonld: [breadcrumbLd(crumbs)], body });
}

function noticePage({ url, title, h1, lead, noindex = true }) {
  const body = `<section class="section notice"><div class="container">
  <div class="eyebrow no-rule">In My Style</div>
  <h1 class="h1">${h1}</h1>
  <p class="lead">${lead}</p>
  <div class="actions"><a class="btn btn-dark" href="/">Vissza a főoldalra</a><a class="btn btn-outline" href="/#kollekcio">Kollekció</a></div>
</div></section>`;
  return page({ title, description: lead, url, noindex, body });
}

/* ---------------- write ---------------- */
function write(rel, html) {
  const out = path.join(DIST, rel);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, html);
}
function copyDir(src, dst, filter = () => true) {
  fs.mkdirSync(dst, { recursive: true });
  for (const e of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, e.name), d = path.join(dst, e.name);
    if (e.isDirectory()) copyDir(s, d, filter);
    else if (filter(s)) fs.copyFileSync(s, d);
  }
}

// adatellenőrzés
const slugs = new Set();
for (const p of PRODUCTS) {
  if (!catBySlug[p.category]) throw new Error(`Ismeretlen kategória: "${p.category}" (${p.name})`);
  if (!p.slug || slugs.has(p.slug)) throw new Error(`Hiányzó vagy ismétlődő termék-slug: ${p.name}`);
  slugs.add(p.slug);
}

fs.rmSync(DIST, { recursive: true, force: true });
copyDir(path.join(ROOT, "assets"), path.join(DIST, "assets"), (f) => !f.includes(`${path.sep}photos${path.sep}`));
copyDir(path.join(ROOT, "css"), path.join(DIST, "css"));
fs.mkdirSync(path.join(DIST, "js"), { recursive: true });
fs.copyFileSync(path.join(ROOT, "js/main.js"), path.join(DIST, "js/main.js"));

write("index.html", homePage());
CATEGORIES.forEach((c) => write(`kategoria/${c.slug}/index.html`, categoryPage(c)));
PRODUCTS.forEach((p) => write(`termek/${p.slug}/index.html`, productPage(p)));
write("akcio/index.html", salePage());
write("adatkezelesi-tajekoztato/index.html", privacyPage());
write("koszonjuk/index.html", noticePage({ url: "/koszonjuk/", title: "Köszönjük! – In My Style", h1: "Köszönjük, megkaptuk!", lead: "Hamarosan felvesszük veled a kapcsolatot. Ha sürgős, hívj minket bátran: " + SITE.phone + "." }));
write("404.html", noticePage({ url: "/404.html", title: "Az oldal nem található – In My Style", h1: "Ez az oldal nem található", lead: "Lehet, hogy a keresett oldal megszűnt vagy átköltözött. Nézz körül a kollekcióban, vagy térj vissza a főoldalra." }));

// sitemap + robots + átirányítások
const today = new Date().toISOString().slice(0, 10);
const urls = ["/", "/akcio/", "/adatkezelesi-tajekoztato/", ...CATEGORIES.map(catUrl), ...PRODUCTS.map(prodUrl)];
write("sitemap.xml", `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((u) => `  <url><loc>${SITE.url}${u}</loc><lastmod>${today}</lastmod></url>`).join("\n")}\n</urlset>\n`);
write("robots.txt", `User-agent: *\nAllow: /\nDisallow: /koszonjuk/\n\nSitemap: ${SITE.url}/sitemap.xml\n`);
const redirects = [
  "/index.html / 301",
  "/kategoria.html slug=:slug /kategoria/:slug/ 301",
  "/kategoria.html /#kollekcio 301",
  "/termek.html /#kollekcio 301",
  "/akcio.html /akcio/ 301",
  "/gdpr.html /adatkezelesi-tajekoztato/ 301",
  "/gdpr /adatkezelesi-tajekoztato/ 301",
  "/kategoria_ing /kategoria/ing/ 301",
  "/kategoria_ing/* /kategoria/ing/ 301",
  ...CATEGORIES.filter((c) => c.legacy && c.legacy !== c.slug).map((c) => `/kategoria/${c.legacy}/ /kategoria/${c.slug}/ 301`),
  ...CATEGORIES.filter((c) => c.legacy && c.legacy !== c.slug).map((c) => `/kategoria/${c.legacy} /kategoria/${c.slug}/ 301`),
];
write("_redirects", redirects.join("\n") + "\n");

// csak a ténylegesen használt fotók kerülnek ki
const used = new Set();
for (const f of fs.readdirSync(DIST, { recursive: true })) {
  if (!String(f).endsWith(".html")) continue;
  const html = fs.readFileSync(path.join(DIST, String(f)), "utf8");
  for (const m of html.matchAll(/\/assets\/photos\/([^"'\s)?]+)/g)) used.add(m[1]);
}
fs.mkdirSync(path.join(DIST, "assets/photos"), { recursive: true });
for (const f of used) {
  const src = path.join(ROOT, "assets/photos", f);
  if (fs.existsSync(src)) fs.copyFileSync(src, path.join(DIST, "assets/photos", f));
}

console.log(`Kész: ${CATEGORIES.length} kategória, ${PRODUCTS.length} termék, ${urls.length} URL a sitemapben → dist/`);
