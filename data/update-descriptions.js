// One-time script: saves online research descriptions + sources to hike records
// Run: node data/update-descriptions.js

// Uses built-in fetch (Node 18+)

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

// Sources found across 3 domains
const SOURCES_PADUREA_CRAIULUI = [
  'https://padureacraiului.ro',
  'https://www.bihorinimagini.ro',
  'https://muntii-nostri.ro',
];
const SOURCES_VLADEASA = [
  'https://ro.thechillinbear.com',
  'https://www.bihorinimagini.ro',
  'https://muntii-nostri.ro',
];

const updates = [
  {
    id: '69c1b1ea8a82ea9ea6f243ee',
    name: 'Circuitul Cheile Cutii',
    data: {
      description: `## Circuitul Cheile Cutii

Un circuit scurt și spectaculos prin una dintre cele mai dramatice chei din Munții Pădurea Craiului. Pereții de calcar se înalță până la 100 m (Piatra Lată), iar traseul trece pe lângă aproximativ **50 de peșteri** din sector, inclusiv Peștera Cântăreților, Peștera Vacilor și Peștera Cailor.

Un pod natural format prin prăbușirea tavanului unei peșteri este unul dintre cele mai impresionante puncte de pe traseu. Vârful circuitului este platoul Stanul Gurguiat (80 m), considerat unul dintre cele mai frumoase puncte panoramice din munți.

### 👨‍👩‍👧‍👦 Potrivit pentru familii cu copii

**Vârsta recomandată: 4+ ani.** Distanța mică (3,1 km) și diferența de nivel accesibilă fac traseul ideal chiar și pentru copii mici. Peșterile vizibile de pe traseu și podul natural sunt atractive pentru copii curioși. Recomandat de padureacraiului.ro ca traseu de familie.

> ⚠️ Atenție la suprafețele alunecoase pe timp umed sau înghețat, în special pe urcușul de pe malul stâng al văii. Via ferrata din zonă (grad B) nu este pentru familii fără echipament specific.`,
      sources: SOURCES_PADUREA_CRAIULUI,
      familyFriendly: true,
      minAgeRecommended: 4,
      highlights: ['chei calcaroase', 'pod natural', 'peșteri', 'panoramă'],
    },
  },
  {
    id: '69c1b1ea8a82ea9ea6f24401',
    name: 'Vadu Crisului - Pestera Batranului',
    data: {
      description: `## Vadu Crisului – Peștera Bătrânului

Traseu lung pe platoul carstic Câmpul Fericirii, trecând prin mai multe intrări de peșteri: Peștera Caprei, Peștera Devent I, II și III (Devent III are un portal de 8 m cu vestigii arheologice preistorice). Destinația finală este **Peștera Bătrânului**, al cărei râu subteran parcurge 4 km înainte de a ieși la suprafață la Vadu Crișului.

Belvederea Terase oferă priveliști panoramice asupra platoului. Terenul karst include lapiezuri, doline și depresiuni tipice Pădurii Craiului.

### 👨‍👩‍👧‍👦 Potrivit pentru familii cu copii

**Vârsta recomandată: 12+ ani.** Deși traseul în sine nu are pasaje tehnice dificile, distanța dus-întors (~15 km) și 7 ore de mers sunt epuizante pentru copii mici. Peștera Bătrânului **nu poate fi intrată** fără echipament speologic.

> ⚠️ Platoul este dezorientant la căderea întunericului — planificați întoarcerea din timp. Încălțăminte cu gripă solidă pe calcar este esențială.`,
      sources: SOURCES_PADUREA_CRAIULUI,
      familyFriendly: false,
      minAgeRecommended: 12,
      highlights: ['platou carstic', 'peșteri', 'Peștera Bătrânului', 'lapiezuri', 'doline'],
    },
  },
  {
    id: '69c1b1ea8a82ea9ea6f243f8',
    name: 'Suncuius - Pestera Batranului - Suncuius',
    data: {
      description: `## Suncuius – Peștera Bătrânului – Suncuius

Circuit pornind din satul Șuncuiuș, care urcă pe platoul carstic Imașul Bătrânului cu doline, formațiuni de calcar și peisaj pastoral tradițional (turme vizibile în sezon). Pe drum: **Izvorul Izbândiș** — o resurgenă carstică spectaculoasă care țâșnește la baza unui versant abrupt — și intrarea Peșterii Izbândiș (una dintre cele mai inaccesibile peșteri din România).

Traseul mai include 4 peșteri mici, 2 puncte panoramice și peisaje cu case tradiționale și turme pe pajiști.

### 👨‍👩‍👧‍👦 Potrivit pentru familii cu copii

**Vârsta recomandată: 8+ ani.** 8 km cu 316 m diferență de nivel în 4 ore este o zi de drumeție rezonabilă pentru copii cu experiență. Accesul din Șuncuiuș (pe DN1 și linie de cale ferată) este facil. Peștera Bătrânului nu poate fi intrată.

> ⚠️ Planificați cu 4 ore înainte de înnoptare. Peștera Izbândiș nu este accesibilă publicului fără ghid speolog.`,
      sources: SOURCES_PADUREA_CRAIULUI,
      familyFriendly: false,
      minAgeRecommended: 8,
      highlights: ['Izvorul Izbândiș', 'platou carstic', 'doline', 'peisaj pastoral', 'peșteri'],
    },
  },
  {
    id: '69c1b1ea8a82ea9ea6f243f1',
    name: 'Pestera cu Cristale Farcu - Izbucul Rosiei',
    data: {
      description: `## Peștera cu Cristale Farcu – Izbucul Rosiei

Patru atracții naturale unice într-un singur traseu compact:

1. **Peștera cu Cristale din Mina Farcu** — unică în România, cu formațiuni de cristale minerale într-un tunel minier amenajat ca peșteră turistică.
2. **Cascada Bina Mirghii** (10 m) — impresionantă după ploaie.
3. **Peștera Gruiet** — 450 m lungime, portal de 8 m, stalactite și coloane de calcit vizibile din exterior.
4. **Izbucul Rosiei** — una dintre cele mai mari resurgenți carstice din România, unde apa izbucnește din pământ înconjurată de bolovani acoperiți cu mușchi și pereți calcaroși abrupți.

### 👨‍👩‍👧‍👦 Potrivit pentru familii cu copii

**Vârsta recomandată: 5+ ani.** Explicit recomandat de padureacraiului.ro pentru familii. Teren ușor pe pajiști și poteci de vale. Peștera turistică Farcu este accesibilă copiilor. Traseu de 4,1 km cu 110 m diferență de nivel, potrivit în ~2 ore.

> ⚠️ Nivelul apei în Peștera Gruiet poate crește rapid în caz de ploaie — nu intrați în peșteră pe ploaie sau după ploaie abundentă. Peștera Farcu necesită rezervare și taxă de intrare.`,
      sources: SOURCES_PADUREA_CRAIULUI,
      familyFriendly: true,
      minAgeRecommended: 5,
      highlights: ['peșteră cu cristale', 'cascadă', 'izbuc carstic', 'peșteră'],
    },
  },
  {
    id: '69c1b1ea8a82ea9ea6f243f3',
    name: 'Circuitul Cheile Lazuri',
    data: {
      description: `## Circuitul Cheile Lazurilor

Cheile Lazurilor sunt printre cele mai impresionante chei din Pădurea Craiului — pereți verticali între **100 și 250 de metri** înălțime pe o lungime de 5 km. Circuitul pleacă din parcarea Peșterii cu Cristale Farcu.

Puncte cheie: Vârful Stânul Cârnului cu o balustradă de lemn suspendată pe buza stâncii, coborâre prin pădure deasă până pe fundul cheilor, mers parțial pe digul unui vechi drum feroviar, vaduri prin albie (apă până la 30 cm). Cascadă de 8 m, intrarea Peșterii Roșii (portal de 30 m) și Peștera Albă completează circuitul.

### 👨‍👩‍👧‍👦 Potrivit pentru familii cu copii

**Vârsta recomandată: 10+ ani.** Vadurile și terenul tehnic, combinate cu contraindicarea pe vreme rece/umedă/înghețată, necesită prudență. Nu este ideal pentru copii foarte mici.

> ⚠️ Contraindicat iarna și pe vreme rece/umedă din cauza aluneciozității și vadurilor. Apă poate ajunge la 30 cm în chei. Încălțăminte cu gripă solidă este esențială.`,
      sources: SOURCES_PADUREA_CRAIULUI,
      familyFriendly: false,
      minAgeRecommended: 10,
      highlights: ['chei', 'pereți de 250m', 'cascadă', 'peșteri', 'balustradă pe stâncă'],
    },
  },
  {
    id: '69c1b1ea8a82ea9ea6f243f0',
    name: 'Circuitul Valea Dalbii',
    data: {
      description: `## Circuitul Valea Dalbii

Traseul scurt al Văii Dalbii are ca atracție principală **Șura Ușorilor** — un vast sistem carstic prăbușit care a creat turnuri naturale și poduri de piatră dramatice, comparate uneori cu Castelul din Carpați al lui Jules Verne.

Circuitul urmează un pârâu clar prin versanți împăduriti, trece prin poieni și gospodării izolate, cu un ocol de 100 m spre cascade la confluența cu Valea Izvoarelor și un alt ocol de 100 m spre priveliștea podurilor naturale și a Depresiunii Beiuș.

### 👨‍👩‍👧‍👦 Potrivit pentru familii cu copii

**Vârsta recomandată: 3+ ani.** Explicit recomandat de padureacraiului.ro pentru „plimbări în familie pe jos sau cu bicicleta, sau pentru picnicuri în natură." Durata de 1,2 h și denivelarea minimă îl fac cel mai accesibil traseu pentru copii foarte mici.

> ⚠️ Cariera de calcar din zona de parcare — feriți copiii de marginea carierei.`,
      sources: SOURCES_PADUREA_CRAIULUI,
      familyFriendly: true,
      toddlerFriendly: true,
      minAgeRecommended: 3,
      highlights: ['Șura Ușorilor', 'poduri naturale', 'cascade', 'pârâu', 'depresiune Beiuș'],
    },
  },
  {
    id: '69c1b1ea8a82ea9ea6f243f2',
    name: 'Pestera Stracos',
    data: {
      description: `## Peștera Stracos (Drăgești, Bihor)

Peștera Stracos are **788 m lungime** cu două intrări (un rar galerie "de trecere"), recent amenajată turistic cu fonduri europene. Secțiunea turistică de 150 m are iluminat solar autonom și senzori de mediu (CO₂, temperatură, umiditate).

Circuitul turistic de ~5 km din jurul peșterii include: **pod suspendat**, două puncte panoramice, traseu Via Ferrata de dificultate mică și zone de odihnă. Peștera este situată în calcar tortonizian pe Dealul Corbului (318,7 m), la ~30 km de Oradea.

### 👨‍👩‍👧‍👦 Potrivit pentru familii cu copii

**Vârsta recomandată: 5+ ani.** Taxa de intrare: 15 lei copii peste 5 ani, gratuit sub 5 ani. Infrastructura circuitului a fost concepută cu familiile în minte — podul suspendat și panoramele sunt atractive pentru copii.

> ⚠️ Vizita în peșteră necesită rezervare telefonică (0259/324545). Secțiunea activă a peșterii (cu apă și treceri pe burtă) este exclusiv pentru speologi experimentați, nu face parte din circuitul turistic.`,
      sources: [
        'https://www.crisana.ro',
        'https://padureacraiului.ro',
        'https://muntii-nostri.ro',
      ],
      familyFriendly: true,
      minAgeRecommended: 5,
      highlights: ['peșteră amenajată', 'pod suspendat', 'panoramă', 'via ferrata ușoară', 'iluminat solar'],
    },
  },
  {
    id: '69c1b1ea8a82ea9ea6f243f4',
    name: 'Rachitele Varful Lespezi',
    data: {
      description: `## Rachitele – Vârful Lespezi (Munții Vlădeasa)

Traseu popular în Munții Vlădeasa, care combină o cascadă spectaculoasă cu un vârf modest cu priveliști panoramice. Pornind din Răchițele (~28 km de Huedin), traseul trece prin **Cheile Văii Stânciului** (pereți verticali formați de eroziunea râului), vizitează **Cascada Valul Miresei** (~30 m pe trei trepte — una dintre cele mai fotografiate cascade din Apuseni), ajunge la cabana Salvamont Răchițele, apoi urcă la **Vârful Lespezi** (1.222–1.340 m) cu panoramă 360° spre Creastă Vlădesei, Piatra Arsă și văile din jur.

### 👨‍👩‍👧‍👦 Potrivit pentru familii cu copii

**Vârsta recomandată: 6+ ani.** Descris ca „recomandat pentru începători, copii și prietenii cu patru labe." Poteca principală de urcare este un drum forestier și un drumeag ușor fără pasaje expuse. Durata totală ~2–3 ore.

> ⚠️ Parcați doar în locurile desemnate (camioane forestiere frecvente pe drum). Încălțăminte cu gripă pe urcușul final (rădăcini, frunze). **Nu folosiți coborârea pe Valea Stânciului cu copii mici** — un recenzent o descrie ca periculos de abruptă.`,
      sources: SOURCES_VLADEASA,
      familyFriendly: true,
      minAgeRecommended: 6,
      highlights: ['Cascada Valul Miresei', 'chei', 'cabană Salvamont', 'panoramă 360°', 'Vlădeasa'],
    },
  },
  {
    id: '69d0b8fd1a2e84cb11e3fb16',
    name: 'Vadu Crisului - Cabana Pestera Vadu Crisului',
    data: {
      description: `## Vadu Crișului – Cabana Peștera Vadu Crișului

Traseul de acces prin **Defileul Crișului Repede**, pe traseul vechii căi ferate, paralel cu râul. Este cel mai scurt și mai accesibil drum spre **Peștera Vadu Crișului** — una dintre cele mai vechi peșteri turistice din România (amenajată de la începutul sec. XX), cu râu subteran, formațiuni numite „Globul", „Mormântul lui Mohammed", „Albă ca Zăpada și cei șapte pitici" și lac subteran.

Defileul în sine este scenic, cu râul tăind prin pereți calcaroși abrupți. O cascadă este vizibilă lângă startul traseului. Panouri educative tematice pe tot parcursul defileului.

### 👨‍👩‍👧‍👦 Potrivit pentru familii cu copii

**Vârsta recomandată: 10+ ani (pentru peșteră).** Poteca este plată, fără diferențe de nivel semnificative — ideală pentru orice vârstă ca drumeție de defileu. Turele ghidate în peșteră durează 30–40 min la 9–12°C interior (aduceți un strat extra). **Peștera nu este recomandată copiilor sub 10 ani** din cauza scărilor abrupte și podurilor suspendate peste râu subteran.

> ⚠️ Temperatura în peșteră: 9–12°C — un strat cald este obligatoriu. Dincolo de cabană spre Peștera Bătrânului traseul devine mult mai lung și dificil — întoarceți-vă la cabană dacă faceți doar traseul scurt.`,
      sources: [
        'https://www.travelguideromania.com',
        'https://padureacraiului.ro',
        'https://www.bihorinimagini.ro',
      ],
      familyFriendly: true,
      minAgeRecommended: 10,
      highlights: ['defileu', 'peșteră turistică', 'râu subteran', 'cascadă', 'panouri educative'],
    },
  },
];

async function main() {
  const token = await getToken();
  console.log('Token OK');

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
