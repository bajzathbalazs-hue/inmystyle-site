/* In My Style – Termékkezelő (CMS) a termék-táblázathoz.
   Megnyitás: a táblázatban Weboldal → 🗂️ Termékkezelő megnyitása.
   Minden termék egy sorban, a fotók egyszerűen ráhúzhatók a termék sorára; minden módosítás azonnal a táblázatba mentődik.
   A google-tablazat-menu.gs függvényeit használja (book, productSheet, guestSheet, uploadPhoto, readProducts, logEvent, COL, RAW, SITE). */

function openCms() {
  var html = HtmlService.createHtmlOutput(cmsHtml()).setWidth(1280).setHeight(780);
  SpreadsheetApp.getUi().showModalDialog(html, "In My Style – Termékkezelő");
}

/* A Termékek lap Google-„táblázat” (Table), típusos oszlopokkal: oda nem lehet jelölőnégyzetet beszúrni (már az).
   Ezért a jelölőnégyzet-beszúrás csak kísérlet; ha a Google elutasítja, az érték ettől még elmentődik. */
function ensureCheckbox(range) { try { range.insertCheckboxes(); } catch (e) {} return range; }

var CMS_KEYS = { show: COL.show, name: COL.name, cat: COL.cat, type: COL.type, price: COL.price, desc: COL.desc, anyag: COL.anyag, fazon: COL.fazon, szin: COL.szin, meret: COL.meret, badge: COL.badge, featured: COL.featured, sale: COL.sale, photos: COL.photos, slug: COL.slug };

function cmsLoad() {
  var sh = productSheet(), last = sh.getLastRow(), rows = [];
  var vals = last > 1 ? sh.getRange(2, 1, last - 1, 16).getValues() : [];
  vals.forEach(function (v, i) {
    var name = String(v[COL.name - 1]).trim(), photos = String(v[COL.photos - 1]).trim();
    if (!name && !photos) return;
    rows.push({
      row: i + 2, show: v[COL.show - 1] === true, name: name, cat: String(v[COL.cat - 1]), type: String(v[COL.type - 1]),
      price: String(v[COL.price - 1]), desc: String(v[COL.desc - 1]), anyag: String(v[COL.anyag - 1]), fazon: String(v[COL.fazon - 1]),
      szin: String(v[COL.szin - 1]), meret: String(v[COL.meret - 1]), badge: String(v[COL.badge - 1]),
      featured: v[COL.featured - 1] === true, sale: v[COL.sale - 1] === true,
      photos: photos ? photos.split(",").map(function (s) { return s.trim(); }).filter(String) : [], slug: String(v[COL.slug - 1])
    });
  });
  var cats = book().getSheetByName("Kategóriák").getDataRange().getValues().slice(1).map(function (r) { return String(r[0]).trim(); }).filter(String);
  var g = guestSheet(), gl = g.getLastRow(), guests = [];
  if (gl > 1) g.getRange(2, 1, gl - 1, 3).getValues().forEach(function (r, i) { if (String(r[1]).trim()) guests.push({ row: i + 2, show: r[0] === true, photo: String(r[1]).split(",")[0].trim(), caption: String(r[2]) }); });
  return { rows: rows, cats: cats, raw: RAW, site: SITE, guests: guests };
}

function cmsUpdate(row, key, value) {
  var col = CMS_KEYS[key];
  if (!col || row < 2) throw new Error("Ismeretlen mező.");
  var sh = productSheet();
  if (key === "show" || key === "featured" || key === "sale") { ensureCheckbox(sh.getRange(row, col)); value = value === true; }
  if (key === "photos") value = (value || []).join(", ");
  sh.getRange(row, col).setValue(value);
  return true;
}

function cmsAdd() {
  var sh = productSheet(), names = sh.getRange(2, COL.name, sh.getMaxRows() - 1, 1).getValues(), row = 0;
  var photos = sh.getRange(2, COL.photos, sh.getMaxRows() - 1, 1).getValues();
  for (var i = 0; i < names.length; i++) if (!String(names[i][0]).trim() && !String(photos[i][0]).trim()) { row = i + 2; break; }
  if (!row) { sh.insertRowsAfter(sh.getMaxRows(), 20); row = sh.getMaxRows() - 19; }
  ensureCheckbox(sh.getRange(row, COL.show)).setValue(false);
  ensureCheckbox(sh.getRange(row, COL.featured, 1, 2)).setValues([[false, false]]);
  sh.getRange(row, COL.name).setValue("Új termék");
  sh.getRange(row, COL.type).setValue("Kész darab");
  return row;
}

function cmsGuestAddRow() {
  var g = guestSheet(), vals = g.getRange(2, 2, Math.max(g.getMaxRows() - 1, 1), 1).getValues();
  for (var i = 0; i < vals.length; i++) if (!String(vals[i][0]).trim()) return i + 2;
  g.insertRowsAfter(g.getMaxRows(), 20);
  return vals.length + 2;
}

