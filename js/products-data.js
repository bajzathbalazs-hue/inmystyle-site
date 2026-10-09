/* In My Style — kategória és termék adatok.
   Új termék felvétele: másolj egy meglévő objektumot a megfelelő kategória "items" tömbjében,
   és írd át a mezőket. Ha nincs ár/méret, hagyd üresen — ilyenkor "Hívj a részletekért" jelenik meg.
   Fotó: tedd a fájlt az assets/photos/ mappába, és írd be a nevét a "photo" mezőbe. */

const CATEGORY_ICONS = {
  list: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="18" x2="14" y2="18"/></svg>',
  diamond: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="6" y="6" width="12" height="12" rx="2" transform="rotate(45 12 12)"/></svg>',
  briefcase: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="7" width="18" height="12" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>',
  check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="12" r="9"/><path d="M8 12.5l2.5 2.5L16 9.5"/></svg>',
  bookmark: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M6 4h12v16l-6-4-6 4V4z"/></svg>',
  heart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M12 20s-7-4.35-9.5-9C.9 7.5 3 4 6.5 4 9 4 11 6 12 7.5 13 6 15 4 17.5 4 21 4 23.1 7.5 21.5 11 19 15.65 12 20 12 20z"/></svg>',
  clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/></svg>',
  box: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="4" y="8" width="16" height="12" rx="1.5"/><path d="M4 8l2.5-4h11L20 8"/></svg>',
  bag: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M6 8h12l1 12H5L6 8z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/></svg>',
  shield: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z"/></svg>'
};

const CATEGORIES = [
  { slug: "ing", name: "Ing", group: "ruhazat", icon: "list", tagline: "Egyedi méretre" },
  { slug: "ingruha", name: "Ing ruha", group: "ruhazat", icon: "diamond", tagline: "Egyedi méretre" },
  { slug: "blezer", name: "Blézer", group: "ruhazat", icon: "briefcase", tagline: "Egyedi méretre" },
  { slug: "nadrag", name: "Nadrágok", group: "ruhazat", icon: "check", tagline: "Egyedi méretre" },
  { slug: "szoknya", name: "Szoknyák", group: "ruhazat", icon: "diamond", tagline: "Egyedi méretre" },
  { slug: "melleny", name: "Mellények", group: "ruhazat", icon: "bookmark", tagline: "Egyedi méretre" },
  { slug: "alkalmi", name: "Alkalmi ruhák", group: "ruhazat", icon: "shield", tagline: "Egyedi méretre" },
  { slug: "aktualis", name: "Aktuális ruhák", group: "ruhazat", icon: "clock", tagline: "Friss darabok" },
  { slug: "kabat", name: "Kabátok", group: "ruhazat", icon: "box", tagline: "Egyedi méretre" },
  { slug: "ov", name: "Övek", group: "kiegeszito", icon: "bookmark", tagline: "Válogatott darabok" },
  { slug: "sal", name: "Sálak", group: "kiegeszito", icon: "heart", tagline: "Egyedi méretre" },
  { slug: "kendo", name: "Kendők", group: "kiegeszito", icon: "diamond", tagline: "Válogatott darabok" },
  { slug: "sajat-taska", name: "Saját márkás táskák", group: "kiegeszito", icon: "bag", tagline: "In My Style saját gyártás" },
  { slug: "kituzo", name: "Kitűzők", group: "kiegeszito", icon: "check", tagline: "In My Style saját gyártás" },
  { slug: "taska", name: "Táskák", group: "kiegeszito", icon: "bag", tagline: "Válogatott darabok" }
];

/* Minden termék mezői:
   category: a fenti slug egyike
   name: cím
   type: "egyedi" | "import"
   photo: fájlnév az assets/photos/ mappából
   price: pl. "24 900 Ft" — hagyd üresen ("") ha nincs ár, ilyenkor "Hívj a részletekért" gomb jelenik meg
   specs: { Anyag: "...", Szín: "...", Méret: "..." } — bármelyik elhagyható
   badge: pl. "Készleten: 5 db" / "Elfogyott" — elhagyható
   sale: true, ha az Akció oldalon is meg kell jelennie */
const PRODUCTS = [
  { category: "ing", name: "Klasszikus fehér ing", type: "egyedi", photo: "6vtbLBV5jJjsl8OIOBQ8mfl2Mw.jpg", price: "24 900 Ft", specs: { Anyag: "Pamut popelin", Szín: "Választható", Méret: "Egyedi méretre szabva" } },
  { category: "ing", name: "Csíkos ing", type: "import", photo: "LO5To9FaturNsCvL8WmPyXIQ3SI.jpg", price: "15 900 Ft", specs: { Anyag: "Pamut-keverék", Szín: "Kék-fehér csíkos", Méret: "38-as" }, badge: "Készleten: 5 db" },
  { category: "ing", name: "Rózsaszín csíkos ing", type: "import", photo: "osByvmBIhz5J4WSCI3nUAh42B8.jpeg", price: "", sale: true, badge: "Elfogyott" },
  { category: "ingruha", name: "Kék wrap ing-ruha", type: "egyedi", photo: "FQMYqbBj47O2wVG4AmlnpeY4PY.jpg", price: "" },
  { category: "blezer", name: "Sárga blézer", type: "import", photo: "25D23UD4e3h1eYoVZM34fYiQps.jpeg", price: "" },
  { category: "blezer", name: "Kék öves blézerruha", type: "egyedi", photo: "NF5aKztD4zvcFCh6rvT2ToqpNUo.jpg", price: "" },
  { category: "nadrag", name: "Krém szabott nadrág", type: "egyedi", photo: "6vtbLBV5jJjsl8OIOBQ8mfl2Mw.jpg", price: "" },
  { category: "szoknya", name: "Midi szoknya", type: "import", photo: "gAkLhMVLrb8Lomuc2uiJ202qjcY.jpg", price: "" },
  { category: "melleny", name: "Sötétkék mellény", type: "egyedi", photo: "4LChjMZUrFVyUKIp8k0C6eiIM.jpg", price: "" },
  { category: "alkalmi", name: "Estélyi overál", type: "egyedi", photo: "iNWNifDODcXnW2dA6cTeYSwOmWc.jpg", price: "" },
  { category: "alkalmi", name: "Pink alkalmi ruha", type: "import", photo: "WQtmGfSVqR8hXQLZOI29RINwPU.jpg", price: "", sale: true, badge: "Kiárusítás" },
  { category: "aktualis", name: "Ünnepi kollekció darab", type: "egyedi", photo: "C8ss4vZRvpCsYwYjgsN2PfL5Yy8.jpeg", price: "" },
  { category: "kabat", name: "Bőrdzseki", type: "import", photo: "R0qajIH6IqGeP0KKQFttLc6NfI.jpg", price: "" },
  { category: "ov", name: "Barna bőröv", type: "import", photo: "LO5To9FaturNsCvL8WmPyXIQ3SI.jpg", price: "" },
  { category: "sal", name: "Selyemkendő", type: "egyedi", photo: "XQkc4uhz1PjVInXt3ukZQ3WHETY.png", price: "" },
  { category: "kendo", name: "Mintás fejkendő", type: "import", photo: "XQkc4uhz1PjVInXt3ukZQ3WHETY.png", price: "" },
  { category: "sajat-taska", name: "In My Style vászontáska", type: "egyedi", photo: "Rc9rmgvWENqT4ibYFaxvdasbQmk.png", price: "" },
  { category: "taska", name: "Elegáns kéztáska", type: "import", photo: "Rc9rmgvWENqT4ibYFaxvdasbQmk.png", price: "" }
];
