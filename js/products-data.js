/* ============================================================
   In My Style — kategóriák és termékek (EZT A FÁJLT KELL SZERKESZTENI)

   Új termék felvétele:
   1. Tedd a fotót az assets/photos/ mappába (lehetőleg álló, 4:5 arányú JPG).
   2. Másolj le egy meglévő sort a PRODUCTS listában, és írd át a mezőket.
   3. Mentsd el, és töltsd fel (push) a GitHubra — a Netlify pár perc alatt
      automatikusan elkészíti a termék saját oldalát, és frissíti a kategóriát.

   Termék mezői:
     slug        – a termék webcíme, ékezet nélkül, kötőjellel (pl. "feher-ing")
     category    – a lenti CATEGORIES lista egyik slug-ja
     name        – a termék neve
     type        – "egyedi" (méretre készül) vagy "import" (kész darab, fix méret)
     photos      – fotók fájlnevei az assets/photos/ mappából; az első a fő kép
     price       – pl. "24 900 Ft"; hagyd üresen (""), ha egyeztetés alapján
     description – 1–3 mondatos leírás
     specs       – { Anyag: "...", Szín: "...", Méret: "..." } — bármelyik elhagyható
     badge       – pl. "Készleten: 5 db", "Elfogyott", "Kiárusítás" — elhagyható
     featured    – true, ha a főoldali „Aktuális kollekció” részben is megjelenjen
     sale        – true, ha az Akció oldalon is megjelenjen
   ============================================================ */

