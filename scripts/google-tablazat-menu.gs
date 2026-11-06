/* In My Style – „Weboldal” menü a termék-táblázathoz.
   • Fotó feltöltése: a kép a táblázat tulajdonosának Google Drive-jába kerül („In My Style – weboldal fotók” mappa).
   • Weboldal frissítése: elindítja a Netlify-építést; a weboldal ekkor letölti a táblázat termékeit és fotóit.
   • A webalkalmazás (doGet/doPost) csak olvasható termékadatot ad ki; fotót csak a titkos kulccsal lehet feltölteni. */
var SHEET_ID = "1EW6XjGuvlxYveoVuzneo-Bi3s9Ge-J4Dlpr6UqtNFYk";
var SITE = "https://inmystyle.netlify.app";
var RAW = "https://raw.githubusercontent.com/bajzathbalazs-hue/inmystyle-site/main/assets/photos/";
var COL = { show: 1, preview: 2, name: 3, cat: 4, type: 5, price: 6, desc: 7, anyag: 8, fazon: 9, szin: 10, meret: 11, badge: 12, featured: 13, sale: 14, photos: 15, slug: 16 };
var PROPS = PropertiesService.getScriptProperties();

function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu("Weboldal")
    .addItem("📷 Fotó feltöltése a kijelölt termékhez", "openUploader")
    .addItem("✔️ Ellenőrzés", "checkOnly")
    .addSeparator()
    .addItem("🚀 Weboldal frissítése", "publish")
    .addSeparator()
    .addSubMenu(ui.createMenu("Beállítások").addItem("Netlify-indítólink megadása", "setBuildHook"))
    .addToUi();
}

/* ---------- egyszeri beállítás (a táblázat tulajdonosa futtatja) ---------- */
function setup() {
  var folderId = PROPS.getProperty("PHOTO_FOLDER_ID");
  if (!folderId) { folderId = DriveApp.createFolder("In My Style – weboldal fotók").getId(); PROPS.setProperty("PHOTO_FOLDER_ID", folderId); }
  if (!PROPS.getProperty("UPLOAD_KEY")) PROPS.setProperty("UPLOAD_KEY", Utilities.getUuid() + Utilities.getUuid());
  var sh = productSheet();
  sh.getRange(2, COL.preview, sh.getMaxRows() - 1, 1).setFormula('=IF(O2="";"";IF(LEFT(TRIM(REGEXEXTRACT(O2;"^[^,]+"));6)="drive:";IMAGE("https://drive.google.com/thumbnail?sz=w300&id="&MID(TRIM(REGEXEXTRACT(O2;"^[^,]+"));7;200));IMAGE("' + RAW + '"&TRIM(REGEXEXTRACT(O2;"^[^,]+")))))');
  Logger.log("Fotómappa: https://drive.google.com/drive/folders/" + folderId);
}

function setBuildHook() {
  var ui = SpreadsheetApp.getUi();
  var r = ui.prompt("Netlify-indítólink", "Másold be a Netlify build hook címét (https://api.netlify.com/build_hooks/… kezdetű).", ui.ButtonSet.OK_CANCEL);
  if (r.getSelectedButton() !== ui.Button.OK) return;
  var u = r.getResponseText().trim();
  if (!/^https:\/\/api\.netlify\.com\/build_hooks\/[a-z0-9]+$/i.test(u)) { ui.alert("Ez nem Netlify build hook cím. Ellenőrizd, és próbáld újra."); return; }
  PROPS.setProperty("BUILD_HOOK", u);
  ui.alert("Elmentve ✓", "Mostantól a Weboldal → Weboldal frissítése gomb élesíti a változásokat.", ui.ButtonSet.OK);
}

/* ---------- segédfüggvények ---------- */
function book() { return SpreadsheetApp.openById(SHEET_ID); }
function productSheet() { var sh = book().getSheetByName("Termékek"); if (!sh) throw new Error("Nem találom a Termékek lapot."); return sh; }
function slugify(s) { return String(s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60); }
function json(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }

/* ---------- webalkalmazás: termékek és fotók a weboldal építéséhez ---------- */
function doGet(e) {
  var mode = (e && e.parameter && e.parameter.mode) || "products";
  if (mode === "products") { var r = readProducts(); return json({ ok: true, products: r.products, errors: r.errors, at: new Date().toISOString() }); }
  if (mode === "photo") {
    var id = String(e.parameter.id || "");
    var file = DriveApp.getFileById(id);
    var parents = file.getParents(), inFolder = false, fid = PROPS.getProperty("PHOTO_FOLDER_ID");
    while (parents.hasNext()) if (parents.next().getId() === fid) inFolder = true;
    if (!inFolder) return json({ ok: false, error: "nem elérhető" });
    var blob = file.getBlob();
    return json({ ok: true, mime: blob.getContentType(), b64: Utilities.base64Encode(blob.getBytes()) });
  }
  return json({ ok: false, error: "ismeretlen kérés" });
}

function doPost(e) {
  var d = JSON.parse(e.postData.contents);
  if (!d.key || d.key !== PROPS.getProperty("UPLOAD_KEY")) return json({ ok: false, error: "jogosulatlan" });
  var folder = DriveApp.getFolderById(PROPS.getProperty("PHOTO_FOLDER_ID"));
  var blob = Utilities.newBlob(Utilities.base64Decode(d.b64), "image/jpeg", d.name);
  var f = folder.createFile(blob);
  try { f.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW); } catch (err) {}
  return json({ ok: true, id: f.getId() });
}

