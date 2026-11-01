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
  { slug: "mellenyek", legacy: "melleny", name: "Mellények", title: "Méretre készülő női mellények", group: "ruhazat", tagline: "Egyedi méretre", heroPhoto: "ZHXenMDNxDUohhIi2cLGZ0mYT4.jpg",
    intro: "Réteges öltözködés stílusosan. Mellényeink egyedi méretre készülnek, és egy egyszerű inget vagy ruhát is különlegessé tesznek." },
  { slug: "alkalmi-ruhak", legacy: "alkalmi", name: "Alkalmi ruhák", title: "Alkalmi ruhák egyedi méretre", group: "ruhazat", tagline: "Egyedi méretre", heroPhoto: "iNWNifDODcXnW2dA6cTeYSwOmWc.jpg",
    intro: "Ünnepre, rendezvényre, különleges pillanatokra. Alkalmi ruháinkat közösen tervezzük meg, hogy a nagy napon minden tökéletes legyen." },
  { slug: "aktualis-ruhak", legacy: "aktualis", name: "Aktuális ruhák", title: "Aktuális kollekció", group: "ruhazat", tagline: "Friss darabok", heroPhoto: "WQtmGfSVqR8hXQLZOI29RINwPU.jpg",
    intro: "Az aktuális kollekció friss darabjai korlátozott számban, fix méretben érhetők el — érdemes időben jelentkezni." },
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
  { slug: "kituzok", legacy: "kituzo", name: "Kitűzők", title: "In My Style kitűzők", group: "kiegeszito", tagline: "In My Style saját gyártás", heroPhoto: "yLdX1XTK2PFRY9EbeHk9tffDa4U.jpeg",
    intro: "Saját tervezésű kitűzők, amelyekkel egy egyszerű blézer vagy kabát is személyes hangot kap." },
  { slug: "taskak", legacy: "taska", name: "Táskák", title: "Női táskák", group: "kiegeszito", tagline: "Válogatott darabok", heroPhoto: "PqalPo2E1o6IkCRlDFZGPw2KVeU.jpeg",
    intro: "Gondosan válogatott táskák a mindennapokra és az ünnepi alkalmakra." }
];

