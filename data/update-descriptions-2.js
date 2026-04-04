// One-time script: saves online research descriptions + sources for the remaining 12 hikes
// Run: node data/update-descriptions-2.js

const BASE = 'http://localhost:3001';

async function getToken() {
  const res = await fetch(`${BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'admin', password: 'hik2025' }),
  });
  const { token } = await res.json();
  return token;
}

async function updateHike(token, id, data) {
  const res = await fetch(`${BASE}/api/hikes/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(JSON.stringify(json));
  return json;
}

const SRC_PC = [
  'https://padureacraiului.ro',
  'https://www.bihorinimagini.ro',
  'https://muntii-nostri.ro',
];

const updates = [
  {
    id: '69c1b1ea8a82ea9ea6f24402',
    name: 'Circuitul Pietrele Albe',
    data: {
      description: `## Circuitul Pietrele Albe

Circuit pe creastă în Munții Vlădeasa, pornind de la **Cascada Vălul Miresei** din Răchițele. Traseul urcă pe Valea Seacă (marcaj punct galben) și traversează **creasta Pietrelor Albe** — un masiv calcaros cu pereți verticali albi, doline, peșteri și avene. Punctul culminant este **Vf. Piatra Grăitoare (1.557 m)**, cu priveliști spre Creastă Vlădesei, Trascău și Meseș; pe timp senin se vede și Tatra (100+ km distanță). Descinderea revine prin pădure. Diferență de nivel ~500–650 m.

**Puncte de interes:** Cascada Vălul Miresei (la start), masivul cu pereți calcaroși și 19 trasee de cățărare (până la 30 m), peșteri și avene pe creastă, panoramă 360°.

### 👨‍👩‍👧‍👦 Potrivit pentru familii cu copii

**Vârsta recomandată: 12+ ani.** Creasta este „destul de ascuțită cu pasaje ce necesită atenție sporită" și expusă în locuri. Durata de 6,5 h și denivelarea mare îl fac nepotrivit pentru copii mici.

> ⚠️ **Vipere** active vara pe creastă calcaroasă — nu pășiți și nu vă așezați fără a verifica. Secțiunile expuse pe creastă devin periculoase pe ploaie și vânt. Recomandat GPS/aplicație de navigare.`,
      sources: [
        'https://clubapuseni.ro',
        'https://www.stefancujma.ro',
        'https://muntii-nostri.ro',
      ],
      familyFriendly: false,
      minAgeRecommended: 12,
      highlights: ['Cascada Vălul Miresei', 'creastă calcaroasă', 'pereți verticali', 'avene', 'panoramă Apuseni'],
    },
  },
  {
    id: '69c1b1ea8a82ea9ea6f243f6',
    name: 'Circuitul Versantului Drept Vadu Crisului',
    data: {
      description: `## Circuitul Versantului Drept al Defileului Crișului Repede

Pornind de la Cabana Peștera (lângă gara Vadu Crișului), traseul traversează Crișul Repede pe pod și urcă **versantul drept al defileului** (marcaj punct albastru). Trei puncte panoramice spectaculoase deasupra râului și căii ferate. Denivelare 137 m.

**Puncte de interes:**
- **Peretele Zânelor** — belvedere direct deasupra căii ferate cu căderi verticale sub tine
- **Stanul Stupului** — memorial alpiniști și formare stâncoasă impresionantă
- **Casa Zmăului** (Peștera Dragonului) — portal de 16 m lățime și 4 m înălțime
- **Peștera Roșie, Fugarilor, Podireu I & II, Tăul Fără Fund** (lac carstic)
- **Turnul Vama Sării** — monument medieval din sec. XIII construit în stâncă

### 👨‍👩‍👧‍👦 Potrivit pentru familii cu copii

**Vârsta recomandată: 7+ ani.** Dificultate mică, denivelare accesibilă (137 m), accesibil tot anul. Peșterile și turnul medieval sunt atractive pentru copii. Necesită supraveghere la belvedere (căderi verticale).

> ⚠️ Cale ferată activă în apropiere pe anumite sectoare. Contraindicat pe gheață.`,
      sources: [
        'https://padureacraiului.ro',
        'https://www.bihorinimagini.ro',
        'https://explorandromania.blog',
      ],
      familyFriendly: true,
      minAgeRecommended: 7,
      highlights: ['Peretele Zânelor', 'Casa Zmăului', 'Turnul Vama Sării (sec. XIII)', 'peșteri', 'belvedere defileu'],
    },
  },
  {
    id: '69c1b1ea8a82ea9ea6f243fe',
    name: 'Cabana Pestera Vadu Crisului - Valea Misidului - Pestera Moanei',
    data: {
      description: `## Cabana Peștera Vadu Crișului – Valea Mișidului – Peștera Moanei

Traseu marcat cu **triunghi albastru**, de la Cabana Peștera spre **Cheile Mișidului** — o vale sălbatică și îngustă cu cascade mici și vegetație luxuriantă. Pe drum se trece prin Șuncuiuș și pe lângă mai multe peșteri celebre, ajungând la **Peștera Moanei** cu două intrări care se unesc într-o sală cu domuri de coroziune de 10 m, cascade subterane (3–4 m) și plaje de nisip.

**Puncte de interes:**
- **Peștera Vântului** — cea mai lungă peșteră din România (40+ km), vizite ghidate
- **Peștera Unguru Mare** — portal iconic de 32 m lățime, descoperiri arheologice
- **Castelul Șuncuiuș** — conac de vânătoare istoric în Poiana Frânturii
- **Valle Mișidului** — chei sălbatice cu cascade mici, pâraie și pădure deasă
- **Peștera Moanei** — vizită speototuristică ghidată, cu cascade subterane și plaje de nisip

### 👨‍👩‍👧‍👦 Potrivit pentru familii cu copii

**Vârsta recomandată: 6+ ani.** Descris explicit ca „dificultate redusă, potrivit pentru familii" de padureacraiului.ro. Vizita în peșteră necesită ghid acreditat speotourism — rezervați în avans.

> ⚠️ O pantă abruptă în zona Poienii Frânturii, alunecoasă pe ploaie. Traversări de pârâu în vale. Peștera Moanei: ghid obligatoriu cu echipament de protecție.`,
      sources: SRC_PC,
      familyFriendly: true,
      minAgeRecommended: 6,
      highlights: ['Cheile Mișidului', 'Peștera Vântului', 'Peștera Unguru Mare', 'Peștera Moanei', 'cascade subterane'],
    },
  },
  {
    id: '69c1b1ea8a82ea9ea6f243fc',
    name: 'Pensiunea Gradia - Pestera Moanei - Pensiunea Gradia',
    data: {
      description: `## Pensiunea Gradia – Peștera Moanei – Pensiunea Gradia

Circuit pornind de la **Pensiunea Gradia din Șuncuiuș**, cu acces direct la **Peștera Unguru Mare** (portal de 32 m lățime cu descoperiri arheologice). Traseul traversează Crișul Repede pe un pod suspendat și urcă prin **Cheile Mișidului** — o vale îngustă, sălbatică și luxuriantă, cu 6 traversări de pârâu. Destinația: **Peștera Moanei** (vizită speototuristică ghidată).

**Puncte de interes:**
- **Peștera Unguru Mare** — portal iconic de 32 m, vestigii preistorice
- Pod suspendat peste Crișul Repede
- **Cheile Mișidului** — vale sălbatică, cântec de păsări, cascade și cascadue mici
- **Peștera Moanei** — cascade subterane de 3–4 m, plaje de nisip, domuri de 10 m

### 👨‍👩‍👧‍👦 Potrivit pentru familii cu copii

**Vârsta recomandată: 6+ ani.** Teren relativ ușor, durata accesibilă. Până la peșteră ~90 min; în ritm lejer cu copii ~3–4 h. Traversările de pârâu sunt puncte de atracție pentru copii!

> ⚠️ **Evitați gorja în perioadele ploioase** — pârâul crește rapid și periculos. 6 traversări de pârâu. Peștera Moanei: vizită exclusiv cu ghid.`,
      sources: [
        'https://explorandromania.blog',
        'https://padureacraiului.ro',
        'https://www.bihorinimagini.ro',
      ],
      familyFriendly: true,
      minAgeRecommended: 6,
      highlights: ['Peștera Unguru Mare', 'pod suspendat', 'Cheile Mișidului', 'Peștera Moanei', 'traversări pârâu'],
    },
  },
  {
    id: '69c1b1ea8a82ea9ea6f243fb',
    name: 'Circuitul Valea Boiului',
    data: {
      description: `## Circuitul Valea Boiului

Pornind de la podul peste Crișul Repede lângă Lorău (comuna Bratca), traseul (marcaj **punct roșu**) urcă picturesca **Vale a Boiului** printr-o pădure de molid tânăr. O deturnare de 30 min dus-întors duce la **Cascada Boiului** (7 m, cu două bazine la bază). Traseul continuă la **Pietrele Boiului** — un balcon de stâncă natural suspendat printre bolovani — și urcă la **Vf. Cepleu** cu panoramă asupra văii Crișul Repede și comunei Bratca. Denivelare 433 m.

**Puncte de interes:**
- **Cascada Boiului** — 7 m, cu bazine la bază (deturnare 30 min)
- **Pietrele Boiului / Peștera Fugarilor** — balcon de stâncă și peșteră istorică ce adăpostea odinioară fugari; panoramă excepțională
- **Vf. Cepleu** — priveliște panoramică spre văile Boiului și Crișului Repede

### 👨‍👩‍👧‍👦 Potrivit pentru familii cu copii

**Vârsta recomandată: 8+ ani (circuit complet) / 5+ ani (doar cascada).** Circuitul complet are o coborâre abruptă și stâncoasă. Deturnarea până la cascadă (și înapoi) este accesibilă copiilor mai mici. Semnalizare nouă cu 250 de panouri și 16 săgeți direcționale.

> ⚠️ Coborârea finală abruptă și stâncoasă necesită precauție. Deturnarea la Peștera Fugarilor implică teren abrupt. Fără sursă de apă la Pietrele Boiului.`,
      sources: [
        'https://padureacraiului.ro',
        'https://www.bihorinimagini.ro',
        'https://apuseni.info',
      ],
      familyFriendly: false,
      minAgeRecommended: 8,
      highlights: ['Cascada Boiului', 'Pietrele Boiului', 'Peștera Fugarilor', 'Vf. Cepleu', 'panoramă Crișul Repede'],
    },
  },
  {
    id: '69c1b1ea8a82ea9ea6f243ff',
    name: 'Circuitul Pesterii Ursilor (Valea Sighistelului)',
    data: {
      description: `## Circuitul Peșterii Ursilor (Valea Sighiștelului)

Traseu marcat cu **punct roșu (PR 29)**, circuit care leagă **Peștera Urșilor – Chișcău** cu **Valea Sighiștelului** — o vale cu peste **200 de peșteri** și peisaj carstic sălbatic, parte din Parcul Natural Apuseni. Ruta trece prin pădure și culmi, coboară în sate tradiționale (Măgura, Chișcău) și trece pe lângă peșteri notabile (Peștera Coliboaia cu artă paleolitică, Peștera Drăcoaia, Peștera Măgura).

**Puncte de interes:**
- **Peștera Urșilor** (la punctul de start) — una din cele mai celebre peșteri turistice din România; fosile de urși, galerii iluminate cu stalactite; bilet separat, vizite ghidate
- **Valea Sighiștelului** — vale cu 200+ peșteri, cascade, floră și faună bogate
- **Peștera Coliboaia** — artă paleolitică (nu este accesibilă publicului)
- Sate tradiționale Măgura și Chișcău

### 👨‍👩‍👧‍👦 Potrivit pentru familii cu copii

**Nu este recomandat pentru familii** din cauza marcajelor slabe și dificultăților de navigare raportate. **Recomandare: vizitați Peștera Urșilor ca atracție separată** (bilet, ghid, ușor accesibilă, inclusiv copii) și conduceți spre Valea Sighiștelului separat.

> ⚠️ Marcaje lipsă sau deteriorate pe anumite sectoare — risc de rătăcire. Dificultate medie-dificilă, 5,5–6 h. Nu este recomandat iarna.`,
      sources: [
        'https://www.bihorinimagini.ro',
        'https://parcapuseni.ro',
        'https://www.welcometoromania.ro',
      ],
      familyFriendly: false,
      minAgeRecommended: 14,
      highlights: ['Peștera Urșilor', '200+ peșteri în vale', 'artă paleolitică Coliboaia', 'sate tradiționale', 'Parcul Natural Apuseni'],
    },
  },
  {
    id: '69c1b1ea8a82ea9ea6f243fa',
    name: 'Cabana Pestera Vadu Crisului - Suncuius',
    data: {
      description: `## Cabana Peștera Vadu Crișului – Șuncuiuș

Traseu marcat cu **triunghi roșu**, de la Cabana Peștera (gara Vadu Crișului) spre Șuncuiuș. Urcă prin serpentine abrupte, trece pe la **Terasele** și **Piatra Lupului** — belvedere cu priveliști panoramice asupra defileului Crișului Repede — și coboară prin cătunul Pojorâta și **Valea Izbândișului** până la drumul național din Șuncuiuș. Denivelare +444 m / -456 m.

**Puncte de interes:**
- **Peștera Vadu Crișului** (la start) — peșteră turistică cu râu subteran și lac subteran; formațiuni numite „Globul" și „Albă ca Zăpada și cei șapte pitici"
- **Cascada Vadu Crișului**
- **Terasele / Piatra Lupului** — belvedere panoramic asupra defileului
- **Izvorul Izbândiș** (lângă drum, la final)

### 👨‍👩‍👧‍👦 Potrivit pentru familii cu copii

**Vârsta recomandată: 7+ ani.** Descris explicit ca „dificultate mică, accesibil familiilor" de padureacraiului.ro. Peștera de la start este o atracție excelentă pentru copii (vizite ghidate separate). Urcușul inițial abrupt necesită precauție.

> ⚠️ Primele serpentine sunt abrupte și alunecoase pe ploaie sau gheață. Poteca stâncoasă necesită încălțăminte cu grip.`,
      sources: SRC_PC,
      familyFriendly: true,
      minAgeRecommended: 7,
      highlights: ['Peștera Vadu Crișului', 'Cascada Vadu Crișului', 'Terasele belvedere', 'Piatra Lupului', 'defileu Crișul Repede'],
    },
  },
  {
    id: '69c1b1ea8a82ea9ea6f24400',
    name: 'Galbena - Varful Bihorul - Galbena',
    data: {
      description: `## Gâlbena – Vârful Bihorului – Gâlbena

Traseu marcat cu **bandă albastră**, pornind din satul Gâlbena (Arieșeni) spre **Cucurbăta Mare / Vârful Bihorului (1.849 m)** — cel mai înalt vârf din Munții Apuseni. Urcă prin păduri de molid și pin, traversează pajiști alpine cu ienupăr pitic și ajunge pe creasta alpină. Denivelare ~865–900 m. Extensii opționale: **Piatra Grăitoare**, **Tăul Mare** (lac alpin), **Cascada Vârciorog** (15 m).

**Puncte de interes:**
- **Vârful Bihorului (1.849 m)** — cel mai înalt din Apuseni; panoramă spectaculoasă: întreg lanțul Apusenilor, Valea Arieșului; pe timp clar se vede Stei la 40 km
- **Herghelii de cai sălbatici** pe creastă (mai–august)
- **Fructe de pădure** pe tot traseul: căpșuni, afine, lingurici, mure (vară–toamnă)
- **Tăul Mare** — lac alpin mic înconjurat de ienupăr (opțional)
- **Cascada Vârciorog** (15 m, opțional)

### 👨‍👩‍👧‍👦 Potrivit pentru familii cu copii

**Vârsta recomandată: 10+ ani.** Denivelarea de ~900 m și durata de 6 ore sunt solicitante. Terenul în sine nu are pasaje expuse, dar efortul fizic este mare. Potrivit pentru copii antrenați cu experiență la munte.

> ⚠️ **Vremea se schimbă brusc** la altitudine — un hiker a experimentat grindină și ploaie torențială la vârf; aduceți întotdeauna echipament de ploaie. **Vipere** (*Vipera berus*) în zonele de ienupăr. Căpușe prezente. Unele sectoare de coborâre slab marcate — folosiți drumul forestier.`,
      sources: [
        'https://www.zigzagpeharta.ro',
        'https://aventurainromania.ro',
        'https://muntii-nostri.ro',
      ],
      familyFriendly: false,
      minAgeRecommended: 10,
      highlights: ['cel mai înalt vârf din Apuseni (1.849 m)', 'cai sălbatici', 'fructe de pădure', 'lac alpin', 'panoramă Apuseni'],
    },
  },
  {
    id: '69c1b1ea8a82ea9ea6f243f5',
    name: 'Circuitul galben al defileului Vadu Crisului',
    data: {
      description: `## Circuitul Galben al Defileului Vadu Crișului

Marcaj **punct galben**. Pornind de la Cabana Peștera, traseul face un circuit pe Măgura Crișului, coborând abrupt pe un versant echipat cu **lanțuri de siguranță** în zona Groapei Sohodol, traversând sectoare de pădure și revenind printr-o poiană spre cale ferată. Denivelare cumulativă 307 m.

**Puncte de interes:**
- **Peștera Roșie** — portal de 4 m × 16 m, bun adăpost pe vreme rea
- **Peștera Fugarilor** — sală mare deschisă spre vale; adăpostea odinioară fugari și haiduci
- **Peștera Baia Cocoșului** — galerie descendentă cu concreții
- **Piatra Peșterii** — belvedere spre sectorul central al defileului
- **Stanul Stupului** — formare stâncoasă impresionantă cu memorial
- **Vf. Măgura (567 m)** — panoramă asupra defileului, Șuncuiuș și amonte
- **Cascada Vadu Crișului**

### 👨‍👩‍👧‍👦 Potrivit pentru familii cu copii

**Vârsta recomandată: 8+ ani (pe timp uscat).** Clasificare ușoară, dar **coborârea abruptă cu lanțuri restricționează semnificativ accesul copiilor mici** și este periculoasă pe ploaie. Pe o zi uscată, copiii mai mari care nu au probleme cu înălțimile pot face față.

> ⚠️ **Coborârea cu lanțuri NU este recomandată pe ploaie sau îngheț.** Belvedere cu căderi verticale necesită supraveghere atentă.`,
      sources: [
        'https://padureacraiului.ro',
        'https://www.bihorinimagini.ro',
        'https://muntii-nostri.ro',
      ],
      familyFriendly: false,
      minAgeRecommended: 8,
      highlights: ['3 peșteri', 'coborâre cu lanțuri', 'Vf. Măgura belvedere', 'Cascada Vadu Crișului', 'defileu Crișul Repede'],
    },
  },
  {
    id: '69c1b1ea8a82ea9ea6f243ef',
    name: 'Apateu - Toplita de Rosia',
    data: {
      description: `## Apateu – Toplița de Rosia

Traseu scurt prin zona carstică din Rosia (Munții Pădurea Craiului), ducând spre **Toplița de Rosia** — resurgența finală a sistemului carstic Ciur-Ponor – Toplița de Rosia, cea mai mare strapungere hidrologică din România parcursă de om (7 km pe sub pământ, peșteră de 20+ km).

Zona Văii Rosiei are 4 trasee ușoare dedicate familiilor și începătorilor, accesibile tot anul. Peisajul alternează între chei calcaroase (Cheile Lazuri, Cheile Cuților), pâraie, pajiști și păduri tipice Pădurii Craiului.

**Puncte de interes:**
- **Toplița de Rosia** — izvor carstic spectaculos, capătul vizibil al unuia din cele mai lungi sisteme de peșteri din România
- **Moara de apă din Rosia** — monument tehnic tradițional
- Peisaj carstic tipic: lapiezuri, doline, vegetație bogată

### 👨‍👩‍👧‍👦 Potrivit pentru familii cu copii

**Vârsta recomandată: orice vârstă.** Distanța mică (3,3 km) și dificultatea ușoară îl fac accesibil inclusiv copiilor foarte mici. Toate traseele din Valea Roșiei sunt descrise de padureacraiului.ro ca potrivite pentru familii și începători, accesibile tot anul.

> ℹ️ Traseul nu este documentat pe toate platformele online majore — poate fi un drum local. Contactați Centrul de Vizitare Pădurea Craiului pentru fișa tehnică actualizată.`,
      sources: [
        'https://padureacraiului.ro',
        'https://apuseni.info',
        'https://muntii-nostri.ro',
      ],
      familyFriendly: true,
      toddlerFriendly: true,
      minAgeRecommended: 3,
      highlights: ['Toplița de Rosia (izvor carstic)', 'sistem carstic Ciur-Ponor', 'moara de apă', 'vale carstică'],
    },
  },
  {
    id: '69c1b1ea8a82ea9ea6f243fd',
    name: 'Traseul Bujorul Banatic',
    data: {
      description: `## Traseul Bujorului Banatic (Munții Codru-Moma)

Traseu tematic marcat cu **punct albastru**, pornind din satul **Borz** (pe DJ 709, în cheile Crișului Negru). Urcă ușor pe drum de pietriș în **Valea Hălgășului**, traversând **10 poduri de lemn** peste pârâu (~45 min). Continuă pe versantul drept prin pădure până la o poiană sub **Vf. Pacău (451 m)**, la marginea **rezervației naturale Bujorul Banatic**. Revine pe drum forestier cu priveliști spre Dumbrăvița de Codru. Denivelare moderată.

**Puncte de interes:**
- **10 poduri de lemn** peste pârâul Hălgășului — punct de atracție special pentru copii
- **Rezervația Bujorului Banatic** (*Paeonia officinalis* ssp. banatica) — specie protejată, endemică; vizibilă de pe marginea rezervației (accesul înăuntru este interzis)
- **Cheile Crișului Negru** — peisaj dramatic la accesul spre traseu
- **Păduri de fag și stejar** specifice Munților Codru-Moma

### 👨‍👩‍👧‍👦 Potrivit pentru familii cu copii

**Vârsta recomandată: 8+ ani.** Secțiunea de vale cu cele 10 poduri este captivantă și ușor de parcurs de copii. Secțiunea de pădure de pe versant necesită atenție la marcaje. Tematică botanică (floarea protejată) adaugă valoare educațională.

**Sezon optim: primăvară** (aprilie–mai, când bujorul este înflorit) sau vară.

> ⚠️ Navigare atentă acolo unde traseul se intersectează cu alte poteci în pădure. Fără pericole deosebite semnalate.`,
      sources: [
        'https://www.bihorinimagini.ro',
        'https://bogdanbalaban.ro',
        'https://muntii-nostri.ro',
      ],
      familyFriendly: false,
      minAgeRecommended: 8,
      highlights: ['10 poduri de lemn', 'Bujorul Banatic (specie protejată)', 'Cheile Crișului Negru', 'păduri Codru-Moma'],
    },
  },
  {
    id: '69c1b1ea8a82ea9ea6f243f7',
    name: 'Circuitul Versantului Stang',
    data: {
      description: `## Circuitul Versantului Stâng al Defileului Crișului Repede

Marcaj **punct roșu**. Pornind de la Cabana Peștera, traseul urcă pe **versantul stâng (vest)** al defileului, trecând pe la **Peștera Caprei** și seria de **Peșteri Devenț I, II și III** încastrate în peretele abrupt. Belvedere: **Terasele** și **Piatra Lupului / Peretele Melcului**. Coboară pe serpentine spre Crișul Repede. Denivelare 141–350 m (surse diferite). Ramificație opțională spre Peștera Bătrânului (prelungire 8 km).

**Puncte de interes:**
- **Peștera Caprei** (la start)
- **Peșterile Devenț I, II, III** — serie de peșteri pe versantul abrupt; Devenț III are un portal de 8 m cu descoperiri arheologice preistorice
- **Terasele** — belvedere panoramic asupra defileului
- **Piatra Lupului / Peretele Melcului** — scenerie dramatică de stâncă
- **Peștera și Cascada Vadu Crișului** (la start/final)
- Opțional: ramificație spre **Peștera Bătrânului** (platou carstic, ~8 km total)

### 👨‍👩‍👧‍👦 Potrivit pentru familii cu copii

**Vârsta recomandată: 8+ ani (pe timp uscat).** Distanță și denivelare moderate. Serpentinele de coborâre sunt abrupte — periculos pe ploaie sau gheață. Potrivit pentru copii cu experiență și adult alături.

> ⚠️ Coborârea pe serpentine este abruptă și alunecoasă pe timp umed sau înghețat. Nu necesită echipament tehnic.`,
      sources: [
        'https://padureacraiului.ro',
        'https://www.bihorinimagini.ro',
        'https://muntii-nostri.ro',
      ],
      familyFriendly: false,
      minAgeRecommended: 8,
      highlights: ['Peșterile Devenț (preistoric)', 'Peștera Caprei', 'Terasele belvedere', 'Piatra Lupului', 'defileu Crișul Repede'],
    },
  },
];

async function main() {
  const token = await getToken();
  console.log('Token OK\n');

  for (const { id, name, data } of updates) {
    try {
      await updateHike(token, id, data);
      console.log(`✓ ${name}`);
    } catch (err) {
      console.error(`✗ ${name}: ${err.message}`);
    }
  }

  console.log('\nDone.');
}

main().catch(console.error);