const CATEGORIES = [
  { slug: "ing", legacy: "ing", name: "Ing", title: "Egyedi méretre készülő női ingek", group: "ruhazat", tagline: "Egyedi méretre", heroPhoto: "HUQkBb62ebyhvbv3Geh48NtJcqg.jpg",
    intro: "Puha pamutpopelintől a könnyű selyemig — minden ing a te alakodra, a te ízlésedre szabva készül. Nézd meg a jelenleg elérhető darabokat, vagy kérj teljesen egyedi tervezést anyag- és színválasztással.",
    gallery: ["GedtJrI7cNP9rVgxtFwSVIMJyMA.jpeg", "HUQkBb62ebyhvbv3Geh48NtJcqg.jpg", "L45iRZ3KoxUg1DIqnmcC5FXKEiA.jpeg", "5bFqnTfSOc9hMkRM7WxmDFQFQjs.jpg"] },
  { slug: "ing-ruha", legacy: "ingruha", name: "Ing ruha", title: "Ing ruhák egyedi méretre", group: "ruhazat", tagline: "Egyedi méretre", heroPhoto: "6es6MykWWyAqSyt10cTe4pX4k.png",
    intro: "Az ing letisztultsága ruhába öntve: kényelmes, mégis kifinomult darabok, amelyek a te alkatodra készülnek — irodába és hétvégére egyaránt." },
  { slug: "blezer", legacy: "blezer", name: "Blézer", title: "Méretre szabott női blézerek", group: "ruhazat", tagline: "Egyedi méretre", heroPhoto: "FuzmlZu4JwbOrfbz9kuZ30Q7XMM.jpg",
    intro: "Tiszta vonalak, tökéletes illeszkedés. Méretre szabott blézereink a sportos elegancia alapdarabjai a hétköznapokban és az ünnepi alkalmakon is." },
  { slug: "nadragok", legacy: "nadrag", name: "Nadrágok", title: "Méretre szabott női nadrágok", group: "ruhazat", tagline: "Egyedi méretre", heroPhoto: "jahxr9wPPHcxK0AWCJ8AZaeHQnY.jpeg",
    intro: "Szabott és kényelmes nadrágok kompromisszumok nélkül: hosszuk, bőségük és anyaguk a te igényeidhez igazodik." },
  { slug: "szoknyak", legacy: "szoknya", name: "Szoknyák", title: "Egyedi méretre készülő szoknyák", group: "ruhazat", tagline: "Egyedi méretre", heroPhoto: "C8ss4vZRvpCsYwYjgsN2PfL5Yy8.jpeg",
    intro: "Midi, ceruza vagy harang fazon: egyedi méretre készülő szoknyáink nőiesek, kényelmesek és könnyen kombinálhatók." },
  { slug: "mellenyek", legacy: "melleny", name: "Mellények", title: "Méretre készülő női mellények", group: "ruhazat", tagline: "Egyedi méretre", heroPhoto: "mellenyek-blezer-trio.jpg",
    intro: "Réteges öltözködés stílusosan. Mellényeink egyedi méretre készülnek, és egy egyszerű inget vagy ruhát is különlegessé tesznek." },
  { slug: "alkalmi-ruhak", legacy: "alkalmi", name: "Alkalmi ruhák", title: "Alkalmi ruhák egyedi méretre", group: "ruhazat", tagline: "Egyedi méretre", heroPhoto: "iNWNifDODcXnW2dA6cTeYSwOmWc.jpg",
    intro: "Esküvői vendégség, ballagás, évforduló vagy céges rendezvény: alkalmi darabjainkat közösen tervezzük meg, hogy minden részlet tökéletes legyen. Estélyi és menyasszonyi ruhát nem készítünk." },
  { slug: "aktualis-ruhak", legacy: "aktualis", name: "Aktuális ruhák", title: "Aktuális kollekció", group: "ruhazat", tagline: "Friss darabok", heroPhoto: "WQtmGfSVqR8hXQLZOI29RINwPU.jpg",
    intro: "Hetente érkeznek új darabok: a kollekció válogatott, kész ruhái korlátozott számban, fix méretben érhetők el, ezért érdemes időben jelentkezni." },
  { slug: "kabatok", legacy: "kabat", name: "Kabátok", title: "Női kabátok egyedi méretre", group: "ruhazat", tagline: "Egyedi méretre", heroPhoto: "ajSFhpoOpB5VA8weYFY45oFdoto.jpg",
    intro: "Átmeneti és téli kabátok, amelyek melegen tartanak, és közben a te alakodra szabott, letisztult eleganciát nyújtják." },
  { slug: "ovek", legacy: "ov", name: "Övek", title: "Női övek", group: "kiegeszito", tagline: "Válogatott darabok", heroPhoto: "LO5To9FaturNsCvL8WmPyXIQ3SI.jpg",
    intro: "A részletek teszik teljessé a megjelenést. Válogatott öveink kiemelik a derékvonalat, és egyedi karaktert adnak az öltözéknek." },
  { slug: "salak", legacy: "sal", name: "Sálak", title: "Sálak", group: "kiegeszito", tagline: "Egyedi méretre", heroPhoto: "XQkc4uhz1PjVInXt3ukZQ3WHETY.png",
    intro: "Puha, nemes anyagú sálak, amelyek színt és melegséget visznek a hétköznapokba." },
  { slug: "kendok", legacy: "kendo", name: "Kendők", title: "Selyemkendők és fejkendők", group: "kiegeszito", tagline: "Válogatott darabok", heroPhoto: "ospqHxfiRBYH2iCWMDnK1lJCrQ8.png",
    intro: "Selyemkendők és mintás fejkendők: apró kiegészítők, nagy hatással." },
  { slug: "sajat-markas-taskak", legacy: "sajat-taska", name: "Saját márkás táskák", title: "In My Style táskák", group: "kiegeszito", tagline: "In My Style saját gyártás", heroPhoto: "Rc9rmgvWENqT4ibYFaxvdasbQmk.png",
    intro: "Saját gyártású In My Style táskák: praktikusak, időtállók, és tökéletesen illenek a kollekció darabjaihoz." },
  { slug: "taskak", legacy: "taska", name: "Táskák", title: "Női táskák", group: "kiegeszito", tagline: "Válogatott darabok", heroPhoto: "PqalPo2E1o6IkCRlDFZGPw2KVeU.jpeg",
    intro: "Gondosan válogatott táskák a mindennapokra és az ünnepi alkalmakra." }
];

/* A termékek a data/termekek.json fájlban vannak. Ezt a fájlt a Google Táblázat
   „Weboldal → Weboldal frissítése” menüpontja írja felül, kézzel nem kell szerkeszteni. */
const PRODUCTS = require("../data/termekek.json");

if (typeof module !== "undefined") module.exports = { CATEGORIES, PRODUCTS };