const PRODUCTS = [
  { slug: "klasszikus-feher-ing", category: "ing", name: "Klasszikus fehér ing", type: "egyedi", photos: ["6vtbLBV5jJjsl8OIOBQ8mfl2Mw.jpg", "GedtJrI7cNP9rVgxtFwSVIMJyMA.jpeg"], price: "24 900 Ft",
    description: "Időtlen alapdarab puha pamutpopelinből, a te méreteidre szabva.",
    specs: { Anyag: "Pamut popelin", Szín: "Választható", Méret: "Egyedi méretre szabva" }, featured: true },
  { slug: "csikos-ing", category: "ing", name: "Csíkos ing", type: "import", photos: ["LO5To9FaturNsCvL8WmPyXIQ3SI.jpg"], price: "15 900 Ft",
    description: "Friss, kék-fehér csíkos ing, amely farmerrel és szabott nadrággal is jól kombinálható.",
    specs: { Anyag: "Pamut-keverék", Szín: "Kék-fehér csíkos", Méret: "38-as" }, badge: "Készleten: 5 db" },
  { slug: "rozsaszin-csikos-ing", category: "ing", name: "Rózsaszín csíkos ing", type: "import", photos: ["osByvmBIhz5J4WSCI3nUAh42B8.jpeg"], price: "",
    description: "Nőies, rózsaszín csíkos ing — jelenleg elfogyott, de hasonló darabot egyedi méretre is készítünk.",
    badge: "Elfogyott", sale: true },
  { slug: "kek-wrap-ing-ruha", category: "ing-ruha", name: "Kék wrap ing-ruha", type: "egyedi", photos: ["FQMYqbBj47O2wVG4AmlnpeY4PY.jpg"], price: "",
    description: "Átlapolt fazonú ing-ruha égszínkék árnyalatban, megkötős derékkal.", featured: true },
  { slug: "sarga-blezer", category: "blezer", name: "Sárga blézer", type: "import", photos: ["25D23UD4e3h1eYoVZM34fYiQps.jpeg"], price: "",
    description: "Napfényes sárga blézer, amely egy egyszerű összeállítást is azonnal feldob." },
  { slug: "kek-oves-blezerruha", category: "blezer", name: "Kék öves blézerruha", type: "egyedi", photos: ["NF5aKztD4zvcFCh6rvT2ToqpNUo.jpg"], price: "",
    description: "Mélykék blézerruha övvel: elegáns, mégis kényelmes viselet egész napra.", featured: true },
  { slug: "krem-szabott-nadrag", category: "nadragok", name: "Krém szabott nadrág", type: "egyedi", photos: ["jahxr9wPPHcxK0AWCJ8AZaeHQnY.jpeg"], price: "",
    description: "Világos, egyenes szárú nadrág, egyedi méretre szabva." },
  { slug: "midi-szoknya", category: "szoknyak", name: "Midi szoknya", type: "import", photos: ["C8ss4vZRvpCsYwYjgsN2PfL5Yy8.jpeg"], price: "",
    description: "Lágy esésű midi szoknya, amely nappal és este is megállja a helyét." },
  { slug: "sotetkek-melleny", category: "mellenyek", name: "Sötétkék mellény", type: "egyedi", photos: ["ZHXenMDNxDUohhIi2cLGZ0mYT4.jpg"], price: "",
    description: "Sötétkék, karcsúsított mellény a réteges öltözködés kedvelőinek." },
  { slug: "estelyi-overal", category: "alkalmi-ruhak", name: "Estélyi overál", type: "egyedi", photos: ["iNWNifDODcXnW2dA6cTeYSwOmWc.jpg"], price: "",
    description: "Modern estélyi overál ünnepi alkalmakra, a te alakodra szabva." },
  { slug: "pink-alkalmi-ruha", category: "alkalmi-ruhak", name: "Pink alkalmi ruha", type: "import", photos: ["WQtmGfSVqR8hXQLZOI29RINwPU.jpg"], price: "",
    description: "Élénk pink alkalmi ruha — kiárusításban, amíg a készlet tart.", badge: "Kiárusítás", sale: true },
  { slug: "unnepi-kollekcio-darab", category: "aktualis-ruhak", name: "Ünnepi kollekció darab", type: "egyedi", photos: ["6es6MykWWyAqSyt10cTe4pX4k.png"], price: "",
    description: "Az aktuális ünnepi kollekció egyik kedvenc darabja.", featured: true },
  { slug: "bordzseki", category: "kabatok", name: "Bőrdzseki", type: "import", photos: ["oz2RsOeio9NejMmtC293KH1oc.png"], price: "",
    description: "Klasszikus bőrdzseki, amely minden szezonban stílusos társ." },
  { slug: "barna-borov", category: "ovek", name: "Barna bőröv", type: "import", photos: ["LO5To9FaturNsCvL8WmPyXIQ3SI.jpg"], price: "",
    description: "Barna bőröv, amely kiemeli a derékvonalat." },
  { slug: "selyemkendo", category: "salak", name: "Selyemkendő", type: "egyedi", photos: ["XQkc4uhz1PjVInXt3ukZQ3WHETY.png"], price: "",
    description: "Puha selyemkendő, egyedi mintával." },
  { slug: "mintas-fejkendo", category: "kendok", name: "Mintás fejkendő", type: "import", photos: ["XQkc4uhz1PjVInXt3ukZQ3WHETY.png"], price: "",
    description: "Mintás fejkendő, amely nyári összeállításokhoz is tökéletes." },
  { slug: "in-my-style-vaszontaska", category: "sajat-markas-taskak", name: "In My Style vászontáska", type: "egyedi", photos: ["Rc9rmgvWENqT4ibYFaxvdasbQmk.png"], price: "",
    description: "Strapabíró, saját márkás vászontáska a mindennapokra." },
  { slug: "elegans-keztaska", category: "taskak", name: "Elegáns kéztáska", type: "import", photos: ["Rc9rmgvWENqT4ibYFaxvdasbQmk.png"], price: "",
    description: "Letisztult kéztáska ünnepi és hétköznapi alkalmakra." }
];

if (typeof module !== "undefined") module.exports = { CATEGORIES, PRODUCTS };