function cmsGuestUpdate(row, key, value) {
  var g = guestSheet();
  if (key === "show") ensureCheckbox(g.getRange(row, 1)).setValue(value === true);
  else if (key === "caption") g.getRange(row, 3).setValue(value);
  else if (key === "remove") { ensureCheckbox(g.getRange(row, 1)).setValue(false); g.getRange(row, 2, 1, 2).clearContent(); }
  return true;
}

/* Oldalképek: a weboldal saját képlistája (oldalkepek.json) alapján frissíti a lapot, és visszaadja a képhelyeket. */
function cmsSiteLoad() {
  var sh = siteSheet(), list = null;
  try {
    var res = UrlFetchApp.fetch(SITE + "/oldalkepek.json?t=" + Date.now(), { muteHttpExceptions: true });
    if (res.getResponseCode() === 200) list = JSON.parse(res.getContentText());
  } catch (e) {}
  var last = sh.getLastRow(), vals = last > 1 ? sh.getRange(2, 1, last - 1, 4).getValues() : [], byKey = {};
  vals.forEach(function (r, i) { if (String(r[1]).trim()) byKey[String(r[1]).trim()] = i + 2; });
  if (list && list.length) {
    var add = [];
    list.forEach(function (it) {
      var row = byKey[it.key];
      if (row) { if (vals[row - 2][0] !== it.place) sh.getRange(row, 1).setValue(it.place); if (vals[row - 2][2] !== it.file) sh.getRange(row, 3).setValue(it.file); }
      else add.push([it.place, it.key, it.file, ""]);
    });
    if (add.length) {
      var start = sh.getLastRow() + 1;
      sh.getRange(start, 1, add.length, 4).setValues(add);
      sh.getRange(start, 5, add.length, 1).setFormulas(add.map(function (_, i) { var r = start + i; return ['=IF(D' + r + '="";IMAGE("' + RAW + '"&C' + r + ');IF(LEFT(D' + r + ';6)="drive:";IMAGE("https://drive.google.com/thumbnail?sz=w300&id="&MID(D' + r + ';7;200));IMAGE("' + RAW + '"&D' + r + ')))']; }));
      sh.setRowHeights(start, add.length, 90);
    }
    last = sh.getLastRow(); vals = sh.getRange(2, 1, last - 1, 4).getValues();
  }
  var rows = [];
  vals.forEach(function (r, i) { if (String(r[1]).trim()) rows.push({ row: i + 2, place: String(r[0]), key: String(r[1]).trim(), file: String(r[2]).trim(), photo: String(r[3]).trim() }); });
  return rows;
}

function cmsSiteUpdate(row, photo) {
  siteSheet().getRange(row, 4).setValue(photo || "");
  return true;
}

function cmsCheck() {
  var r = readProducts();
  return { count: r.products.length, errors: r.errors, warnings: r.warnings };
}

function cmsPublish() {
  var r = readProducts();
  if (r.errors.length) return { ok: false, msg: "Előbb javítsd ezeket:\n• " + r.errors.join("\n• ") };
  var hook = PROPS.getProperty("BUILD_HOOK");
  if (!hook) return { ok: false, msg: "A frissítés még nincs beállítva (hiányzik a Netlify-indítólink). Szólj Balázsnak." };
  var sh = productSheet();
  r.fixes.forEach(function (f) { sh.getRange(f[0], COL.slug).setValue(f[1]); });
  var res = UrlFetchApp.fetch(hook + "?trigger_title=" + encodeURIComponent("Termékkezelőből frissítve"), { method: "post", muteHttpExceptions: true });
  if (res.getResponseCode() >= 300) return { ok: false, msg: "A frissítés indítása nem sikerült (" + res.getResponseCode() + ")." };
  logEvent("Weboldal frissítése a termékkezelőből: " + r.products.length + " termék");
  return { ok: true, msg: "A frissítés elindult: " + r.products.length + " termék. Körülbelül 2–3 perc múlva látod az oldalon." + (r.warnings.length ? "\n\nFigyelem:\n• " + r.warnings.join("\n• ") : "") };
}

function cmsHtml() {
  return '<!doctype html><html><head><base target="_blank"><meta charset="utf-8"><style>' + CMS_CSS + '</style></head><body>' + CMS_BODY + '<script>' + CMS_JS + '</script></body></html>';
}

