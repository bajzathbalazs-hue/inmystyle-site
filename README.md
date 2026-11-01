# In My Style – weboldal (inmystyle.hu)

Statikus weboldal, amelyet a Netlify épít és szolgál ki.

## Hogyan működik?
- **Tartalom:** `js/products-data.js` (kategóriák és termékek), `src/content/adatkezeles.html` (adatkezelési tájékoztató).
- **Build:** `node scripts/build.mjs` → a kész oldal a `dist/` mappába kerül (minden kategória és termék saját oldalt kap, sitemap, robots.txt, átirányítások).
- **Kinézet:** `css/style.css`, **interakciók:** `js/main.js`.
- **Űrlapok:** Netlify Forms (`visszahivas`, `ajanlatkeres`, `hirlevel`).

## Új termék felvétele
1. Tedd a fotót az `assets/photos/` mappába (álló, 4:5 arányú JPG ajánlott).
2. Másolj le egy sort a `js/products-data.js` fájl `PRODUCTS` listájában, és írd át.
3. Töltsd fel (push) a GitHubra — a Netlify pár perc alatt frissíti az oldalt.

## Ellenőrzés helyben
```
node scripts/build.mjs
(cd dist && python3 -m http.server 4173) &
node scripts/qa.cjs qa-shots
```
