/* In My Style – „Weboldal” menü a termék-táblázathoz.
   Fotó feltöltése, ellenőrzés és közzététel a weboldalra (GitHub → Netlify). */
var OWNER = "bajzathbalazs-hue", REPO = "inmystyle-site", BRANCH = "main";
var SITE = "https://inmystyle.netlify.app";
var COL = { show: 1, name: 3, cat: 4, type: 5, price: 6, desc: 7, anyag: 8, fazon: 9, szin: 10, meret: 11, badge: 12, featured: 13, sale: 14, photos: 15, slug: 16 };

function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu("Weboldal")
    .addItem("📷 Fotó feltöltése a kijelölt termékhez", "openUploader")
    .addItem("✔️ Ellenőrzés", "checkOnly")
    .addSeparator()
    .addItem("🚀 Weboldal frissítése", "publish")
    .addSeparator()
    .addSubMenu(ui.createMenu("Beállítások").addItem("GitHub-kulcs megadása", "setToken"))
    .addToUi();
}

function setToken() {
  var ui = SpreadsheetApp.getUi();
  var r = ui.prompt("GitHub-kulcs", "Másold be a GitHub hozzáférési kulcsot (csak az inmystyle-site tárolóhoz, Contents: Read and write joggal).", ui.ButtonSet.OK_CANCEL);
  if (r.getSelectedButton() !== ui.Button.OK) return;
  var t = r.getResponseText().trim();
  if (!t) return;
  PropertiesService.getScriptProperties().setProperty("GITHUB_TOKEN", t);
  var test = gh("get", "", null);
  ui.alert(test.code === 200 ? "A kulcs működik. Mostantól használható a Weboldal menü." : "A kulcs nem működik (" + test.code + "). Ellenőrizd, és add meg újra.");
}

function gh(method, p, payload) {
  var tok = PropertiesService.getScriptProperties().getProperty("GITHUB_TOKEN");
  if (!tok) throw new Error("Hiányzik a GitHub-kulcs. Weboldal → Beállítások → GitHub-kulcs megadása.");
  var opt = { method: method, muteHttpExceptions: true, headers: { Authorization: "Bearer " + tok, Accept: "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28" } };
  if (payload) { opt.contentType = "application/json"; opt.payload = JSON.stringify(payload); }
  var res = UrlFetchApp.fetch("https://api.github.com/repos/" + OWNER + "/" + REPO + p, opt);
  var body = null; try { body = JSON.parse(res.getContentText()); } catch (e) {}
  return { code: res.getResponseCode(), json: body };
}

function slugify(s) {
  return String(s).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60);
}

function productSheet() {
  var sh = SpreadsheetApp.getActive().getSheetByName("Termékek");
  if (!sh) throw new Error("Nem találom a Termékek lapot.");
  return sh;
}

/* ---------- Fotó feltöltése ---------- */
function openUploader() {
  var ss = SpreadsheetApp.getActive(), sh = ss.getActiveSheet(), ui = SpreadsheetApp.getUi();
  var row = sh.getActiveRange() ? sh.getActiveRange().getRow() : 0;
  if (sh.getName() !== "Termékek" || row < 2) { ui.alert("Előbb kattints a Termékek lapon annak a terméknek a sorára, amelyikhez a fotót töltöd fel."); return; }
  var name = sh.getRange(row, COL.name).getValue();
  if (!name) { ui.alert("Ebben a sorban még nincs terméknév. Előbb írd be a termék nevét."); return; }
  var html = HtmlService.createHtmlOutput(uploaderHtml(row, String(name))).setTitle("Fotó feltöltése");
  ui.showSidebar(html);
}