var CMS_CSS = [
  ':root{--ink:#16181a;--muted:#6b7375;--line:#e6eaeb;--soft:#f5f7f7;--accent:#4d81b3;--rose:#b8325a;--ok:#2e7d32}',
  '*{box-sizing:border-box}body{margin:0;font:13px/1.4 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial,sans-serif;color:var(--ink);background:#fff;height:100vh;display:flex;flex-direction:column}',
  '.top{position:sticky;top:0;z-index:5;background:#fff;border-bottom:1px solid var(--line);padding:10px 14px;display:flex;gap:8px;align-items:center;flex-wrap:wrap}',
  '.tabs{display:flex;gap:4px;background:var(--soft);padding:3px;border-radius:9px}.tabs button{border:0;background:none;padding:6px 12px;border-radius:7px;font-weight:600;cursor:pointer;color:var(--muted)}.tabs button.on{background:#fff;color:var(--ink);box-shadow:0 1px 2px rgba(0,0,0,.08)}',
  'input,select,textarea{font:inherit;color:inherit}.search{border:1px solid var(--line);border-radius:8px;padding:7px 10px;width:190px;min-width:120px}.top select{border:1px solid var(--line);border-radius:8px;padding:6px 8px;background:#fff}',
  '.sp{flex:1}.status{color:var(--muted);font-size:12px;white-space:nowrap;text-align:right}.status.ok{color:var(--ok)}.status.err{color:var(--rose)}',
  '.btn{border:1px solid var(--line);background:#fff;border-radius:999px;padding:7px 14px;font-weight:600;cursor:pointer;white-space:nowrap}.btn.dark{background:var(--ink);color:#fff;border-color:var(--ink)}.btn:disabled{opacity:.5}',
  '.hint{padding:8px 14px;color:var(--muted);font-size:12px;background:var(--soft);border-bottom:1px solid var(--line)}',
  '.wrap{flex:1;min-height:0;overflow:auto}table{border-collapse:separate;border-spacing:0;min-width:1900px;width:100%}',
  'th{position:sticky;top:0;z-index:3;background:#fafbfb;text-align:left;font-size:11px;letter-spacing:.04em;text-transform:uppercase;color:var(--muted);padding:8px;border-bottom:1px solid var(--line);white-space:nowrap}',
  'td{padding:8px;border-bottom:1px solid var(--line);vertical-align:top;background:#fff}tr.hidden td{background:#fcfcfc}tr.hidden .nm{color:var(--muted)}',
  'td.sticky,th.sticky{position:sticky;left:0;z-index:2;width:64px;min-width:64px}th.sticky{z-index:4}td.sticky2,th.sticky2{position:sticky;left:64px;z-index:2;width:274px;min-width:274px}th.sticky2{z-index:4}td.sticky3,th.sticky3{position:sticky;left:338px;z-index:2;box-shadow:6px 0 6px -6px rgba(0,0,0,.15)}th.sticky3{z-index:4}',
  'td input[type=text],td select,td textarea{width:100%;border:1px solid transparent;border-radius:6px;padding:5px 6px;background:transparent}td input[type=text]:hover,td select:hover,td textarea:hover{border-color:var(--line)}td input[type=text]:focus,td select:focus,td textarea:focus{outline:0;border-color:var(--accent);background:#fff}',
  'td textarea{resize:vertical;min-height:52px}.nm{font-weight:600}',
  '.ph{width:254px;min-height:76px;border:1.5px dashed #cfd8da;border-radius:10px;padding:6px;display:flex;gap:6px;flex-wrap:wrap;align-items:center;transition:.15s}.ph.over{border-color:var(--accent);background:#eef4fa}',
  '.th{position:relative;width:48px;height:60px;border-radius:6px;overflow:hidden;background:#eee;cursor:grab;flex:none}.th img{width:100%;height:100%;object-fit:cover;display:block}.th .x{position:absolute;top:2px;right:2px;width:16px;height:16px;border-radius:50%;border:0;background:rgba(0,0,0,.6);color:#fff;font-size:11px;line-height:16px;padding:0;cursor:pointer;display:none}.th:hover .x{display:block}.th .main{position:absolute;left:0;right:0;bottom:0;background:rgba(0,0,0,.55);color:#fff;font-size:9px;text-align:center}',
  '.th.up{opacity:.45}.add{width:48px;height:60px;border-radius:6px;border:1px dashed #b9c6c8;display:flex;align-items:center;justify-content:center;color:var(--muted);cursor:pointer;font-size:18px;flex:none}.add:hover{border-color:var(--ink);color:var(--ink)}',
  '.empty{color:var(--muted);font-size:12px;padding:0 4px}.sw{display:inline-block;width:34px;height:20px;border-radius:999px;background:#d5dcdd;position:relative;cursor:pointer;border:0;vertical-align:middle}.sw:after{content:"";position:absolute;top:2px;left:2px;width:16px;height:16px;border-radius:50%;background:#fff;transition:.15s}.sw.on{background:var(--ok)}.sw.on:after{left:16px}',
  '.lnk{font-size:11px;color:var(--accent);text-decoration:none}.miss{display:inline-block;font-size:10px;color:var(--rose);background:#f8e8ed;border-radius:999px;padding:1px 7px;margin-top:3px}',
  '.guests{padding:16px;display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:14px}.gcard{border:1px solid var(--line);border-radius:12px;overflow:hidden}.gcard img{width:100%;aspect-ratio:4/5;object-fit:cover;display:block;background:#eee}.gcard .b{padding:8px;display:grid;gap:6px}.gcard textarea{width:100%;border:1px solid var(--line);border-radius:6px;padding:5px;min-height:44px}',
  '.gdrop{border:2px dashed #cfd8da;border-radius:12px;display:flex;align-items:center;justify-content:center;text-align:center;color:var(--muted);min-height:250px;cursor:pointer;padding:12px}.gdrop.over{border-color:var(--accent);background:#eef4fa}',
  '.sites{padding:6px 16px 24px}.sites h3{font-size:13px;letter-spacing:.06em;text-transform:uppercase;color:var(--muted);margin:22px 0 10px}.sgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(190px,1fr));gap:14px}',
  '.scard{border:1px solid var(--line);border-radius:12px;overflow:hidden;position:relative;transition:.15s}.scard.over{border-color:var(--accent);box-shadow:0 0 0 3px #dbe8f4}.scard img{width:100%;aspect-ratio:4/5;object-fit:cover;display:block;background:#eee}.scard.up img{opacity:.4}',
  '.scard .b{padding:8px 10px;display:grid;gap:7px}.scard .pl{font-size:12px;line-height:1.35;min-height:32px}.scard .tag{position:absolute;top:8px;left:8px;font-size:10px;font-weight:700;border-radius:999px;padding:2px 8px;background:#fff;color:var(--muted)}.scard .tag.new{background:var(--ok);color:#fff}',
  '.scard .row2{display:flex;gap:6px}.scard .btn{padding:6px 10px;font-size:12px;flex:1}',
  '.modal{position:fixed;inset:0;background:rgba(0,0,0,.35);display:none;align-items:center;justify-content:center;z-index:9}.modal.on{display:flex}.modal .box{background:#fff;border-radius:14px;padding:18px;max-width:640px;white-space:pre-wrap;max-height:80vh;overflow:auto}'
].join("");

