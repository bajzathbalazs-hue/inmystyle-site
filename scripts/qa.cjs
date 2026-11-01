/* Minőségellenőrzés: képernyőképek, vízszintes görgetés, konzolhibák, törött linkek.
   Használat: (cd dist && python3 -m http.server 4173) & node scripts/qa.cjs [kimeneti mappa] */
const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");

const BASE = process.env.BASE || "http://localhost:4173";
const OUT = process.argv[2] || "qa-shots";
const PAGES = ["/", "/kategoria/ing/", "/kategoria/kituzok/", "/termek/klasszikus-feher-ing/", "/akcio/", "/adatkezelesi-tajekoztato/", "/404.html"];
const VIEWPORTS = [["desktop", 1440, 900], ["phone", 390, 844]];

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch();
  const problems = [];
  const seenLinks = new Set();
  for (const [vname, w, h] of VIEWPORTS) {
    const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
    page.on("console", (m) => { if (m.type() === "error" && !/fontshare|googleapis|calendly|google\.com|ERR_TUNNEL/.test(m.text())) problems.push(`[${vname}] console: ${m.text()}`); });
    page.on("pageerror", (e) => problems.push(`[${vname}] JS-hiba: ${e.message}`));
    for (const url of PAGES) {
      await page.goto(BASE + url, { waitUntil: "networkidle" });
      const hgt = await page.evaluate(() => document.documentElement.scrollHeight);
      for (let y = 0; y < hgt; y += 500) { await page.evaluate((y) => window.scrollTo(0, y), y); await page.waitForTimeout(70); }
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(400);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      if (overflow > 1) problems.push(`[${vname}] ${url}: vízszintes túlcsordulás ${overflow}px`);
      const broken = await page.evaluate(() => Array.from(document.images).filter((i) => i.complete && i.naturalWidth === 0).map((i) => i.currentSrc || i.src));
      broken.forEach((b) => problems.push(`[${vname}] ${url}: törött kép ${b}`));
      if (vname === "desktop") {
        const links = await page.evaluate(() => Array.from(document.querySelectorAll("a[href^='/']")).map((a) => a.getAttribute("href").split("#")[0]).filter(Boolean));
        links.forEach((l) => seenLinks.add(l));
      }
      const name = (url === "/" ? "fooldal" : url.replace(/^\/|\/$/g, "").replace(/[\/.]/g, "_")) + `-${vname}.png`;
      await page.screenshot({ path: path.join(OUT, name), fullPage: true });
    }
    await page.close();
  }
  for (const l of seenLinks) {
    const p = path.join(__dirname, "..", "dist", decodeURIComponent(l.split("?")[0]), l.endsWith("/") ? "index.html" : "");
    if (!fs.existsSync(p)) problems.push(`Törött link: ${l}`);
  }
  await browser.close();
  console.log(problems.length ? problems.join("\n") : "Nincs talált hiba.");
})();
