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

const PRODUCTS = [
  /* —— Saját tervezésű darabok (stúdió- és szalonfotók) —— */
  { slug: "megkotos-dereku-blezer", category: "blezer", name: "Megkötős derekú blézer", type: "egyedi", photos: ["megkotos-blezer-teve.jpg", "megkotos-blezer-vaj.jpg", "megkotos-blezer-feher.jpg", "megkotos-blezer-szinek.jpg", "megkotos-blezer-kituzovel.jpg"], price: "",
    description: "Kétsoros, csúcsos hajtókájú blézer anyagából készült megkötős övvel, amely finoman kiemeli a derékvonalat. Díszzsebkendővel vagy kitűzővel még személyesebb.",
    specs: { Fazon: "Kétsoros, karcsúsított, megkötős övvel", Szín: "A képen fehér, vajszín és teveszín", Méret: "Egyedi méretre szabva" }, featured: true },
  { slug: "megkotos-dereku-ing", category: "ing", name: "Megkötős derekú ing", type: "egyedi", photos: ["megkotos-ing-kek-babun.jpg", "megkotos-ing-kek-viselve.jpg", "megkotos-ing-szinek.jpg"], price: "",
    description: "Elöl megkötős, karcsúsított ing duplahajtású mandzsettával. Szabott nadrággal irodába, farmerrel hétvégére is tökéletes.",
    specs: { Fazon: "Elöl megkötős, karcsúsított", Szín: "A képen fehér, vajszín és világoskék", Méret: "Egyedi méretre szabva" }, featured: true },
  { slug: "vilagoskek-ketsoros-blezer", category: "blezer", name: "Világoskék kétsoros blézer", type: "egyedi", photos: ["vilagoskek-ketsoros-blezer.jpg"], price: "",
    description: "Karcsúsított, kétsoros blézer csúcsos hajtókával és arany színű gombokkal, pasztell világoskékben.",
    specs: { Fazon: "Kétsoros, karcsúsított", Szín: "Világoskék, arany gombokkal", Méret: "Egyedi méretre szabva" }, featured: true },
  { slug: "piros-ketsoros-blezer", category: "blezer", name: "Piros kétsoros blézer", type: "egyedi", photos: ["piros-ketsoros-blezer.jpg"], price: "",
    description: "Élénk piros, kétsoros blézer ezüst színű gombokkal és díszzsebkendővel — magabiztos darab üzleti és ünnepi alkalmakra.",
    specs: { Fazon: "Kétsoros, karcsúsított", Szín: "Piros, ezüst gombokkal", Méret: "Egyedi méretre szabva" } },
  { slug: "sotetkek-ketsoros-blezer", category: "blezer", name: "Sötétkék kétsoros blézer", type: "egyedi", photos: ["sotetkek-ketsoros-blezer.jpg"], price: "",
    description: "Klasszikus sötétkék, kétsoros blézer ezüst színű gombokkal és fehér díszzsebkendővel: a ruhatár egyik legsokoldalúbb darabja.",
    specs: { Fazon: "Kétsoros, karcsúsított", Szín: "Sötétkék, ezüst gombokkal", Méret: "Egyedi méretre szabva" } },
  { slug: "feher-hosszu-melleny", category: "mellenyek", name: "Fehér hosszú kétsoros mellény", type: "egyedi", photos: ["feher-hosszu-melleny.jpg"], price: "",
    description: "Ujjatlan, hosszú, kétsoros mellény csúcsos hajtókával és arany színű gombokkal. Nadrággal kabátként, önállóan ruhaként is viselhető.",
    specs: { Fazon: "Hosszú, ujjatlan, kétsoros", Szín: "Fehér, arany gombokkal", Méret: "Egyedi méretre szabva" } },
  { slug: "pink-megkotos-melleny-nadrag", category: "mellenyek", name: "Pink megkötős mellény és nadrág", type: "egyedi", photos: ["pink-megkotos-melleny-nadrag.jpg"], price: "",
    description: "Kendőgalléros, megkötős mellény fehér paszpóllal és hozzá illő, gombokkal díszített szárú nadrág — nyári kosztüm élénk pinkben.",
    specs: { Fazon: "Megkötős mellény és egyenes szárú nadrág", Szín: "Pink, fehér paszpóllal", Méret: "Egyedi méretre szabva" } },
  { slug: "sotetkek-paszpolozott-ingruha", category: "ing-ruha", name: "Sötétkék paszpólozott ingruha", type: "egyedi", photos: ["sotetkek-paszpolozott-ingruha.jpg"], price: "",
    description: "Midi hosszúságú ingruha fehér paszpóllal szegett gallérral, gombsorral és ujjvégekkel, anyagából készült megkötővel.",
    specs: { Fazon: "Midi ingruha, megkötős", Szín: "Sötétkék, fehér paszpóllal", Méret: "Egyedi méretre szabva" } },
  { slug: "sotetkek-megkotos-ingruha", category: "ing-ruha", name: "Sötétkék megkötős ingruha", type: "egyedi", photos: ["sotetkek-megkotos-ingruha.jpg", "sotetkek-megkotos-ingruha-2.jpg"], price: "",
    description: "Hosszú, harang aljú ingruha elöl megkötős derékkal és kék-fehér csíkos belső gombsorral.",
    specs: { Fazon: "Hosszú, harang aljú, megkötős", Szín: "Sötétkék, csíkos belsővel", Méret: "Egyedi méretre szabva" } },
  { slug: "vilagoskek-paszpolozott-ingruha", category: "ing-ruha", name: "Világoskék paszpólozott ingruha", type: "egyedi", photos: ["vilagoskek-paszpolozott-ingruha.jpg"], price: "",
    description: "Hosszú, háromnegyedes ujjú ingruha fehér paszpóllal és bő megkötővel, lágy esésű anyagból.",
    specs: { Fazon: "Hosszú ingruha, megkötős", Szín: "Világoskék, fehér paszpóllal", Méret: "Egyedi méretre szabva" } },
  { slug: "kek-viragmintas-ingruha", category: "ing-ruha", name: "Kék virágmintás ingruha", type: "egyedi", photos: ["kek-viragmintas-ingruha.jpg"], price: "",
    description: "Finom kék csíkos alapon fehér virágmintás, háromnegyedes ujjú ingruha megkötővel.",
    specs: { Fazon: "Midi ingruha, megkötős", Szín: "Kék-fehér, virágmintás", Méret: "Egyedi méretre szabva" } },
  { slug: "rozsaszin-csikos-ingruha", category: "ing-ruha", name: "Rózsaszín csíkos ingruha", type: "egyedi", photos: ["rozsaszin-csikos-ingruha.jpg"], price: "",
    description: "Bő szoknyarészes, megkötős ingruha rózsaszín-fehér csíkos pamutból, keresztcsíkos aljszegéllyel és zsebekkel.",
    specs: { Fazon: "Midi ingruha, megkötős, zsebes", Szín: "Rózsaszín-fehér csíkos", Méret: "Egyedi méretre szabva" }, featured: true },
  { slug: "feher-megkotos-ingruha", category: "ing-ruha", name: "Fehér megkötős ingruha", type: "egyedi", photos: ["feher-megkotos-ingruha-szalon.jpg"], price: "",
    description: "Rövid ujjú, hosszú fehér ingruha anyagából készült megkötővel — elegáns nyári darab, kalappal és szalmatáskával az igazi.",
    specs: { Fazon: "Hosszú ingruha, rövid ujjal", Szín: "Fehér", Méret: "Egyedi méretre szabva" } },
  { slug: "sotetkek-egyenes-ruha", category: "alkalmi-ruhak", name: "Sötétkék egyenes ruha", type: "egyedi", photos: ["sotetkek-egyenes-ruha.jpg"], price: "",
    description: "Letisztult, rövid ujjú, térdig érő egyenes szabású ruha. Önmagában elegáns, blézerrel üzleti alkalomra is megállja a helyét.",
    specs: { Fazon: "Egyenes szabású, rövid ujjú", Szín: "Sötétkék", Méret: "Egyedi méretre szabva" } },
  { slug: "feher-ing-hasitott-ujjal", category: "ing", name: "Fehér ing hasított ujjal", type: "egyedi", photos: ["feher-ing-hasitott-ujj-utcan.jpg", "feher-ing-hasitott-ujj-falnal.jpg", "feher-ing-hasitott-ujj-mandzsetta.jpg", "feher-ing-hasitott-ujj-reszlet.jpg"], price: "",
    description: "Átlapolt elejű fehér ing hosszan hasított ujjal és gombos mandzsettával: a klasszikus ing játékos, nőies változata.",
    specs: { Fazon: "Átlapolt elejű, hasított ujjú", Szín: "Fehér", Méret: "Egyedi méretre szabva" } },
  { slug: "sotetkek-fodros-ing", category: "ing", name: "Sötétkék fodros ing", type: "egyedi", photos: ["sotetkek-fodros-ing.jpg"], price: "",
    description: "Sötétkék ing gombsor menti, lépcsőzetes fodorral. Fehér nadrággal friss, szoknyával nőies összeállítás.",
    specs: { Fazon: "Fodros elejű", Szín: "Sötétkék", Méret: "Egyedi méretre szabva" } },
  { slug: "klasszikus-feher-ing", category: "ing", name: "Klasszikus fehér ing", type: "egyedi", photos: ["klasszikus-feher-ing-studio.jpg", "6vtbLBV5jJjsl8OIOBQ8mfl2Mw.jpg", "GedtJrI7cNP9rVgxtFwSVIMJyMA.jpeg"], price: "24 900 Ft",
    description: "Időtlen alapdarab puha pamutpopelinből, a te méreteidre szabva.",
    specs: { Anyag: "Pamut popelin", Szín: "Választható", Méret: "Egyedi méretre szabva" } },
  { slug: "csikos-ing", category: "ing", name: "Csíkos ing", type: "import", photos: ["LO5To9FaturNsCvL8WmPyXIQ3SI.jpg"], price: "15 900 Ft",
    description: "Friss, kék-fehér csíkos ing, amely farmerrel és szabott nadrággal is jól kombinálható.",
    specs: { Anyag: "Pamut-keverék", Szín: "Kék-fehér csíkos", Méret: "38-as" }, badge: "Készleten: 5 db" },
  { slug: "rozsaszin-csikos-ing", category: "ing", name: "Rózsaszín csíkos ing", type: "import", photos: ["osByvmBIhz5J4WSCI3nUAh42B8.jpeg"], price: "",
    description: "Nőies, rózsaszín csíkos ing — jelenleg elfogyott, de hasonló darabot egyedi méretre is készítünk.",
    badge: "Elfogyott", sale: true },
  { slug: "kek-wrap-ing-ruha", category: "ing-ruha", name: "Kék wrap ing-ruha", type: "egyedi", photos: ["FQMYqbBj47O2wVG4AmlnpeY4PY.jpg"], price: "",
    description: "Átlapolt fazonú ing-ruha égszínkék árnyalatban, megkötős derékkal." },
  { slug: "sarga-blezer", category: "blezer", name: "Sárga blézer", type: "import", photos: ["25D23UD4e3h1eYoVZM34fYiQps.jpeg"], price: "",
    description: "Napfényes sárga blézer, amely egy egyszerű összeállítást is azonnal feldob." },
  { slug: "kek-oves-blezerruha", category: "blezer", name: "Kék öves blézerruha", type: "egyedi", photos: ["NF5aKztD4zvcFCh6rvT2ToqpNUo.jpg"], price: "",
    description: "Mélykék blézerruha övvel: elegáns, mégis kényelmes viselet egész napra." },
  { slug: "krem-szabott-nadrag", category: "nadragok", name: "Krém szabott nadrág", type: "egyedi", photos: ["jahxr9wPPHcxK0AWCJ8AZaeHQnY.jpeg"], price: "",
    description: "Világos, egyenes szárú nadrág, egyedi méretre szabva." },
  { slug: "midi-szoknya", category: "szoknyak", name: "Midi szoknya", type: "import", photos: ["C8ss4vZRvpCsYwYjgsN2PfL5Yy8.jpeg"], price: "",
    description: "Lágy esésű midi szoknya, amely nappal és este is megállja a helyét." },
  { slug: "sotetkek-melleny", category: "mellenyek", name: "Sötétkék mellény", type: "egyedi", photos: ["sotetkek-melleny-nadrag-kockas-ing.jpg", "ZHXenMDNxDUohhIi2cLGZ0mYT4.jpg"], price: "",
    description: "Sötétkék, karcsúsított, ötgombos mellény a réteges öltözködés kedvelőinek. A képen egyenes szárú nadrággal és rózsaszín kockás inggel." },
  { slug: "elegans-overal", category: "alkalmi-ruhak", name: "Elegáns overál", type: "egyedi", photos: ["iNWNifDODcXnW2dA6cTeYSwOmWc.jpg"], price: "",
    description: "Modern, elegáns overál ünnepi alkalmakra, a te alakodra szabva." },
  { slug: "pink-alkalmi-ruha", category: "alkalmi-ruhak", name: "Pink alkalmi ruha", type: "import", photos: ["WQtmGfSVqR8hXQLZOI29RINwPU.jpg"], price: "",
    description: "Élénk pink alkalmi ruha — kiárusításban, amíg a készlet tart.", badge: "Kiárusítás", sale: true },
  { slug: "unnepi-kollekcio-darab", category: "aktualis-ruhak", name: "Ünnepi kollekció darab", type: "egyedi", photos: ["6es6MykWWyAqSyt10cTe4pX4k.png"], price: "",
    description: "Az aktuális ünnepi kollekció egyik kedvenc darabja." },
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
