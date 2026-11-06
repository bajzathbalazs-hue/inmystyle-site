function createInMyStyleForm() {
  var f = FormApp.create('In My Style – kérdőív az új weboldalhoz');
  f.setDescription(
    'Kedves Szilvia!\n\n' +
    'Ez a kérdőív azért készült, hogy az új inmystyle.hu minden mondata pontos legyen, és pontosan úgy mutassa be a szalont, ahogyan Te szeretnéd. ' +
    'A kérdések többsége kattintós, a kitöltés kb. 30–40 perc. Nem kell egyszerre végigmenni rajta.\n\n' +
    'Ahol bizonytalan vagy, hagyd nyugodtan üresen, azt nyitott pontként kezeljük, és később személyesen megbeszéljük. ' +
    'Ahol a lenti válaszok nem illenek, használd az „Egyéb” mezőt.'
  );
  f.setProgressBar(true);
  f.setConfirmationMessage('Köszönjük! A válaszaid alapján elkészítjük az oldal végleges szövegét és felépítését.');
  f.setAllowResponseEdits(true);

  function sec(t, h) { var p = f.addPageBreakItem().setTitle(t); if (h) p.setHelpText(h); }
  var n=0; function N(t){ n++; return n+'. '+t; }
  function mc(t, c, h, o) { var i = f.addMultipleChoiceItem().setTitle(N(t)).setChoiceValues(c); if (h) i.setHelpText(h); if (o) i.showOtherOption(true); return i; }
  function cb(t, c, h, o) { var i = f.addCheckboxItem().setTitle(N(t)).setChoiceValues(c); if (h) i.setHelpText(h); if (o) i.showOtherOption(true); return i; }
  function pa(t, h) { var i = f.addParagraphTextItem().setTitle(N(t)); if (h) i.setHelpText(h); return i; }
  function tx(t, h) { var i = f.addTextItem().setTitle(N(t)); if (h) i.setHelpText(h); return i; }
  function gr(t, r, c, h) { var i = f.addGridItem().setTitle(N(t)).setRows(r).setColumns(c); if (h) i.setHelpText(h); return i; }

  f.addTextItem().setTitle('Kitöltő neve').setRequired(true);

  // 1
  sec('1. A márka és a történet', 'A „Rólunk” rész és a főoldal bemutatkozása ezekből a válaszokból készül.');
  tx('Melyik évben indult az In My Style?');
  pa('Hogyan indult az In My Style? Mi volt az ötlet, a személyes indíttatás?', 'Pár mondat is elég, a szöveget mi formáljuk meg.');
  cb('Milyen szakmai háttérrel rendelkezel?', ['Női szabó / varró végzettség', 'Divattervező végzettség', 'Szabászati, modellező tanfolyam', 'Több év gyakorlat divatcégnél vagy műhelyben', 'Kereskedelmi / értékesítési tapasztalat', 'Saját tapasztalatból, autodidakta módon tanultam'], null, true);
  tx('Hány év szakmai tapasztalatot írhatunk ki az oldalon?', 'Például: „több mint 20 év”. Csak olyat írunk ki, amit Te megerősítesz.');
  mc('Hányan dolgoztok az In My Style-nál?', ['Egyedül dolgozom', '2–3 fő', '4–6 fő', '6 főnél több']);
  mc('Ki varrja a ruhákat?', ['Én magam', 'Én és a munkatársaim a saját műhelyünkben', 'Partner varroda / bedolgozók, az én irányításommal', 'Vegyesen'], null, true);
  mc('Szerepelhet-e a csapat (név, fotó) az oldalon?', ['Igen, mindenki', 'Csak én szerepeljek', 'Senki ne szerepeljen névvel']);
  cb('Melyik három szó írja le leginkább a márkát?', ['Elegáns', 'Nőies', 'Sportos elegancia', 'Kényelmes', 'Időtlen, klasszikus', 'Játékos, színes', 'Prémium', 'Személyes', 'Precíz, minőségi', 'Modern', 'Budapesti', 'Fiatalos'], 'Legfeljebb hármat jelölj meg.', true);
  mc('Hogyan szólítsa meg az oldal a látogatót?', ['Tegezve (ahogy most: „rád szabva”)', 'Magázva', 'Személytelenül']);
  mc('Maradhat-e a „Rád szabva” mint fő szlogen?', ['Igen, nagyon tetszik', 'Igen, de lehet jobb is', 'Nem, mást szeretnék'], null, true);
  pa('Mi az a három dolog, amiben az In My Style jobb vagy más, mint egy átlagos szabóság vagy ruhabolt?');
  pa('Van-e olyan, amit NEM vállalsz, vagy olyan ügyfél, akinek nem ajánlod a szalont?', 'Segít, hogy az oldal ne hozzon olyan érdeklődőt, akinek úgysem tudtok segíteni.');

  // 2
  sec('2. Célcsoport', 'Kinek szól az oldal? Ez dönti el a hangnemet, a képek és a kiemelések sorrendjét.');
  cb('Melyik korosztály a jellemző ügyfélkör?', ['25 év alatt', '25–35 év', '35–45 év', '45–55 év', '55–65 év', '65 év felett']);
  cb('Milyen élethelyzetű ügyfelek jönnek leggyakrabban?', ['Üzletasszonyok, vezetők (irodai, tárgyalási öltözet)', 'Alkalomra készülők (esküvő vendégként, gála, ballagás, évforduló)', 'Akik nehezen találnak a boltban jó méretet', 'Teltebb alkatúak', 'Nagyon vékony vagy alacsony alkatúak', 'Akik a minőséget és az egyediséget keresik', 'Törzsvásárlók, akik az egész ruhatárukat nálad csináltatják', 'Turisták, külföldiek'], null, true);
  cb('Honnan érkeznek most az új ügyfelek?', ['Ajánlás, szájhagyomány', 'Instagram', 'Facebook', 'Google-keresés', 'Google Térkép', 'Arra járnak, a kirakat miatt', 'Rendezvények, divatbemutatók', 'Sajtó, média'], null, true);
  mc('Honnan jönnek az ügyfelek földrajzilag?', ['Szinte csak Budapestről', 'Budapestről és az agglomerációból', 'Az ország egész területéről', 'Külföldről is']);
  mc('Kell-e az oldalnak idegen nyelvű változat?', ['Nem, elég a magyar', 'Igen, angol', 'Igen, angol és német', 'Később, most nem']);
  mc('Készítesz férfiaknak is?', ['Nem, csak nőknek', 'Ritkán, egyedi kérésre', 'Igen, rendszeresen']);

  // 3
  sec('3. Szolgáltatások', 'A „Szolgáltatások” rész és a menü ezekből épül fel.');
  cb('Mely szolgáltatásokat kínálod?', ['Egyedi méretre készítés saját anyagválasztékból', 'Egyedi készítés hozott anyagból', 'Ruhaigazítás, átalakítás', 'Javítás (cipzár, felhajtás, szakadás)', 'Kedvenc ruha lemásolása', 'Alkalmi és estélyi ruha', 'Menyasszonyi vagy örömanya ruha', 'Stílustanácsadás', 'Ruhatár-összeállítás, gardróbrendezés', 'Céges vagy egységes munkaruha', 'Kész (import) ruhák értékesítése', 'Kiegészítők értékesítése', 'Ajándékkártya'], null, true);
  mc('Melyik hozza a legtöbb bevételt?', ['Egyedi méretre készítés', 'Igazítás, átalakítás', 'Kész darabok értékesítése', 'Kiegészítők', 'Nagyjából egyforma'], null, true);
  mc('Mit szeretnél, mi legyen a főoldalon az első számú üzenet?', ['Egyedi méretre készülő ruhák', 'Igazítás, átalakítás', 'A szalon kész kollekciója', 'Stílustanácsadás és személyes figyelem']);
  mc('Vállalsz-e hozott anyagból készítést?', ['Igen, mindig', 'Igen, előzetes egyeztetés után', 'Nem']);
  mc('Honnan származnak az anyagok?', ['Saját, a szalonban választható anyagkészletből', 'Megrendelésre szerzem be', 'Mindkettő', 'Az ügyfél hozza']);
  pa('Milyen anyagokkal dolgozol szívesen? Van-e kedvenc beszállító, származási hely (pl. olasz pamut)?', 'Ha kiírhatjuk, ez erős minőségi érv.');
  mc('Van-e anyagmintatár a szalonban, amiből helyben lehet választani?', ['Igen, nagy választék', 'Igen, kisebb választék', 'Nincs']);

  // 4
  sec('4. A rendelés menete', 'Az oldal „Így készül” része és a gyakori kérdések ezekből a válaszokból készülnek.');
  pa('Írd le saját szavaiddal egy egyedi darab útját az első telefontól az átadásig.', 'Pl. időpontfoglalás → konzultáció és méretvétel → anyagválasztás → próba → átadás.');
  mc('Hány próba szokott lenni egy egyedi darabnál?', ['Egy', 'Kettő', 'Három vagy több', 'Darabtól függ']);
  mc('Mennyi az átlagos átfutási idő egy egyedi darabnál?', ['1 hétnél kevesebb', '1–2 hét', '2–3 hét', '3–4 hét', '4 hétnél több'], 'Az oldalon most „1–2 hét” szerepel, kérlek, erősítsd meg vagy javítsd.');
  mc('Mennyi az átlagos átfutási idő egy igazításnál?', ['Megvárható / aznap', '1–3 nap', '1 hét', '1 hétnél több']);
  mc('Vállalsz-e sürgős munkát?', ['Igen, felár nélkül, ha belefér', 'Igen, felárral', 'Nem']);
  tx('Ha van sürgősségi felár, mennyi?');
  mc('Kell-e előleget fizetni egyedi rendelésnél?', ['Nem', 'Igen, 30%', 'Igen, 50%', 'Igen, más arányban'], null, true);
  mc('Lehetséges-e távoli rendelés (az ügyfél küldi a méreteit, nem jön be)?', ['Igen', 'Csak törzsügyfeleknek, akiknek megvannak a méretei', 'Nem, mindig személyes méretvétel kell']);
  mc('Megmaradnak-e az ügyfél méretei a későbbi rendelésekhez?', ['Igen, minden ügyfélnek van mérettáblája', 'Nem']);
  mc('Ha az átadás után mégis igazítani kell valamit, mi a gyakorlat?', ['Díjtalanul igazítunk', 'Bizonyos időn belül díjtalan', 'Esetenként egyeztetünk'], null, true);

  // 5
  sec('5. Árak és fizetés', 'Az árak megjelenítése sokat számít: az ár nélküli oldalakon több az érdeklődés, de kevésbé célzott. A konkrét ár bizalmat ad, és kiszűri a nem megfelelő ügyfeleket.');
  mc('Hogyan jelenjenek meg az árak az oldalon?', ['Pontos árak minden terméknél', '„-tól” árak kategóriánként (pl. ing 29 900 Ft-tól)', 'Ársávok', 'Ne legyen ár, csak egyeztetés']);
  gr('Körülbelül mennyiből indul egy egyedi darab?',
    ['Ing', 'Ingruha', 'Blézer', 'Nadrág', 'Szoknya', 'Mellény', 'Alkalmi ruha', 'Kabát'],
    ['30 000 Ft alatt', '30–50 000 Ft', '50–80 000 Ft', '80–120 000 Ft', '120 000 Ft felett', 'Nem készítünk ilyet'],
    'Soronként egy oszlopot jelölj. Csak akkor írjuk ki, ha az előző kérdésben ezt választottad.');
  pa('Mennyibe kerülnek a leggyakoribb igazítások?', 'Pl. nadrág felhajtása, derékbőség szűkítése, ujjhossz rövidítése, cipzárcsere.');
  cb('Milyen fizetési módokat fogadsz el a szalonban?', ['Készpénz', 'Bankkártya', 'Apple Pay / Google Pay', 'Átutalás', 'SZÉP-kártya'], null, true);
  mc('Szeretnéd-e, hogy az oldalon online is lehessen fizetni?', ['Nem, csak a szalonban', 'Csak az ajándékkártyáért', 'A kész (import) darabokért is', 'Az egyedi rendelés előlegéért is']);

  // 6
  sec('6. Kollekció és webshop', 'Az oldalon most 15 kategória szerepel. Itt döntjük el, mi maradjon, és hogyan működjön a vásárlás.');
  cb('Mely kategóriák maradjanak az oldalon?', ['Ing', 'Ing ruha', 'Blézer', 'Nadrágok', 'Szoknyák', 'Mellények', 'Alkalmi ruhák', 'Aktuális ruhák', 'Kabátok', 'Övek', 'Sálak', 'Kendők', 'Saját márkás táskák', 'Kitűzők', 'Táskák']);
  tx('Hiányzik-e valamilyen kategória? Ha igen, melyik?');
  mc('Hogyan vásárolhassanak a kész darabokból?', ['Csak érdeklődés, foglalás a szalonban', 'Online foglalás, fizetés átvételkor', 'Teljes webshop kosárral és online fizetéssel'], 'Egyedi méretre készült ruhánál a vásárlót a jogszabály szerint nem illeti meg a 14 napos elállási jog. A kész darabokra viszont online vásárlásnál igen, ezért webshop esetén ÁSZF és visszaküldési folyamat kell.');
  mc('Honnan származnak a kész (import) darabok?', ['Olaszországból', 'Más uniós országból', 'Magyar beszállítótól', 'Vegyesen'], null, true);
  mc('Hány kész darab van egyszerre kínálatban?', ['10 alatt', '10–30', '30–100', '100 felett']);
  mc('Milyen gyakran érkezik új áru?', ['Hetente', 'Havonta', 'Szezononként', 'Ritkábban']);
  mc('Kell-e házhoz szállítás?', ['Nem, csak személyes átvétel', 'Igen, futárral', 'Igen, csomagautomatába is']);
  mc('Van-e rendszeresen kiárusítás, akció?', ['Igen, szezonvégen', 'Igen, folyamatosan', 'Ritkán', 'Nincs']);
  mc('Ki tölti fel majd az új termékeket és fotókat?', ['Én magam', 'Egy munkatárs', 'Balázs / külső segítő', 'Még nem tudom']);

  // 7
  sec('7. Ajándékkártya és kedvezmények');
  cb('Milyen értékű ajándékkártyák legyenek?', ['10 000 Ft', '20 000 Ft', '30 000 Ft', '50 000 Ft', 'Szabadon választható összeg', 'Szolgáltatásra szóló (pl. egy ing elkészítése)'], null, true);
  mc('Meddig érvényes az ajándékkártya?', ['6 hónap', '1 év', '2 év', 'Korlátlan']);
  cb('Hogyan lehet megvásárolni?', ['A szalonban', 'Telefonon / e-mailben megrendelve, átutalással', 'Online, azonnal letölthetően', 'Postán küldve']);
  pa('Mi pontosan a születésnapi ajánlat?', 'Az oldalon most szerepel ilyen ajánlat. Kérlek, írd le a pontos részleteket: kedvezmény mértéke, mikor és hogyan érvényes.');
  cb('Milyen további kedvezmények vannak vagy legyenek?', ['Hírlevél-feliratkozási kedvezmény', 'Első vásárlás kedvezménye', 'Törzsvásárlói kedvezmény', 'Ajánlói kedvezmény (barátnő hoz barátnőt)', 'Nincs és nem is lesz'], null, true);
  tx('Ha van hírlevél-kedvezmény, mennyi legyen?');

  // 8
  sec('8. Szalon és elérhetőség', 'Ellenőrizd, kérlek, az oldalon most szereplő adatokat.');
  mc('Helyes-e a cím: 1027 Budapest, Kapás utca 45.?', ['Igen', 'Nem'], null, true);
  mc('Helyes-e a nyitvatartás: hétfőtől csütörtökig 10–18, pénteken 10–16?', ['Igen', 'Nem'], null, true);
  mc('Hogyan lehet bejönni a szalonba?', ['Bejelentkezés nélkül, nyitvatartási időben', 'Csak előre egyeztetett időpontra', 'Mindkettő, de jobb, ha bejelentkeznek']);
  mc('Helyes-e a telefonszám: +36 20 320 2996?', ['Igen', 'Nem'], null, true);
  cb('Mely csatornákon érhetnek el?', ['Telefon', 'SMS', 'WhatsApp', 'Viber', 'Messenger', 'Instagram üzenet', 'E-mail']);
  mc('Helyes-e az e-mail-cím: hello@inmystyle.hu?', ['Igen', 'Nem'], null, true);
  tx('Instagram, Facebook, TikTok oldalak címei', 'Pl. instagram.com/inmystyle');
  pa('Hogyan lehet megközelíteni a szalont, hol lehet parkolni?', 'Ez a kapcsolat oldalra kerül.');
  mc('Akadálymentes-e a bejutás?', ['Igen', 'Részben', 'Nem']);
  mc('Használjuk-e továbbra is a Calendly online időpontfoglalót?', ['Igen', 'Nem, inkább telefonon', 'Más rendszert használok'], null, true);
  mc('Mennyi ideig tart egy első konzultáció?', ['30 perc', '45 perc', '1 óra', 'Változó']);
  mc('Díjmentes-e az első konzultáció és méretvétel?', ['Igen', 'Nem', 'Megrendelés esetén beszámítjuk']);

  // 9
  sec('9. Bizalom és vélemények', 'Az oldalon csak valódi, engedéllyel közölt vélemény szerepelhet.');
  mc('Van-e Google Cégprofilod (Google Térkép) értékelésekkel?', ['Igen, sok értékeléssel', 'Igen, de kevés az értékelés', 'Nincs', 'Nem tudom']);
  mc('Vannak-e írásos ügyfélvélemények, amelyeket név szerint (vagy keresztnévvel) közölhetünk?', ['Igen, elküldöm őket', 'Gyűjtenem kell', 'Nincsenek']);
  mc('Vannak-e ügyfélfotók, amelyeket engedéllyel közölhetünk?', ['Igen', 'Kérhetek engedélyt', 'Nincsenek']);
  pa('Volt-e sajtómegjelenés, díj, ismert ügyfél, divatbemutató, amit kiemelhetünk?');
  tx('Van-e olyan szám, amit büszkén kiírnál?', 'Pl. elkészült ruhák száma, visszatérő ügyfelek aránya, évek száma.');

  // 10
  sec('10. Fotók, videók és tartalom');
  mc('Szerepelhetsz-e a fotókon az oldalon (Te vagy a márka arca)?', ['Igen, szívesen', 'Igen, de ne túl hangsúlyosan', 'Nem']);
  mc('Van-e friss, profi fotósorozat a ruhákról?', ['Igen, elküldöm', 'Van, de régi', 'Nincs, szükség lenne fotózásra']);
  mc('Készülhet-e fotó a szalonról (belső tér, műhely, anyagok)?', ['Igen', 'Igen, de előbb rendbe kell tenni', 'Nem']);
  mc('Szeretnél-e rövid videót az oldalra (pl. a szalon bemutatása, egy ruha útja)?', ['Igen', 'Később', 'Nem']);
  cb('Milyen témájú cikkek legyenek a blogban?', ['Stílustanácsok', 'Melyik fazon milyen alkatra', 'Anyagismeret', 'Ruhaápolás', 'Szezonális trendek', 'Ügyféltörténetek (előtte–utána)', 'Egy ruha születése', 'Ne legyen blog'], 'A blog segít abban, hogy a Google-keresésben is megtaláljanak.', true);
  mc('Ki írná a cikkeket?', ['Én írom, ti szerkesztitek', 'Ti írjátok az én ötleteim alapján', 'Ne legyen blog']);
  mc('Szeretnél-e hírlevelet küldeni?', ['Igen, havonta', 'Igen, szezononként', 'Csak akciókor', 'Nem']);

  // 11
  sec('11. Cégadatok és jogi háttér', 'Az impresszumhoz, az adatkezelési tájékoztatóhoz és az ÁSZF-hez szükséges adatok.');
  tx('Pontos cégnév', 'Pl. „In My Style Kft.” vagy egyéni vállalkozó neve.');
  tx('Székhely');
  tx('Adószám');
  tx('Cégjegyzékszám vagy nyilvántartási szám');
  mc('Milyen számlázóprogramot használsz?', ['Számlázz.hu', 'Billingo', 'Pénztárgép / nyugtatömb', 'Könyvelő intézi'], null, true);
  mc('Ki birtokolja az inmystyle.hu domaint, és van-e hozzá belépésed?', ['Én, és tudok belépni', 'Én, de nem tudom a belépést', 'A korábbi fejlesztő / ügynökség', 'Nem tudom']);
  mc('Hol működik most a hello@inmystyle.hu e-mail?', ['Google Workspace (Gmail)', 'Microsoft 365 (Outlook)', 'A tárhelyszolgáltatónál (pl. Websupport)', 'Nem tudom'], 'Fontos, mert a domain átállításakor az e-mail nem szakadhat meg.');
  mc('Szeretnéd-e mérni az oldal látogatottságát (pl. Google Analytics)?', ['Igen', 'Nem', 'Nem tudom, döntsetek ti']);
  mc('Futtatsz-e vagy tervezel-e Facebook / Instagram hirdetést?', ['Igen, most is fut', 'Tervezem', 'Nem']);

  // 12
  sec('12. Ízlés és versenytársak');
  pa('Mely weboldalak tetszenek (bármely iparágból)? Kérlek, linkkel együtt.', 'Írd mellé röviden, mi tetszik benne.');
  pa('Kiket tartasz versenytársnak (szalonok, márkák)? Linkkel együtt.');
  mc('Hogyan tetszik a mostani színvilág (fehér, sötétkék, világoskék)?', ['Pont jó', 'Jó, de lehetne melegebb (bézs, krém)', 'Jó, de lehetne több szín', 'Másmilyet szeretnék'], null, true);
  pa('Mi az, amit semmiképp NEM szeretnél látni az oldalon?');

  // 13
  sec('13. Célok');
  mc('Mi az oldal legfontosabb feladata?', ['Minél több időpontfoglalás', 'Ajánlatkérések egyedi darabokra', 'Kész darabok eladása', 'A márka ismertségének növelése']);
  mc('Hány új ügyfelet tudnál havonta fogadni?', ['5 alatt', '5–10', '10–20', '20 felett']);
  mc('Mikorra szeretnéd élesíteni az új oldalt az inmystyle.hu címen?', ['Amint lehet', '1 hónapon belül', '1–3 hónapon belül', 'Nincs határidő']);
  mc('Mennyit tudsz havonta marketingre fordítani?', ['Nincs keret', '50 000 Ft alatt', '50–150 000 Ft', '150 000 Ft felett']);
  mc('Ki kezeli a közösségi médiát?', ['Én', 'Munkatárs', 'Külső segítő', 'Senki, de kellene']);
  pa('Mitől lennél elégedett egy év múlva? Mi lenne a siker?');
  pa('Van-e bármi, amit fontosnak tartasz, de nem kérdeztünk?');

  Logger.log('SZERKESZTÉS: ' + f.getEditUrl());
  Logger.log('KITÖLTÉS: ' + f.getPublishedUrl());
}
