/**
 * Internationalization — single source of truth for all UI labels.
 * Add new languages by adding a new key to TRANSLATIONS.
 * Use t('key') or t('key', { var: value }) in components.
 */

const TRANSLATIONS = {
  ro: {
    // ── Common ──────────────────────────────────────────────────────────────
    'common.loading':            'Se încarcă…',
    'common.back':               '← Înapoi',
    'common.backToTrails':       '← Toate traseele',
    'common.backToError':        '← Înapoi la trasee',
    'common.view':               'Vezi →',
    'common.saving':             'Se salvează…',
    'common.uploading':          'Se încarcă…',
    'common.save':               'Salvează',
    'common.cancel':             'Anulează',
    'common.delete':             'Șterge',
    'common.edit':               'Editează',
    'common.signOut':            'Deconectare',
    'common.signIn':             'Conectare',
    'common.signingIn':          'Se conectează…',

    // ── Trip types ───────────────────────────────────────────────────────────
    'tripType.Dus-intors':       'Dus-întors',
    'tripType.Dus':              'Dus',

    // ── Difficulty ──────────────────────────────────────────────────────────
    'difficulty.easy':           'Ușor',
    'difficulty.medium':         'Mediu',

    // ── Hike stats ──────────────────────────────────────────────────────────
    'stat.distance':             'Distanță',
    'stat.duration':             'Durată',
    'stat.elevationGain':        'Diferență de nivel',
    'stat.tripType':             'Tip traseu',
    'stat.untilSunset':          'Până la apus',
    'stat.sunsetPassed':         'Apus trecut',

    // ── POI stats ────────────────────────────────────────────────────────────
    'poi.stat.development':     'Dezvoltare',
    'poi.stat.verticalExtent':  'Denivelarea',
    'poi.stat.altitude':        'Altitudine',
    'poi.stat.rockType':        'Tip rocă',
    'poi.stat.coordinates':     'Coordonate',

    // ── HikeDetail sections ──────────────────────────────────────────────────
    'hike.aboutTrail':           'Despre acest traseu',
    'hike.history':              'Istoric',
    'hike.nearbyRestaurants':    'Restaurante în zonă',
    'hike.nearbyCaves':          'Puncte de interes',
    'hike.photos':               'Galerie foto',
    'hike.familySafety':         'Familie & Siguranță',
    'hike.familySuitability':    'Potrivire familii',
    'hike.amenities':            'Facilități',
    'hike.safety':               'Siguranță',
    'hike.familyFriendly':       'Potrivit pentru familii',
    'hike.toddlerFriendly':      'Potrivit pentru copii mici',
    'hike.strollerAccessible':   'Accesibil cu căruciorul',
    'hike.minAge':               'Vârstă minimă',
    'hike.stroller':             'Accesibil cu caruciorul',
    'hike.kidScore':             'Scor copii',
    'hike.highlights':           'Puncte de interes',
    'hike.bearRisk':             'Risc de urs',
    'hike.restAreas':            'Zone de odihnă',
    'hike.restAreaCount':        'Nr. zone odihnă',
    'hike.bathrooms':            'Toalete',
    'hike.bathroomType':         'Tip toaletă',
    'hike.picnicArea':           'Zonă de picnic',
    'hike.playground':           'Loc de joacă',
    'hike.safeWater':            'Sursă apă potabilă',
    'hike.sheepdogWarning':      'Atenție câini de turmă',
    'hike.salvamontPoint':       'Punct Salvamont',
    'hike.trailMark':            'Marcaj traseu',
    'hike.mobileSignal':         'Semnal mobil',
    'history.hike':              'Drumeție',
    'history.recon':             'Recunoaștere',
    'history.dist':              'dist.',
    'history.time':              'timp',

    // ── Cave detail ──────────────────────────────────────────────────────────
    'poi.foundOnTrails':         'Apare pe aceste trasee',
    'poi.label':                 'Punct de interes',

    // ── Hero / Search ────────────────────────────────────────────────────────
    'hero.appName':              'Hike & Seek',
    'hero.title':                'Găsește drumeția perfectă pentru familia ta',
    'hero.subtitle':             'Trasee potrivite vârstei copiilor tăi. Fiecare aventură în aer liber, sigură și de neuitat.',
    'hero.adventureBadge':       'Aventura te așteaptă',
    'hero.searchPlaceholder':    'Caută după nume, munți, zonă…',
    'hero.trails':               'trasee',
    'hero.kmHiked':              'km parcurși',
    'hero.kidFriendly':          'Potrivite copiilor',
    'hero.regions':              'Regiuni montane',
    'hero.viewStats':            'Statistici',
    'hero.aiPlaceholder':        'Descrie drumeția visată… (ex: 2h, max 1h cu mașina)',
    'hero.aiButton':             'Caută cu AI',
    'hero.aiLoading':            'Analizez…',
    'hero.aiClear':              'Șterge filtrul AI',
    'hero.aiDriveNote':          '(Setează locația pentru filtrul de timp cu mașina)',

    // ── Filters ──────────────────────────────────────────────────────────────
    'filter.allDifficulties':    'Toate dificultățile',
    'filter.allMountains':       'Toți munții',
    'filter.allZones':           'Toate zonele',
    'filter.allTripTypes':       'Toate tipurile',
    'filter.familyFriendly':     'Potrivit pentru familii',
    'filter.stroller':           'Carucior',
    'filter.minAge':             'Varsta minima',

    // ── Location widget ──────────────────────────────────────────────────────
    'location.showDistances':    '📍 Arată distanțele față de mine',
    'location.enterCity':        'Introdu orașul',
    'location.locating':         'Se localizează…',
    'location.cityPlaceholder':  'Introdu orașul tău…',
    'location.go':               'OK',
    'location.notFound':         'Locație negăsită',
    'location.yourLocation':     'Locația ta',

    // ── Navigation ──────────────────────────────────────────────────────────
    'nav.trails':                'Trasee',
    'nav.about':                 'Despre',

    // ── Footer ───────────────────────────────────────────────────────────────
    'footer.tagline':            'Ajutăm familiile să descopere bucuria drumeției în munții României.',
    'footer.explore':            'Explorează',
    'footer.allTrails':          'Toate traseele',
    'footer.familyFriendly':     'Potrivite familiei',
    'footer.easyWalks':          'Drumeții ușoare',
    'footer.mountainViews':      'Priveliști montane',
    'footer.resources':          'Resurse',
    'footer.statistics':         'Statistici',
    'footer.safetyTips':         'Sfaturi de siguranță',
    'footer.gearGuide':          'Ghid echipament',
    'footer.trailMap':           'Hartă trasee',
    'footer.info':               'Info',
    'footer.aboutUs':            'Despre noi',
    'footer.submitTrail':        'Trimite un traseu',
    'footer.reportIssue':        'Raportează o problemă',
    'footer.admin':              'Admin',
    'footer.rights':             'Toate drepturile rezervate.',
    'footer.madeWith':           'Făcut cu ❤️ pentru familiile care iubesc natura',

    // ── Age filter ───────────────────────────────────────────────────────────
    'age.title':                 'Câți ani au exploratorii voștri?',
    'age.subtitle':              'Selectează o grupă de vârstă pentru trasee potrivite copiilor tăi',
    'age.allAges':               'Toate vârstele',
    'age.allAgesDesc':           'Arată toate traseele',
    'age.toddlers':              'Copii mici',
    'age.toddlersRange':         '0–3 ani',
    'age.preschool':             'Preșcolari',
    'age.preschoolRange':        '3–5 ani',
    'age.kids':                  'Copii',
    'age.kidsRange':             '6–9 ani',
    'age.tweens':                'Adolescenți',
    'age.tweensRange':           '10–12 ani',
    'age.teens':                 'Tineri',
    'age.teensRange':            '13+ ani',

    // ── Features section ─────────────────────────────────────────────────────
    'features.title':            'De ce familiile aleg Hike & Seek',
    'features.subtitle':         'Ușurăm căutarea traseelor sigure și plăcute adaptate vârstei copiilor tăi.',
    'features.age.title':        'Potrivit vârstei',
    'features.age.desc':         'Fiecare traseu are vârsta minimă recomandată, ca să găsești aventura perfectă pentru micuții tăi.',
    'features.safety.title':     'Siguranță mai întâi',
    'features.safety.desc':      'Informații detaliate despre condițiile traseului, dificultate și facilități pentru familii.',
    'features.local.title':      'Expertiză locală',
    'features.local.desc':       'Trasee selectate de familii locale care le-au testat cu propriii copii.',
    'features.nav.title':        'Navigare ușoară',
    'features.nav.desc':         'Direcții clare, coordonate GPS și hărți offline pentru fiecare traseu.',

    // ── Hike card ────────────────────────────────────────────────────────────
    'card.away':                 'distanță',
    'card.details':              'Detalii',
    'card.agesPlus':             'Vârsta {{age}}+',

    // ── Carousel ─────────────────────────────────────────────────────────────
    'carousel.noPhoto':          'Fără poză încă',

    // ── Weather ──────────────────────────────────────────────────────────────
    'weather.today':             'Azi',
    'weather.forecastLabel':     'Prognoză {{n}} zile · lângă punct de start',
    'weather.clear':             'Senin',
    'weather.partlyCloudy':      'Parțial noros',
    'weather.overcast':          'Acoperit',
    'weather.foggy':             'Ceață',
    'weather.drizzle':           'Burniță',
    'weather.rain':              'Ploaie',
    'weather.snow':              'Ninsoare',
    'weather.showers':           'Averse',
    'weather.snowShowers':       'Averse de ninsoare',
    'weather.thunderstorm':      'Furtună',

    // ── Stats page ───────────────────────────────────────────────────────────
    'stats.title':               'Statistici',
    'stats.back':                '← Înapoi la trasee',
    'stats.totalKm':             'km parcurși',
    'stats.totalUp':             'diferență de nivel',
    'stats.totalHours':          'ore pe traseu',
    'stats.difficultyBreakdown': 'Distribuție dificultate',
    'stats.hikingByMonth':       'Drumeții pe luni',
    'stats.distanceByMountains': 'Distanță pe munți',

    // ── Admin — common ───────────────────────────────────────────────────────
    'admin.unsavedChanges':      'Ai modificări nesalvate. Ești sigur că vrei să pleci?',
    'admin.visibleOnSite':       'Vizibil pe site',
    'admin.signOut':             'Deconectare',

    // ── Admin — hikes ────────────────────────────────────────────────────────
    'admin.hike.new':            'Traseu nou',
    'admin.hike.edit':           'Editează traseu',
    'admin.hike.save':           'Salvează traseu',
    'admin.hike.delete':         'Șterge traseu',
    'admin.hike.add':            '+ Adaugă traseu',
    'admin.hike.startingPoint':  'Punct de start',
    'admin.hike.clickToSet':     'Apasă pe hartă pentru a seta punctul de start al traseului.',
    'admin.hike.trailMap':       'Hartă traseu (Mapy.cz)',
    'admin.hike.pasteIframe':    'Lipește codul iframe din Mapy.cz',
    'admin.hike.restaurants':    'Restaurante',
    'admin.hike.caves':          'Puncte de interes',
    'admin.hike.history':        'Istoric',
    'admin.hike.noRestaurants':  'Niciun restaurant încă.',
    'admin.hike.noCaves':        'Nicio peșteră încă.',
    'admin.hike.replacePhoto':   'Schimbă poza',
    'admin.hike.choosePhoto':    'Alege poza',

    // ── Admin — caves ────────────────────────────────────────────────────────
    'admin.cave.new':            'Peșteră nouă',
    'admin.cave.edit':           'Editează peșteră',
    'admin.cave.save':           'Salvează peșteră',
    'admin.cave.add':            '+ Adaugă peșteră',
    'admin.cave.details':        'Detalii',
    'admin.cave.photos':         'Poze',
    'admin.cave.location':       'Locație',
    'admin.cave.clickToSet':     'Apasă pe hartă pentru a seta intrarea în peșteră.',
    'admin.cave.hikesLinked':    'Trasee care includ această peșteră',
    'admin.cave.noHikesLinked':  'Niciun traseu legat de această peșteră.',
    'admin.cave.addPhoto':       '+ Adaugă poză',
    'admin.cave.clickToMain':    'apasă o poză pentru a o seta ca principală',

    // ── Admin — restaurants ──────────────────────────────────────────────────
    'admin.restaurant.new':      'Restaurant nou',
    'admin.restaurant.edit':     'Editează restaurant',
    'admin.restaurant.save':     'Salvează restaurant',
    'admin.restaurant.add':      '+ Adaugă restaurant',

    // ── Admin — login ────────────────────────────────────────────────────────
    'login.title':               'Panou Admin',
    'login.subtitle':            'Hike & Seek',
    'login.username':            'Utilizator',
    'login.password':            'Parolă',
    'login.submit':              'Conectare',
    'login.submitting':          'Se conectează…',
  },

  en: {
    // ── Common ──────────────────────────────────────────────────────────────
    'common.loading':            'Loading…',
    'common.back':               '← Back',
    'common.backToTrails':       '← All trails',
    'common.backToError':        '← Back to trails',
    'common.view':               'View →',
    'common.saving':             'Saving…',
    'common.uploading':          'Uploading…',
    'common.save':               'Save',
    'common.cancel':             'Cancel',
    'common.delete':             'Delete',
    'common.edit':               'Edit',
    'common.signOut':            'Sign out',
    'common.signIn':             'Sign in',
    'common.signingIn':          'Signing in…',

    // ── Trip types (DB values are Romanian — translate for display) ─────────
    'tripType.Dus-intors':       'Round trip',
    'tripType.Dus':              'One way',

    // ── Difficulty ──────────────────────────────────────────────────────────
    'difficulty.easy':           'Easy',
    'difficulty.medium':         'Medium',

    // ── Hike stats ──────────────────────────────────────────────────────────
    'stat.distance':             'Distance',
    'stat.duration':             'Duration',
    'stat.elevationGain':        'Elevation',
    'stat.tripType':             'Trip type',
    'stat.untilSunset':          'Until sunset',
    'stat.sunsetPassed':         'Sunset passed',

    // ── POI stats ────────────────────────────────────────────────────────────
    'poi.stat.development':     'Development',
    'poi.stat.verticalExtent':  'Vertical extent',
    'poi.stat.altitude':        'Altitude',
    'poi.stat.rockType':        'Rock type',
    'poi.stat.coordinates':     'Coordinates',

    // ── HikeDetail sections ──────────────────────────────────────────────────
    'hike.aboutTrail':           'About this trail',
    'hike.history':              'History',
    'hike.nearbyRestaurants':    'Nearby restaurants',
    'hike.nearbyCaves':          'Points of interest',
    'hike.photos':               'Photo gallery',
    'hike.familySafety':         'Family & Safety',
    'hike.familySuitability':    'Family suitability',
    'hike.amenities':            'Amenities',
    'hike.safety':               'Safety',
    'hike.familyFriendly':       'Family-friendly',
    'hike.toddlerFriendly':      'Toddler-friendly',
    'hike.strollerAccessible':   'Stroller accessible',
    'hike.minAge':               'Min. age',
    'hike.stroller':             'Stroller accessible',
    'hike.kidScore':             'Kid score',
    'hike.highlights':           'Highlights',
    'hike.bearRisk':             'Bear risk',
    'hike.restAreas':            'Rest areas',
    'hike.restAreaCount':        'Rest area count',
    'hike.bathrooms':            'Bathrooms',
    'hike.bathroomType':         'Bathroom type',
    'hike.picnicArea':           'Picnic area',
    'hike.playground':           'Playground',
    'hike.safeWater':            'Safe water source',
    'hike.sheepdogWarning':      'Sheepdog warning',
    'hike.salvamontPoint':       'Salvamont point',
    'hike.trailMark':            'Trail marking',
    'hike.mobileSignal':         'Mobile signal',
    'history.hike':              'Hike',
    'history.recon':             'Recon',
    'history.dist':              'dist.',
    'history.time':              'time',

    // ── Cave detail ──────────────────────────────────────────────────────────
    'poi.foundOnTrails':         'Found on these trails',
    'poi.label':                 'Point of interest',

    // ── Hero / Search ────────────────────────────────────────────────────────
    'hero.appName':              'Hike & Seek',
    'hero.title':                'Find the Perfect Hike for Your Family',
    'hero.subtitle':             'Discover trails tailored to your children\'s age. Make every outdoor adventure safe, fun, and unforgettable.',
    'hero.adventureBadge':       'Adventure awaits your family',
    'hero.searchPlaceholder':    'Search by name, mountains, zone…',
    'hero.trails':               'Family Trails',
    'hero.kmHiked':              'Total Distance',
    'hero.kidFriendly':          'Kid-Friendly',
    'hero.regions':              'Mountain Regions',
    'hero.viewStats':            'Stats',
    'hero.aiPlaceholder':        'Describe your dream hike… (e.g. 2h hike, max 1h drive)',
    'hero.aiButton':             'Search with AI',
    'hero.aiLoading':            'Thinking…',
    'hero.aiClear':              'Clear AI filter',
    'hero.aiDriveNote':          '(Set your location to apply drive-time filter)',

    // ── Filters ──────────────────────────────────────────────────────────────
    'filter.allDifficulties':    'All difficulties',
    'filter.allMountains':       'All mountains',
    'filter.allZones':           'All zones',
    'filter.allTripTypes':       'All trip types',
    'filter.familyFriendly':     'Family-friendly',
    'filter.stroller':           'Stroller',
    'filter.minAge':             'Minimum age',

    // ── Location widget ──────────────────────────────────────────────────────
    'location.showDistances':    '📍 Show distances from me',
    'location.enterCity':        'Enter city',
    'location.locating':         'Locating…',
    'location.cityPlaceholder':  'Enter your city…',
    'location.go':               'Go',
    'location.notFound':         'Location not found',
    'location.yourLocation':     'Your location',

    // ── Navigation ──────────────────────────────────────────────────────────
    'nav.trails':                'Explore Trails',
    'nav.about':                 'About',

    // ── Footer ───────────────────────────────────────────────────────────────
    'footer.tagline':            'Helping families discover the joy of hiking together in Romania\'s mountains.',
    'footer.explore':            'Explore',
    'footer.allTrails':          'All Trails',
    'footer.familyFriendly':     'Family-Friendly',
    'footer.easyWalks':          'Easy Walks',
    'footer.mountainViews':      'Mountain Views',
    'footer.resources':          'Resources',
    'footer.statistics':         'Statistics',
    'footer.safetyTips':         'Safety Tips',
    'footer.gearGuide':          'Gear Guide',
    'footer.trailMap':           'Trail Map',
    'footer.info':               'Info',
    'footer.aboutUs':            'About Us',
    'footer.submitTrail':        'Submit a Trail',
    'footer.reportIssue':        'Report an Issue',
    'footer.admin':              'Admin',
    'footer.rights':             'All rights reserved.',
    'footer.madeWith':           'Made with ❤️ for families who love the outdoors',

    // ── Age filter ───────────────────────────────────────────────────────────
    'age.title':                 'How old are your little explorers?',
    'age.subtitle':              'Select an age group to find trails perfect for your children',
    'age.allAges':               'All Ages',
    'age.allAgesDesc':           'Show all trails',
    'age.toddlers':              'Toddlers',
    'age.toddlersRange':         '0–3 yrs',
    'age.preschool':             'Preschool',
    'age.preschoolRange':        '3–5 yrs',
    'age.kids':                  'Kids',
    'age.kidsRange':             '6–9 yrs',
    'age.tweens':                'Tweens',
    'age.tweensRange':           '10–12 yrs',
    'age.teens':                 'Teens',
    'age.teensRange':            '13+ yrs',

    // ── Features section ─────────────────────────────────────────────────────
    'features.title':            'Why Families Choose Hike & Seek',
    'features.subtitle':         'We make it easy for families to find safe, enjoyable hiking experiences tailored to their children\'s abilities.',
    'features.age.title':        'Age-Appropriate',
    'features.age.desc':         'Every trail is rated by minimum recommended age, so you can find the perfect adventure for your little ones.',
    'features.safety.title':     'Safety First',
    'features.safety.desc':      'Detailed information about trail conditions, difficulty levels, and family-friendly amenities.',
    'features.local.title':      'Local Expertise',
    'features.local.desc':       'Trails curated by local families who have tested every path with their own children.',
    'features.nav.title':        'Easy Navigation',
    'features.nav.desc':         'Clear directions, GPS coordinates, and maps for every trail.',

    // ── Hike card ────────────────────────────────────────────────────────────
    'card.away':                 'away',
    'card.details':              'Details',
    'card.agesPlus':             'Ages {{age}}+',

    // ── Carousel ─────────────────────────────────────────────────────────────
    'carousel.noPhoto':          'No photo yet',

    // ── Weather ──────────────────────────────────────────────────────────────
    'weather.today':             'Today',
    'weather.forecastLabel':     '{{n}}-day forecast · near trailhead',
    'weather.clear':             'Clear',
    'weather.partlyCloudy':      'Partly cloudy',
    'weather.overcast':          'Overcast',
    'weather.foggy':             'Foggy',
    'weather.drizzle':           'Drizzle',
    'weather.rain':              'Rain',
    'weather.snow':              'Snow',
    'weather.showers':           'Showers',
    'weather.snowShowers':       'Snow showers',
    'weather.thunderstorm':      'Thunderstorm',

    // ── Stats page ───────────────────────────────────────────────────────────
    'stats.title':               'Statistics',
    'stats.back':                '← Back to trails',
    'stats.totalKm':             'km hiked',
    'stats.totalUp':             'elevation gain',
    'stats.totalHours':          'hours on trail',
    'stats.difficultyBreakdown': 'Difficulty breakdown',
    'stats.hikingByMonth':       'Hiking by month',
    'stats.distanceByMountains': 'Distance by mountains',

    // ── Admin — common ───────────────────────────────────────────────────────
    'admin.unsavedChanges':      'You have unsaved changes. Are you sure you want to leave?',
    'admin.visibleOnSite':       'Visible on site',
    'admin.signOut':             'Sign out',

    // ── Admin — hikes ────────────────────────────────────────────────────────
    'admin.hike.new':            'New hike',
    'admin.hike.edit':           'Edit hike',
    'admin.hike.save':           'Save hike',
    'admin.hike.delete':         'Delete hike',
    'admin.hike.add':            '+ Add hike',
    'admin.hike.startingPoint':  'Starting point',
    'admin.hike.clickToSet':     'Click on the map to set the trail starting point.',
    'admin.hike.trailMap':       'Trail map (Mapy.cz)',
    'admin.hike.pasteIframe':    'Paste iframe code from Mapy.cz',
    'admin.hike.restaurants':    'Restaurants',
    'admin.hike.caves':          'Points of interest',
    'admin.hike.history':        'History',
    'admin.hike.noRestaurants':  'No restaurants yet.',
    'admin.hike.noCaves':        'No caves yet.',
    'admin.hike.replacePhoto':   'Replace photo',
    'admin.hike.choosePhoto':    'Choose photo',

    // ── Admin — caves ────────────────────────────────────────────────────────
    'admin.cave.new':            'New cave',
    'admin.cave.edit':           'Edit cave',
    'admin.cave.save':           'Save cave',
    'admin.cave.add':            '+ Add cave',
    'admin.cave.details':        'Details',
    'admin.cave.photos':         'Photos',
    'admin.cave.location':       'Location',
    'admin.cave.clickToSet':     'Click on the map to set the cave entrance location.',
    'admin.cave.hikesLinked':    'Hikes featuring this cave',
    'admin.cave.noHikesLinked':  'No hikes linked to this cave yet.',
    'admin.cave.addPhoto':       '+ Add photo',
    'admin.cave.clickToMain':    'click a photo to set as main',

    // ── Admin — restaurants ──────────────────────────────────────────────────
    'admin.restaurant.new':      'New restaurant',
    'admin.restaurant.edit':     'Edit restaurant',
    'admin.restaurant.save':     'Save restaurant',
    'admin.restaurant.add':      '+ Add restaurant',

    // ── Admin — login ────────────────────────────────────────────────────────
    'login.title':               'Admin Panel',
    'login.subtitle':            'Hike & Seek',
    'login.username':            'Username',
    'login.password':            'Password',
    'login.submit':              'Sign in',
    'login.submitting':          'Signing in…',
  },
};

// ── Language resolution ──────────────────────────────────────────────────────

let _lang = 'en';
try { _lang = localStorage.getItem('lang') || 'en'; } catch {}

export function setLang(lang) {
  _lang = lang;
  try { localStorage.setItem('lang', lang); } catch {}
  window.dispatchEvent(new Event('langchange'));
}

export function getLang() { return _lang; }

/**
 * Translate a key, with optional variable interpolation.
 * @example t('weather.forecastLabel', { n: 10 }) → "10-day forecast · near trailhead"
 */
export function t(key, vars = {}) {
  const dict = TRANSLATIONS[_lang] || TRANSLATIONS.en;
  let str = dict[key] ?? TRANSLATIONS.en[key] ?? key;
  for (const [k, v] of Object.entries(vars)) {
    str = str.replace(`{{${k}}}`, v);
  }
  return str;
}

export default t;
