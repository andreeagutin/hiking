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

    // ── Status ──────────────────────────────────────────────────────────────
    'status.Done':               'Făcut',
    'status.In progress':        'În progres',
    'status.Not started':        'Neînceput',

    // ── Hike stats ──────────────────────────────────────────────────────────
    'stat.distance':             'Distanță',
    'stat.duration':             'Durată',
    'stat.elevationGain':        'Diferență de nivel (urcare)',
    'stat.elevationLoss':        'Diferență de nivel (coborâre)',
    'stat.tripType':             'Tip traseu',
    'stat.completedOn':          'Finalizat pe',

    // ── Cave stats ───────────────────────────────────────────────────────────
    'cave.stat.development':     'Dezvoltare',
    'cave.stat.verticalExtent':  'Denivelarea',
    'cave.stat.altitude':        'Altitudine',
    'cave.stat.rockType':        'Tip rocă',
    'cave.stat.coordinates':     'Coordonate',

    // ── HikeDetail sections ──────────────────────────────────────────────────
    'hike.aboutTrail':           'Despre acest traseu',
    'hike.history':              'Istoric',
    'hike.nearbyRestaurants':    'Restaurante în zonă',
    'hike.nearbyCaves':          'Peșteri în zonă',
    'history.hike':              'Drumeție',
    'history.recon':             'Recunoaștere',
    'history.dist':              'dist.',
    'history.time':              'timp',

    // ── Cave detail ──────────────────────────────────────────────────────────
    'cave.foundOnTrails':        'Apare pe aceste trasee',

    // ── Hero / Search ────────────────────────────────────────────────────────
    'hero.appName':              'Trail Mix',
    'hero.title':                'Unde vrei să mergi la drumeție?',
    'hero.searchPlaceholder':    'Caută după nume, munți, zonă…',
    'hero.trails':               'trasee',
    'hero.completed':            'finalizate',
    'hero.kmHiked':              'km parcurși',
    'hero.viewStats':            'Vezi statistici →',
    'hero.aiPlaceholder':        'Descrie drumeția visată… (ex: 2h, max 1h cu mașina)',
    'hero.aiButton':             'Caută cu AI',
    'hero.aiLoading':            'Analizez…',
    'hero.aiClear':              'Șterge filtrul AI',
    'hero.aiDriveNote':          '(Setează locația pentru filtrul de timp cu mașina)',

    // ── Filters ──────────────────────────────────────────────────────────────
    'filter.allStatuses':        'Toate statusurile',
    'filter.allDifficulties':    'Toate dificultățile',
    'filter.allMountains':       'Toți munții',
    'filter.allZones':           'Toate zonele',
    'filter.allTripTypes':       'Toate tipurile',

    // ── Location widget ──────────────────────────────────────────────────────
    'location.showDistances':    '📍 Arată distanțele față de mine',
    'location.enterCity':        'Introdu orașul',
    'location.locating':         'Se localizează…',
    'location.cityPlaceholder':  'Introdu orașul tău…',
    'location.go':               'OK',
    'location.notFound':         'Locație negăsită',
    'location.yourLocation':     'Locația ta',

    // ── Hike card ────────────────────────────────────────────────────────────
    'card.away':                 'distanță',

    // ── Carousel ─────────────────────────────────────────────────────────────
    'carousel.completedTrails':  'Trasee finalizate',
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
    'stats.completedTrails':     'trasee făcute',
    'stats.statusBreakdown':     'Distribuție status',
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
    'admin.hike.caves':          'Peșteri',
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
    'login.subtitle':            'Trail Mix',
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

    // ── Status ──────────────────────────────────────────────────────────────
    'status.Done':               'Done',
    'status.In progress':        'In progress',
    'status.Not started':        'Not started',

    // ── Hike stats ──────────────────────────────────────────────────────────
    'stat.distance':             'Distance',
    'stat.duration':             'Duration',
    'stat.elevationGain':        'Elevation gain',
    'stat.elevationLoss':        'Elevation loss',
    'stat.tripType':             'Trip type',
    'stat.completedOn':          'Completed on',

    // ── Cave stats (previously Romanian labels) ──────────────────────────────
    'cave.stat.development':     'Development',
    'cave.stat.verticalExtent':  'Vertical extent',
    'cave.stat.altitude':        'Altitude',
    'cave.stat.rockType':        'Rock type',
    'cave.stat.coordinates':     'Coordinates',

    // ── HikeDetail sections ──────────────────────────────────────────────────
    'hike.aboutTrail':           'About this trail',
    'hike.history':              'History',
    'hike.nearbyRestaurants':    'Nearby restaurants',
    'hike.nearbyCaves':          'Nearby caves',
    'history.hike':              'Hike',
    'history.recon':             'Recon',
    'history.dist':              'dist.',
    'history.time':              'time',

    // ── Cave detail ──────────────────────────────────────────────────────────
    'cave.foundOnTrails':        'Found on these trails',

    // ── Hero / Search ────────────────────────────────────────────────────────
    'hero.appName':              'Trail Mix',
    'hero.title':                'Where would you like to hike?',
    'hero.searchPlaceholder':    'Search by name, mountains, zone…',
    'hero.trails':               'trails',
    'hero.completed':            'completed',
    'hero.kmHiked':              'km hiked',
    'hero.viewStats':            'View stats →',
    'hero.aiPlaceholder':        'Describe your dream hike… (e.g. 2h hike, max 1h drive)',
    'hero.aiButton':             'Search with AI',
    'hero.aiLoading':            'Thinking…',
    'hero.aiClear':              'Clear AI filter',
    'hero.aiDriveNote':          '(Set your location to apply drive-time filter)',

    // ── Filters ──────────────────────────────────────────────────────────────
    'filter.allStatuses':        'All statuses',
    'filter.allDifficulties':    'All difficulties',
    'filter.allMountains':       'All mountains',
    'filter.allZones':           'All zones',
    'filter.allTripTypes':       'All trip types',

    // ── Location widget ──────────────────────────────────────────────────────
    'location.showDistances':    '📍 Show distances from me',
    'location.enterCity':        'Enter city',
    'location.locating':         'Locating…',
    'location.cityPlaceholder':  'Enter your city…',
    'location.go':               'Go',
    'location.notFound':         'Location not found',
    'location.yourLocation':     'Your location',

    // ── Hike card ────────────────────────────────────────────────────────────
    'card.away':                 'away',

    // ── Carousel ─────────────────────────────────────────────────────────────
    'carousel.completedTrails':  'Completed trails',
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
    'stats.completedTrails':     'trails done',
    'stats.statusBreakdown':     'Status breakdown',
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
    'admin.hike.caves':          'Caves',
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
    'login.subtitle':            'Trail Mix',
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