/* ---------- Fotó feltöltése ---------- */
function openUploader() {
  var sh = SpreadsheetApp.getActiveSheet(), ui = SpreadsheetApp.getUi();
  var row = sh.getActiveRange() ? sh.getActiveRange().getRow() : 0;
  if (sh.getName() !== "Termékek" || row < 2) { ui.alert("Előbb kattints a Termékek lapon annak a terméknek a sorára, amelyikhez a fotót töltöd fel."); return; }
  var name = sh.getRange(row, COL.name).getValue();
  if (!name) { ui.alert("Ebben a sorban még nincs terméknév. Előbb írd be a termék nevét."); return; }
  ui.showSidebar(HtmlService.createHtmlOutput(uploaderHtml(row, String(name))).setTitle("Fotó feltöltése"));
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
    '<button class="btn" onclick="google.script.host.close()">Kész</button>' +
    '<script>var ROW=' + row + ';' +
    'function resize(file){return new Promise(function(ok,bad){var r=new FileReader();r.onload=function(){var img=new Image();img.onload=function(){var m=1600,w=img.width,h=img.height,s=Math.min(1,m/Math.max(w,h));var c=document.createElement("canvas");c.width=Math.round(w*s);c.height=Math.round(h*s);c.getContext("2d").drawImage(img,0,0,c.width,c.height);ok(c.toDataURL("image/jpeg",0.85));};img.onerror=function(){bad(new Error("A kép nem olvasható. iPhone-fotónál a Fotók appban válaszd a Megosztás → Mentés fájlba lehetőséget JPG-ként."));};img.src=r.result;};r.readAsDataURL(file);});}' +
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
  var file = slug + "-" + Utilities.formatDate(new Date(), "Europe/Budapest", "yyyyMMdd-HHmmss") + ".jpg";
  var b64 = String(dataUrl).split(",")[1];
  var id;
  var owner = book().getOwner();
  if (owner && Session.getEffectiveUser().getEmail() === owner.getEmail()) {
    // a tulajdonos közvetlenül a saját Drive-jába ment
    var f = DriveApp.getFolderById(PROPS.getProperty("PHOTO_FOLDER_ID")).createFile(Utilities.newBlob(Utilities.base64Decode(b64), "image/jpeg", file));
    try { f.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW); } catch (err) {}
    id = f.getId();
  } else {
    // más szerkesztő (pl. Szilvia) a webalkalmazáson keresztül ment a tulajdonos mappájába
    var url = PROPS.getProperty("WEBAPP_URL") || ScriptApp.getService().getUrl();
    if (!url) throw new Error("A fotófeltöltés még nincs beállítva. Szólj Balázsnak.");
    var res = UrlFetchApp.fetch(url, { method: "post", contentType: "application/json", payload: JSON.stringify({ key: PROPS.getProperty("UPLOAD_KEY"), name: file, b64: b64 }), muteHttpExceptions: true, followRedirects: true });
    var out = JSON.parse(res.getContentText());
    if (!out.ok) throw new Error("A feltöltés nem sikerült (" + out.error + ").");
    id = out.id;
  }
  var cell = sh.getRange(row, COL.photos), cur = String(cell.getValue() || "").trim();
  cell.setValue(cur ? cur + ", drive:" + id : "drive:" + id);
  return id;
}

/* ---------- Ellenőrzés és közzététel ---------- */
function readProducts() {
  var ss = book(), sh = productSheet(), cats = {};
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
    if (/^\d[\d\s.]*$/.test(price)) price = String(Number(price.replace(/\D/g, ""))).replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " Ft";
    var specs = {};
    [["Anyag", COL.anyag], ["Fazon", COL.fazon], ["Szín", COL.szin], ["Méret", COL.meret]].forEach(function (s) { var t = String(v[s[1] - 1]).trim(); if (t) specs[s[0]] = t; });
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
  var hook = PROPS.getProperty("BUILD_HOOK");
  if (!hook) { ui.alert("A frissítés még nincs beállítva", "Hiányzik a Netlify-indítólink (Weboldal → Beállítások). Szólj Balázsnak.", ui.ButtonSet.OK); return; }
  var ok = ui.alert("Weboldal frissítése", r.products.length + " termék kerül ki az oldalra." + (r.warnings.length ? "\n\n• " + r.warnings.join("\n• ") : "") + "\n\nMehet?", ui.ButtonSet.YES_NO);
  if (ok !== ui.Button.YES) return;
  var sh = productSheet();
  r.fixes.forEach(function (f) { sh.getRange(f[0], COL.slug).setValue(f[1]); });
  var res = UrlFetchApp.fetch(hook + "?trigger_title=" + encodeURIComponent("Termékek frissítése a táblázatból"), { method: "post", muteHttpExceptions: true });
  if (res.getResponseCode() >= 300) throw new Error("A frissítés indítása nem sikerült (" + res.getResponseCode() + ").");
  logEvent("Weboldal frissítése: " + r.products.length + " termék");
  ui.alert("Elküldve ✓", "A weboldal frissítése elindult. Körülbelül 2–3 perc múlva látod a változásokat:\n" + SITE, ui.ButtonSet.OK);
}

function logEvent(t) {
  var ss = book(), sh = ss.getSheetByName("Napló") || ss.insertSheet("Napló");
  if (sh.getLastRow() === 0) sh.appendRow(["Időpont", "Esemény", "Felhasználó"]);
  sh.appendRow([new Date(), t, Session.getActiveUser().getEmail()]);
}