function uploaderHtml(row, name) {
  var esc = function (t) { return String(t).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };
  return '<!doctype html><html><head><base target="_top"><style>' +
    'body{font-family:Arial,sans-serif;font-size:14px;color:#1b1d1f;margin:14px}h3{margin:0 0 4px;font-size:16px}p{color:#5b6567;margin:0 0 14px;line-height:1.45}' +
    '.drop{display:block;border:2px dashed #b9c6c8;border-radius:12px;padding:22px 12px;text-align:center;cursor:pointer;background:#f6f8f8}.drop:hover{border-color:#1b1d1f}' +
    'input{display:none}.list{margin-top:14px;display:grid;gap:8px}.item{display:flex;gap:10px;align-items:center;font-size:13px}.item img{width:48px;height:60px;object-fit:cover;border-radius:6px;background:#eee}' +
    '.ok{color:#2e7d32}.err{color:#b8325a}.btn{margin-top:16px;width:100%;padding:10px;border:0;border-radius:999px;background:#1b1d1f;color:#fff;font-size:14px;cursor:pointer}' +
    '</style></head><body><h3>' + esc(name) + '</h3><p>' + row + '. sor. Válaszd ki a fotókat. Az első fotó lesz a fő kép. A képeket feltöltés előtt automatikusan kicsinyítjük.</p>' +
    '<label class="drop">📷 Fotók kiválasztása<input id="f" type="file" accept="image/*" multiple></label><div class="list" id="l"></div>' +
    '<button class="btn" onclick="google.script.host.close()">Bezárás</button>' +
    '<script>var ROW=' + row + ';' +
    'function resize(file){return new Promise(function(ok,bad){var r=new FileReader();r.onload=function(){var img=new Image();img.onload=function(){var m=1600,w=img.width,h=img.height,s=Math.min(1,m/Math.max(w,h));var c=document.createElement("canvas");c.width=Math.round(w*s);c.height=Math.round(h*s);c.getContext("2d").drawImage(img,0,0,c.width,c.height);ok(c.toDataURL("image/jpeg",0.85));};img.onerror=function(){bad(new Error("A kép nem olvasható (HEIC esetén mentsd JPG-ként)."));};img.src=r.result;};r.readAsDataURL(file);});}' +
    'document.getElementById("f").addEventListener("change",async function(e){var files=[].slice.call(e.target.files);for(var i=0;i<files.length;i++){var it=document.createElement("div");it.className="item";it.innerHTML="<img><span>Feltöltés…</span>";document.getElementById("l").appendChild(it);' +
    'try{var d=await resize(files[i]);it.querySelector("img").src=d;await new Promise(function(ok,bad){google.script.run.withSuccessHandler(ok).withFailureHandler(bad).uploadPhoto(ROW,d);});it.querySelector("span").className="ok";it.querySelector("span").textContent="Feltöltve ✓";}' +
    'catch(err){it.querySelector("span").className="err";it.querySelector("span").textContent="Hiba: "+(err.message||err);}}e.target.value="";});' +
    '</script></body></html>';
}

function uploadPhoto(row, dataUrl) {
  var sh = productSheet();
  var name = sh.getRange(row, COL.name).getValue();
  var slug = sh.getRange(row, COL.slug).getValue() || slugify(name);
  if (!sh.getRange(row, COL.slug).getValue()) sh.getRange(row, COL.slug).setValue(slug);
  var stamp = Utilities.formatDate(new Date(), "Europe/Budapest", "yyyyMMdd-HHmmss") + "-" + Math.floor(Math.random() * 900 + 100);
  var file = slug + "-" + stamp + ".jpg";
  var b64 = String(dataUrl).split(",")[1];
  var r = gh("put", "/contents/assets/photos/" + file, { message: "Fotó: " + name + " [skip netlify]", content: b64, branch: BRANCH });
  if (r.code !== 201 && r.code !== 200) throw new Error("A feltöltés nem sikerült (" + r.code + ").");
  var cell = sh.getRange(row, COL.photos), cur = String(cell.getValue() || "").trim();
  cell.setValue(cur ? cur + ", " + file : file);
  return file;
}