var CMS_BODY = [
  '<div class="top"><div class="tabs"><button data-tab="p" class="on">Termékek</button><button data-tab="g">Vendégfotók</button><button data-tab="s">Oldalképek</button></div>',
  '<input class="search" id="q" placeholder="Keresés név, szín, anyag szerint…">',
  '<select id="fc"><option value="">Minden kategória</option></select>',
  '<select id="fs"><option value="">Minden termék</option><option value="on">Megjelenik</option><option value="off">Rejtett</option><option value="nophoto">Fotó nélkül</option><option value="sale">Akciós</option></select>',
  '<button class="btn" id="add">+ Új termék</button><span class="sp"></span><span class="status" id="st">Betöltés…</span>',
  '<button class="btn" id="chk">Ellenőrzés</button><button class="btn dark" id="pub">Weboldal frissítése</button></div>',
  '<div class="hint" id="hint">Húzd a fotókat a termék sorára (a szaggatott keretbe). Az első kép lesz a fő kép; a sorrendet a képek áthúzásával módosíthatod. Minden változás azonnal mentődik a táblázatba; a weboldalon a „Weboldal frissítése” gombbal jelenik meg.</div>',
  '<div class="wrap" id="pw"><table><thead><tr><th class="sticky">Látható</th><th class="sticky2">Fotók</th><th class="sticky3">Név</th><th>Kategória</th><th>Típus</th><th>Ár</th><th>Címke</th><th>Főoldal</th><th>Akciós</th><th>Leírás</th><th>Anyag</th><th>Szín</th><th>Méret</th><th>Fazon</th></tr></thead><tbody id="tb"></tbody></table></div>',
  '<div class="wrap" id="gw" style="display:none"><div class="guests" id="gl"></div></div>',
  '<div class="wrap" id="sw" style="display:none"><div id="sl" class="sites"><div class="empty" style="padding:20px">Betöltés…</div></div></div>',
  '<input type="file" id="fi" accept="image/*" multiple style="display:none">',
  '<div class="modal" id="md"><div class="box"><div id="mt"></div><div style="text-align:right;margin-top:14px"><button class="btn dark" id="mc">Rendben</button></div></div></div>'
].join("");

