/**
 * Internationalization — single source of truth for all UI labels.
 * Add new languages by adding a new key to TRANSLATIONS.
 * Use t('key') or t('key', { var: value }) in components.
 */

const TRANSLATIONS = {
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
}

export function getLang() { return _lang; }

/**
 * Translate a key, with optional variable interpolation.
 * @example t('weather.forecastLabel', { n: 10 }) → "10-day forecast · near trailhead"
 */
export function t(key, vars = {}) {
  const dict = TRANSLATIONS[_lang] || TRANSLATIONS.en;
  let str = dict[key] ?? key;
  for (const [k, v] of Object.entries(vars)) {
    str = str.replace(`{{${k}}}`, v);
  }
  return str;
}

export default t;