/* ---------- Ellenőrzés és közzététel ---------- */
function readProducts() {
  var ss = SpreadsheetApp.getActive(), sh = productSheet();
  var cats = {};
  ss.getSheetByName("Kategóriák").getDataRange().getValues().slice(1).forEach(function (r) { if (r[0]) cats[String(r[0]).trim()] = String(r[1]).trim(); });
  var last = sh.getLastRow();
  var vals = last > 1 ? sh.getRange(2, 1, last - 1, 16).getValues() : [];
  var out = [], errors = [], warnings = [], slugs = {}, featured = 0, fixes = [];
  vals.forEach(function (v, i) {
    var row = i + 2, name = String(v[COL.name - 1]).trim();
    var any = v.slice(2, 16).some(function (x) { return String(x).trim() !== "" && x !== false; });
    if (!name && !any) return;
    if (v[COL.show - 1] !== true) return;
    var miss = [];
    if (!name) miss.push("név");
    var catName = String(v[COL.cat - 1]).trim(), cat = cats[catName];
    if (!catName) miss.push("kategória"); else if (!cat) errors.push(row + ". sor: ismeretlen kategória („" + catName + "”).");
    var type = String(v[COL.type - 1]).trim();
    if (!type) miss.push("típus");
    var desc = String(v[COL.desc - 1]).trim();
    if (!desc) miss.push("leírás");
    var photos = String(v[COL.photos - 1]).split(",").map(function (s) { return s.trim(); }).filter(String);
    if (!photos.length) miss.push("fotó");
    if (miss.length) { errors.push(row + ". sor (" + (name || "névtelen") + "): hiányzik: " + miss.join(", ") + "."); return; }
    var slug = String(v[COL.slug - 1]).trim() || slugify(name);
    if (!String(v[COL.slug - 1]).trim()) fixes.push([row, slug]);
    if (slugs[slug]) errors.push(row + ". sor: a webcím („" + slug + "”) már szerepel a " + slugs[slug] + ". sorban. Adj meg másik nevet vagy webcímet.");
    slugs[slug] = row;
    var price = String(v[COL.price - 1]).trim();
    if (/^\d[\d\s.]*$/.test(price)) price = Number(price.replace(/\D/g, "")).toLocaleString("hu-HU").replace(/\u00a0|,/g, " ") + " Ft";
    var specs = {};
    if (String(v[COL.anyag - 1]).trim()) specs["Anyag"] = String(v[COL.anyag - 1]).trim();
    if (String(v[COL.fazon - 1]).trim()) specs["Fazon"] = String(v[COL.fazon - 1]).trim();
    if (String(v[COL.szin - 1]).trim()) specs["Szín"] = String(v[COL.szin - 1]).trim();
    if (String(v[COL.meret - 1]).trim()) specs["Méret"] = String(v[COL.meret - 1]).trim();
    var p = { slug: slug, category: cat, name: name, type: type === "Kész darab" ? "import" : "egyedi", photos: photos, price: price, description: desc };
    if (Object.keys(specs).length) p.specs = specs;
    if (String(v[COL.badge - 1]).trim()) p.badge = String(v[COL.badge - 1]).trim();
    if (v[COL.featured - 1] === true) { p.featured = true; featured++; }
    if (v[COL.sale - 1] === true) p.sale = true;
    out.push(p);
  });
  if (featured > 4) warnings.push("A főoldalon csak az első 4 kiemelt termék jelenik meg (most " + featured + " van bepipálva).");
  if (featured === 0) warnings.push("Nincs főoldalon kiemelt termék, ezért a főoldal kollekció-része üres lesz.");
  return { products: out, errors: errors, warnings: warnings, fixes: fixes };
}

function checkOnly() {
  var r = readProducts(), ui = SpreadsheetApp.getUi();
  var msg = r.products.length + " termék jelenik meg az oldalon.";
  if (r.errors.length) msg += "\n\nJavítandó:\n• " + r.errors.join("\n• ");
  if (r.warnings.length) msg += "\n\nFigyelem:\n• " + r.warnings.join("\n• ");
  if (!r.errors.length) msg += "\n\nMinden rendben, közzéteheted: Weboldal → Weboldal frissítése.";
  ui.alert("Ellenőrzés", msg, ui.ButtonSet.OK);
}

function publish() {
  var ui = SpreadsheetApp.getUi(), r = readProducts();
  if (r.errors.length) { ui.alert("Előbb javítsd ezeket", "• " + r.errors.join("\n• "), ui.ButtonSet.OK); return; }
  var ok = ui.alert("Weboldal frissítése", r.products.length + " termék kerül ki az oldalra." + (r.warnings.length ? "\n\n• " + r.warnings.join("\n• ") : "") + "\n\nMehet?", ui.ButtonSet.YES_NO);
  if (ok !== ui.Button.YES) return;
  var sh = productSheet();
  r.fixes.forEach(function (f) { sh.getRange(f[0], COL.slug).setValue(f[1]); });
  var json = JSON.stringify(r.products, null, 2) + "\n";
  var cur = gh("get", "/contents/data/termekek.json?ref=" + BRANCH, null);
  if (cur.code !== 200) throw new Error("Nem érem el a weboldal tárolóját (" + cur.code + "). Ellenőrizd a GitHub-kulcsot.");
  var user = Session.getActiveUser().getEmail() || "táblázat";
  var res = gh("put", "/contents/data/termekek.json", { message: "Termékek frissítése a táblázatból (" + user + ")", content: Utilities.base64Encode(json, Utilities.Charset.UTF_8), sha: cur.json.sha, branch: BRANCH });
  if (res.code !== 200 && res.code !== 201) throw new Error("A közzététel nem sikerült (" + res.code + ").");
  ss_log("Közzétéve: " + r.products.length + " termék");
  ui.alert("Elküldve ✓", "A termékek elindultak a weboldalra. Körülbelül 2–3 perc múlva frissül:\n" + SITE, ui.ButtonSet.OK);
}

function ss_log(t) {
  var ss = SpreadsheetApp.getActive(), sh = ss.getSheetByName("Napló") || ss.insertSheet("Napló");
  if (sh.getLastRow() === 0) sh.appendRow(["Időpont", "Esemény", "Felhasználó"]);
  sh.appendRow([new Date(), t, Session.getActiveUser().getEmail()]);
}