var CMS_JS = [
  'var D=null,pending=0,fileTarget=null;',
  'function $(i){return document.getElementById(i)}',
  'function esc(t){return String(t==null?"":t).replace(/[&<>"]/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;","\\"":"&quot;"}[c]})}',
  'function src(p){return p.indexOf("drive:")===0?"https://drive.google.com/thumbnail?sz=w300&id="+p.slice(6):D.raw+encodeURIComponent(p)}',
  'function status(t,c){var s=$("st");s.textContent=t;s.className="status "+(c||"")}',
  'function busy(d){pending+=d;if(pending>0)status("Mentés…");else status("Minden mentve ✓","ok")}',
  'window.addEventListener("beforeunload",function(e){if(pending>0){e.preventDefault();e.returnValue=""}});',
  'function call(fn,args,ok){busy(1);var r=google.script.run.withSuccessHandler(function(x){busy(-1);if(ok)ok(x)}).withFailureHandler(function(e){pending--;status("Hiba: "+(e.message||e),"err")});r[fn].apply(r,args)}',
  'function msg(t){$("mt").textContent=t;$("md").classList.add("on")}$("mc").onclick=function(){$("md").classList.remove("on")};',
  'function load(){google.script.run.withSuccessHandler(function(d){D=d;var fc=$("fc");d.cats.forEach(function(c){var o=document.createElement("option");o.value=c;o.textContent=c;fc.appendChild(o)});render();renderGuests();status(d.rows.length+" termék","ok")}).withFailureHandler(function(e){status("Hiba: "+e.message,"err")}).cmsLoad()}',
  'function opts(list,cur){var h="";if(cur&&list.indexOf(cur)<0)h+="<option>"+esc(cur)+"</option>";list.forEach(function(c){h+="<option"+(c===cur?" selected":"")+">"+esc(c)+"</option>"});return h}',
  'function visible(r){var q=$("q").value.toLowerCase().trim(),fc=$("fc").value,fs=$("fs").value;if(fc&&r.cat!==fc)return false;if(fs==="on"&&!r.show)return false;if(fs==="off"&&r.show)return false;if(fs==="nophoto"&&r.photos.length)return false;if(fs==="sale"&&!r.sale)return false;if(q&&(r.name+" "+r.szin+" "+r.anyag+" "+r.cat).toLowerCase().indexOf(q)<0)return false;return true}',
  'function photosHtml(r){var h=r.photos.map(function(p,i){return "<div class=\\"th\\" draggable=\\"true\\" data-i=\\""+i+"\\"><img src=\\""+esc(src(p))+"\\" loading=\\"lazy\\" alt=\\"\\">"+(i===0?"<span class=\\"main\\">fő kép</span>":"")+"<button class=\\"x\\" data-del=\\""+i+"\\" title=\\"Fotó eltávolítása\\">×</button></div>"}).join("");return h+"<div class=\\"add\\" title=\\"Fotó hozzáadása\\">+</div>"+(r.photos.length?"":"<span class=\\"empty\\">Húzd ide a fotót</span>")}',
  'function rowHtml(r){var types=["Kész darab","Egyedi méretre"];var url=D.site+"/termek/"+(r.slug||"")+"/";',
  ' return "<tr data-row=\\""+r.row+"\\" class=\\""+(r.show?"":"hidden")+"\\">"+',
  '  "<td class=\\"sticky\\"><button class=\\"sw"+(r.show?" on":"")+"\\" data-k=\\"show\\" title=\\"Megjelenik az oldalon\\"></button></td>"+',
  '  "<td class=\\"sticky2\\"><div class=\\"ph\\">"+photosHtml(r)+"</div></td>"+',
  '  "<td class=\\"sticky3\\" style=\\"min-width:220px\\"><input type=\\"text\\" class=\\"nm\\" data-k=\\"name\\" value=\\""+esc(r.name)+"\\">"+(r.show&&r.slug?"<a class=\\"lnk\\" href=\\""+esc(url)+"\\">Megnyitás az oldalon ↗</a>":"")+(!r.photos.length?"<div><span class=\\"miss\\">nincs fotó</span></div>":"")+"</td>"+',
  '  "<td style=\\"min-width:150px\\"><select data-k=\\"cat\\">"+opts(D.cats,r.cat)+"</select></td>"+',
  '  "<td style=\\"min-width:130px\\"><select data-k=\\"type\\">"+opts(types,r.type)+"</select></td>"+',
  '  "<td style=\\"min-width:170px\\"><input type=\\"text\\" data-k=\\"price\\" value=\\""+esc(r.price)+"\\" title=\\"Akciós ár: 32 900 Ft → 23 030 Ft\\"></td>"+',
  '  "<td style=\\"min-width:150px\\"><input type=\\"text\\" data-k=\\"badge\\" value=\\""+esc(r.badge)+"\\"></td>"+',
  '  "<td><button class=\\"sw"+(r.featured?" on":"")+"\\" data-k=\\"featured\\"></button></td>"+',
  '  "<td><button class=\\"sw"+(r.sale?" on":"")+"\\" data-k=\\"sale\\"></button></td>"+',
  '  "<td style=\\"min-width:300px\\"><textarea data-k=\\"desc\\">"+esc(r.desc)+"</textarea></td>"+',
  '  ["anyag","szin","meret","fazon"].map(function(k){return "<td style=\\"min-width:150px\\"><input type=\\"text\\" data-k=\\""+k+"\\" value=\\""+esc(r[k])+"\\"></td>"}).join("")+"</tr>"}',
  'function byRow(n){for(var i=0;i<D.rows.length;i++)if(D.rows[i].row===n)return D.rows[i]}',
  'function render(){$("tb").innerHTML=D.rows.filter(visible).map(rowHtml).join("")||"<tr><td colspan=\\"14\\" style=\\"padding:30px;color:#6b7375\\">Nincs találat.</td></tr>"}',
  'function refreshRow(r){var tr=document.querySelector("tr[data-row=\\""+r.row+"\\"]");if(!tr)return;var t=document.createElement("tbody");t.innerHTML=rowHtml(r);tr.parentNode.replaceChild(t.firstChild,tr)}',
  '["q","fc","fs"].forEach(function(i){$(i).addEventListener("input",render)});',
  'var timers={};',
  'function saveField(el,now){var k=el.getAttribute("data-k");if(!k||el.classList.contains("sw"))return;var tr=el.closest("tr");if(!tr)return;var r=byRow(+tr.getAttribute("data-row"));var id=r.row+":"+k;clearTimeout(timers[id]);var go=function(){if(r[k]===el.value)return;r[k]=el.value;call("cmsUpdate",[r.row,k,el.value]);if(now&&(k==="name"||k==="cat"))refreshRow(r)};if(now)go();else{status("Mentés…");timers[id]=setTimeout(go,700)}}',
  '/* gépelés közben is ment (0,7 mp szünet után), kilépéskor azonnal */',
  '$("tb").addEventListener("input",function(e){if(e.target.tagName!=="SELECT")saveField(e.target,false)});',
  '$("tb").addEventListener("change",function(e){saveField(e.target,true)});',
  '$("tb").addEventListener("click",function(e){var tr=e.target.closest("tr");if(!tr)return;var r=byRow(+tr.getAttribute("data-row"));',
  ' if(e.target.classList.contains("sw")){var k=e.target.getAttribute("data-k");r[k]=!r[k];call("cmsUpdate",[r.row,k,r[k]]);refreshRow(r);return}',
  ' var d=e.target.getAttribute("data-del");if(d!==null){r.photos.splice(+d,1);call("cmsUpdate",[r.row,"photos",r.photos]);refreshRow(r);return}',
  ' if(e.target.classList.contains("add")){fileTarget={kind:"p",r:r};$("fi").click()}});',
  '$("fi").addEventListener("change",function(e){var f=[].slice.call(e.target.files);e.target.value="";if(!fileTarget)return;if(fileTarget.kind==="p")uploadTo(fileTarget.r,f);else if(fileTarget.kind==="s")uploadSite(fileTarget.s,f[0]);else uploadGuests(f)});',
  'function resize(file){return new Promise(function(ok,bad){if(!/^image\\//.test(file.type)&&!/\\.(jpe?g|png|webp|heic)$/i.test(file.name)){bad(new Error("Ez nem kép: "+file.name));return}var rd=new FileReader();rd.onload=function(){var img=new Image();img.onload=function(){var m=1600,w=img.width,h=img.height,s=Math.min(1,m/Math.max(w,h));var c=document.createElement("canvas");c.width=Math.round(w*s);c.height=Math.round(h*s);var x=c.getContext("2d");x.fillStyle="#fff";x.fillRect(0,0,c.width,c.height);x.drawImage(img,0,0,c.width,c.height);ok(c.toDataURL("image/jpeg",0.85))};img.onerror=function(){bad(new Error("A kép nem olvasható ("+file.name+"). iPhone-fotónál mentsd JPG-ként."))};img.src=rd.result};rd.readAsDataURL(file)})}',
  'function uploadTo(r,files){files.reduce(function(p,f){return p.then(function(){return resize(f).then(function(data){r.photos.push("…");var i=r.photos.length-1;refreshRow(r);markUploading(r);return new Promise(function(ok){busy(1);google.script.run.withSuccessHandler(function(id){busy(-1);r.photos[i]="drive:"+id;if(!r.slug)r.slug="";refreshRow(r);ok()}).withFailureHandler(function(e){busy(-1);r.photos.splice(i,1);refreshRow(r);status("Hiba: "+(e.message||e),"err");ok()}).uploadPhoto(r.row,data,"product")})}).catch(function(e){status(e.message,"err")})})},Promise.resolve())}',
  'function markUploading(r){var tr=document.querySelector("tr[data-row=\\""+r.row+"\\"]");if(!tr)return;var t=tr.querySelectorAll(".th");if(t.length)t[t.length-1].classList.add("up")}',
  'var dragSrc=null;',
  '$("tb").addEventListener("dragstart",function(e){var th=e.target.closest&&e.target.closest(".th");if(!th)return;dragSrc={row:+th.closest("tr").getAttribute("data-row"),i:+th.getAttribute("data-i")};e.dataTransfer.effectAllowed="move";e.dataTransfer.setData("text/plain","x")});',
  '$("tb").addEventListener("dragover",function(e){var ph=e.target.closest&&e.target.closest(".ph");if(!ph)return;e.preventDefault();ph.classList.add("over")});',
  '$("tb").addEventListener("dragleave",function(e){var ph=e.target.closest&&e.target.closest(".ph");if(ph&&!ph.contains(e.relatedTarget))ph.classList.remove("over")});',
  '$("tb").addEventListener("drop",function(e){var ph=e.target.closest&&e.target.closest(".ph");if(!ph)return;e.preventDefault();ph.classList.remove("over");var r=byRow(+ph.closest("tr").getAttribute("data-row"));',
  ' if(e.dataTransfer.files&&e.dataTransfer.files.length){dragSrc=null;uploadTo(r,[].slice.call(e.dataTransfer.files));return}',
  ' if(dragSrc&&dragSrc.row===r.row){var th=e.target.closest(".th");var to=th?+th.getAttribute("data-i"):r.photos.length-1;var p=r.photos.splice(dragSrc.i,1)[0];r.photos.splice(to,0,p);dragSrc=null;call("cmsUpdate",[r.row,"photos",r.photos]);refreshRow(r)}});',
  'document.addEventListener("dragover",function(e){e.preventDefault()});document.addEventListener("drop",function(e){e.preventDefault()});',
  '$("add").onclick=function(){call("cmsAdd",[],function(row){var r={row:row,show:false,name:"Új termék",cat:"",type:"Kész darab",price:"",desc:"",anyag:"",fazon:"",szin:"",meret:"",badge:"",featured:false,sale:false,photos:[],slug:""};D.rows.unshift(r);$("q").value="";$("fc").value="";$("fs").value="";render();var el=document.querySelector("tr[data-row=\\""+row+"\\"] .nm");if(el){el.focus();el.select()}})};',
  '$("chk").onclick=function(){call("cmsCheck",[],function(r){var t=r.count+" termék jelenik meg az oldalon.";if(r.errors.length)t+="\\n\\nJavítandó:\\n• "+r.errors.join("\\n• ");if(r.warnings.length)t+="\\n\\nFigyelem:\\n• "+r.warnings.join("\\n• ");if(!r.errors.length)t+="\\n\\nMinden rendben, közzéteheted a „Weboldal frissítése” gombbal.";msg(t)})};',
  '$("pub").onclick=function(){if(!confirm("Frissíted a weboldalt a mostani termékekkel?"))return;$("pub").disabled=true;call("cmsPublish",[],function(r){$("pub").disabled=false;msg(r.msg)})};',
  'var HINTS={p:"Húzd a fotókat a termék sorára (a szaggatott keretbe). Az első kép lesz a fő kép; a sorrendet a képek áthúzásával módosíthatod. Minden változás azonnal mentődik a táblázatba; a weboldalon a „Weboldal frissítése” gombbal jelenik meg.",g:"Húzd a vendégfotókat a bal felső keretbe. A felirat nem kötelező. A kikapcsolt fotó nem jelenik meg az oldalon.",s:"A weboldal összes nem termékhez tartozó képe, oldalanként. Egy képet úgy cserélsz le, hogy ráhúzod az új fotót a kártyára (vagy „Csere” gomb). Az „Eredeti” gomb visszaállítja a régi képet. A weboldalon a „Weboldal frissítése” után jelenik meg."};',
  'var siteLoaded=false;',
  'document.querySelectorAll(".tabs button").forEach(function(b){b.onclick=function(){var t=b.getAttribute("data-tab");document.querySelectorAll(".tabs button").forEach(function(x){x.classList.toggle("on",x===b)});$("pw").style.display=t==="p"?"":"none";$("gw").style.display=t==="g"?"":"none";$("sw").style.display=t==="s"?"":"none";["q","fc","fs","add"].forEach(function(i){$(i).style.visibility=t==="p"?"":"hidden"});$("hint").textContent=HINTS[t];if(t==="s"&&!siteLoaded){siteLoaded=true;loadSite()}}});',
  'function loadSite(){status("Oldalképek betöltése…");google.script.run.withSuccessHandler(function(rows){D.site_rows=rows;renderSite();status("Minden mentve ✓","ok")}).withFailureHandler(function(e){status("Hiba: "+(e.message||e),"err")}).cmsSiteLoad()}',
  'function siteGroup(p){var i=p.indexOf(" – ");return i>0?p.slice(0,i):"Egyéb"}',
  'function renderSite(){var rows=D.site_rows||[];if(!rows.length){$("sl").innerHTML="<div class=\\"empty\\" style=\\"padding:20px\\">Még nincs képlista. Előbb frissítsd egyszer a weboldalt, utána nyisd meg újra ezt a fület.</div>";return}var order=[],groups={};rows.forEach(function(r,i){var g=siteGroup(r.place);if(!groups[g]){groups[g]=[];order.push(g)}groups[g].push(i)});order.sort(function(a,b){return a==="Főoldal"?-1:b==="Főoldal"?1:a==="Lookbook"?1:b==="Lookbook"?-1:a.localeCompare(b,"hu")});',
  ' $("sl").innerHTML=order.map(function(g){return "<h3>"+esc(g)+"</h3><div class=\\"sgrid\\">"+groups[g].map(function(i){var r=rows[i];var cur=r.photo||r.file;var pl=r.place.indexOf(" – ")>0?r.place.slice(r.place.indexOf(" – ")+3):r.place;return "<div class=\\"scard\\" data-si=\\""+i+"\\"><span class=\\"tag"+(r.photo?" new":"")+"\\">"+(r.photo?"Lecserélve":"Eredeti")+"</span><img src=\\""+esc(src(cur))+"\\" loading=\\"lazy\\" alt=\\"\\"><div class=\\"b\\"><div class=\\"pl\\">"+esc(pl)+"</div><div class=\\"row2\\"><button class=\\"btn\\" data-sa=\\"swap\\">Csere</button>"+(r.photo?"<button class=\\"btn\\" data-sa=\\"reset\\">Eredeti</button>":"")+"</div></div></div>"}).join("")+"</div>"}).join("")}',
  '$("sl").addEventListener("click",function(e){var a=e.target.getAttribute("data-sa");if(!a)return;var r=D.site_rows[+e.target.closest(".scard").getAttribute("data-si")];if(a==="swap"){fileTarget={kind:"s",s:r};$("fi").click()}if(a==="reset"){r.photo="";call("cmsSiteUpdate",[r.row,""]);renderSite()}});',
  '$("sl").addEventListener("dragover",function(e){var c=e.target.closest&&e.target.closest(".scard");if(!c)return;e.preventDefault();c.classList.add("over")});',
  '$("sl").addEventListener("dragleave",function(e){var c=e.target.closest&&e.target.closest(".scard");if(c&&!c.contains(e.relatedTarget))c.classList.remove("over")});',
  '$("sl").addEventListener("drop",function(e){var c=e.target.closest&&e.target.closest(".scard");if(!c)return;e.preventDefault();c.classList.remove("over");var f=e.dataTransfer.files;if(f&&f.length)uploadSite(D.site_rows[+c.getAttribute("data-si")],f[0])});',
  'function uploadSite(r,file){resize(file).then(function(data){var c=document.querySelector(".scard[data-si=\\""+D.site_rows.indexOf(r)+"\\"]");if(c){c.classList.add("up");c.querySelector("img").src=data}busy(1);google.script.run.withSuccessHandler(function(id){busy(-1);r.photo="drive:"+id;renderSite()}).withFailureHandler(function(e){busy(-1);status("Hiba: "+(e.message||e),"err");renderSite()}).uploadPhoto(r.row,data,"site")}).catch(function(e){status(e.message,"err")})}',
  'function renderGuests(){$("gl").innerHTML="<div class=\\"gdrop\\" id=\\"gd\\">📷<br>Húzd ide a vendégfotókat<br>vagy kattints a kiválasztáshoz</div>"+D.guests.map(function(g,i){return "<div class=\\"gcard\\" data-i=\\""+i+"\\"><img src=\\""+esc(src(g.photo))+"\\" alt=\\"\\"><div class=\\"b\\"><label><button class=\\"sw"+(g.show?" on":"")+"\\" data-gk=\\"show\\"></button> Megjelenik</label><textarea data-gk=\\"caption\\" placeholder=\\"Felirat (nem kötelező)\\">"+esc(g.caption)+"</textarea><button class=\\"btn\\" data-gk=\\"remove\\">Eltávolítás</button></div></div>"}).join("");var gd=$("gd");gd.onclick=function(){fileTarget={kind:"g"};$("fi").click()};gd.ondragover=function(e){e.preventDefault();gd.classList.add("over")};gd.ondragleave=function(){gd.classList.remove("over")};gd.ondrop=function(e){e.preventDefault();gd.classList.remove("over");uploadGuests([].slice.call(e.dataTransfer.files))}}',
  '$("gl").addEventListener("click",function(e){var k=e.target.getAttribute("data-gk");if(!k||k==="caption")return;var c=e.target.closest(".gcard"),g=D.guests[+c.getAttribute("data-i")];if(k==="show"){g.show=!g.show;call("cmsGuestUpdate",[g.row,"show",g.show]);renderGuests()}if(k==="remove"){if(!confirm("Eltávolítod ezt a vendégfotót az oldalról?"))return;call("cmsGuestUpdate",[g.row,"remove",true]);D.guests.splice(+c.getAttribute("data-i"),1);renderGuests()}});',
  'var gtimer=null;function saveCap(el,now){if(el.getAttribute("data-gk")!=="caption")return;var g=D.guests[+el.closest(".gcard").getAttribute("data-i")];clearTimeout(gtimer);var go=function(){if(g.caption===el.value)return;g.caption=el.value;call("cmsGuestUpdate",[g.row,"caption",g.caption])};if(now)go();else{status("Mentés…");gtimer=setTimeout(go,700)}}',
  '$("gl").addEventListener("input",function(e){saveCap(e.target,false)});$("gl").addEventListener("change",function(e){saveCap(e.target,true)});',
  'function uploadGuests(files){files.reduce(function(p,f){return p.then(function(){return resize(f).then(function(data){return new Promise(function(ok){busy(1);google.script.run.withSuccessHandler(function(row){google.script.run.withSuccessHandler(function(id){busy(-1);D.guests.push({row:row,show:true,photo:"drive:"+id,caption:""});renderGuests();ok()}).withFailureHandler(function(e){busy(-1);status("Hiba: "+(e.message||e),"err");ok()}).uploadPhoto(row,data,"guest")}).withFailureHandler(function(e){busy(-1);status("Hiba: "+(e.message||e),"err");ok()}).cmsGuestAddRow()})}).catch(function(e){status(e.message,"err")})})},Promise.resolve())}',
  'load();'
].join("\n");
