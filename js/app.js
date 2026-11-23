import { parseSpotifyTrack } from './spotify-link.js';
import { login, logout, handleRedirect, isLoggedIn } from './auth.js';
import { playTrack, pause, resume } from './player.js';

const $ = (id) => document.getElementById(id);
const screens = ['login', 'home', 'scan', 'play', 'busy'];
const RANDOM_KEY = 'hitster.randomStart';

let currentTrackId = null;
let playing = false;
let scanner = null;
let handlingScan = false;
let autoRetryOnReturn = false;

function show(name) {
  for (const s of screens) $(`screen-${s}`).hidden = s !== name;
}

function busy(text) {
  $('busy-text').textContent = text || 'Even geduld…';
  show('busy');
}

/* ---------- Meldingen in gewoon Nederlands ---------- */

const MESSAGES = {
  'no-device': {
    title: 'Spotify slaapt nog',
    text: 'Open de Spotify-app even op deze telefoon (je hoeft niets af te spelen). Kom daarna terug naar dit spel; het nummer start dan vanzelf.',
    actions: ['open-spotify', 'retry', 'home'],
  },
  premium: {
    title: 'Spotify Premium nodig',
    text: 'Om nummers af te spelen is een Spotify Premium-account nodig. Controleer of je met het juiste account bent ingelogd.',
    actions: ['relogin', 'home'],
  },
  'not-allowed': {
    title: 'Nog geen toegang',
    text: 'Dit Spotify-account staat nog niet op de gastenlijst van het spel. Vraag de maker van het spel om je toe te voegen.',
    actions: ['relogin', 'home'],
  },
  login: {
    title: 'Opnieuw inloggen',
    text: 'De app is uitgelogd bij Spotify. Log even opnieuw in, daarna kun je verder spelen.',
    actions: ['relogin'],
  },
  network: {
    title: 'Geen verbinding',
    text: 'Er is geen internet. Controleer de wifi of mobiele data en probeer het opnieuw.',
    actions: ['retry', 'home'],
  },
  busy: {
    title: 'Even wachten',
    text: 'Spotify heeft het even druk. Wacht een paar seconden en probeer het opnieuw.',
    actions: ['retry', 'home'],
  },
  'spotify-down': {
    title: 'Spotify reageert niet',
    text: 'Spotify heeft een storing. Probeer het over een minuutje nog eens.',
    actions: ['retry', 'home'],
  },
  unknown: {
    title: 'Er ging iets mis',
    text: 'Probeer het nog een keer. Blijft het misgaan, open dan Spotify even en probeer opnieuw.',
    actions: ['retry', 'home'],
  },
  'not-spotify': {
    title: 'Onbekende code',
    text: 'Deze QR-code is geen Spotify-nummer. Scan een kaart uit het spel.',
    actions: ['scan', 'home'],
  },
  'not-track': {
    title: 'Geen los nummer',
    text: 'Deze code verwijst wel naar Spotify, maar niet naar één nummer (bijvoorbeeld een album of afspeellijst).',
    actions: ['scan', 'home'],
  },
  'short-link': {
    title: 'Verkorte link',
    text: 'Deze kaart heeft een verkorte Spotify-link (spotify.link). Die kan de app niet lezen. Gebruik een kaart met een open.spotify.com-link.',
    actions: ['scan', 'home'],
  },
  empty: {
    title: 'Niets gelezen',
    text: 'De QR-code was leeg of onleesbaar. Probeer het nog eens.',
    actions: ['scan', 'home'],
  },
  camera: {
    title: 'Camera niet beschikbaar',
    text: 'De app mag de camera niet gebruiken. Op de iPhone: ga naar Instellingen › Safari › Camera en kies “Sta toe”. Probeer het daarna opnieuw.',
    actions: ['scan', 'home'],
  },
  'login-failed': {
    title: 'Inloggen mislukt',
    text: 'Het inloggen bij Spotify is niet gelukt. Probeer het nog een keer.',
    actions: ['relogin'],
  },
  'confirm-logout': {
    title: 'Uitloggen?',
    text: 'Daarna moet je opnieuw inloggen met Spotify om te kunnen spelen.',
    actions: ['do-logout', 'home'],
  },
};

const ACTIONS = {
  'open-spotify': { label: 'Open Spotify', cls: 'btn-primary', run: () => { location.href = 'spotify:'; } },
  retry: { label: 'Opnieuw proberen', cls: 'btn-primary', run: () => startPlayback() },
  scan: { label: 'Opnieuw scannen', cls: 'btn-primary', run: () => startScan() },
  relogin: { label: 'Inloggen met Spotify', cls: 'btn-primary', run: () => doLogin() },
  'do-logout': { label: 'Ja, uitloggen', cls: 'btn-primary', run: () => { logout(); show('login'); } },
  home: { label: 'Terug', cls: 'btn-ghost', run: () => show(isLoggedIn() ? 'home' : 'login') },
};

// Bij deze fouten tonen we klein wat er in de QR-code stond (handig om te controleren).
const SCAN_ERRORS = { 'not-spotify': 1, 'not-track': 1, 'short-link': 1 };

function showError(code, detail) {
  const m = MESSAGES[code] || MESSAGES.unknown;
  $('dialog-title').textContent = m.title;
  $('dialog-text').textContent = m.text;
  $('dialog-detail').textContent = detail && (code === 'unknown' || code in SCAN_ERRORS) ? String(detail) : '';
  const box = $('dialog-actions');
  box.replaceChildren();
  // Bij "Open Spotify" is "Opnieuw proberen" de tweede keus.
  m.actions.forEach((a, i) => {
    const def = ACTIONS[a];
    const b = document.createElement('button');
    b.className = `btn ${i === 0 ? def.cls : (a === 'home' ? 'btn-ghost' : 'btn-light')}`;
    b.textContent = def.label;
    b.addEventListener('click', () => {
      if (a !== 'open-spotify') { hideDialog(); }
      def.run();
    });
    box.append(b);
  });
  autoRetryOnReturn = code === 'no-device';
  $('dialog').hidden = false;
}

function hideDialog() {
  $('dialog').hidden = true;
  autoRetryOnReturn = false;
}

// Terug uit de Spotify-app na "Spotify slaapt nog": automatisch opnieuw proberen.
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible' && autoRetryOnReturn && currentTrackId) {
    hideDialog();
    busy('Nummer starten…');
    setTimeout(startPlayback, 800);
  }
});

/* ---------- Inloggen ---------- */

async function doLogin() {
  try {
    await login();
  } catch (e) {
    showError(e.code === 'config' ? 'unknown' : 'login-failed', e.message);
  }
}

/* ---------- Scannen ---------- */

async function startScan() {
  hideDialog();
  show('scan');
  handlingScan = false;
  try {
    scanner ??= new Html5Qrcode('reader', {
      formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
      verbose: false,
    });
    await scanner.start(
      { facingMode: 'environment' },
      {
        fps: 10,
        qrbox: (w, h) => {
          const s = Math.floor(Math.min(w, h) * 0.75);
          return { width: s, height: s };
        },
      },
      onScan,
      () => {} // "nog geen code gevonden" negeren
    );
  } catch (e) {
    await stopScan();
    show('home');
    showError('camera', e);
  }
}

async function stopScan() {
  if (scanner?.isScanning) {
    try { await scanner.stop(); } catch { /* al gestopt */ }
  }
}

async function onScan(text) {
  if (handlingScan) return;
  handlingScan = true;
  await stopScan();

  const result = parseSpotifyTrack(text);
  if (!result.ok) {
    show('home');
    showError(result.reason, `Gescand: ${text.slice(0, 200)}`);
    return;
  }
  currentTrackId = result.id;
  startPlayback();
}

/* ---------- Afspelen ---------- */

async function startPlayback() {
  if (!currentTrackId) return show('home');
  busy('Nummer starten…');
  try {
    await playTrack(currentTrackId, { randomStart: $('toggle-random').checked });
    setPlaying(true);
    show('play');
  } catch (e) {
    show('home');
    showError(e.code || 'unknown', e.detail || e.message);
  }
}

function setPlaying(on) {
  playing = on;
  $('icon-pause').hidden = !on;
  $('icon-play').hidden = on;
  $('btn-playpause').setAttribute('aria-label', on ? 'Pauze' : 'Afspelen');
  $('play-status').textContent = on ? 'Het nummer speelt…' : 'Gepauzeerd';
  $('eq').classList.toggle('paused', !on);
}

async function togglePlay() {
  const wasPlaying = playing;
  setPlaying(!wasPlaying); // meteen reageren
  try {
    await (wasPlaying ? pause() : resume());
  } catch (e) {
    setPlaying(wasPlaying);
    showError(e.code || 'unknown', e.detail || e.message);
  }
}

/* ---------- Opstarten ---------- */

function initToggle() {
  const t = $('toggle-random');
  try { t.checked = localStorage.getItem(RANDOM_KEY) === '1'; } catch { /* standaard uit */ }
  t.addEventListener('change', () => {
    try { localStorage.setItem(RANDOM_KEY, t.checked ? '1' : '0'); } catch { /* geen opslag */ }
  });
}

async function init() {
  initToggle();
  $('btn-login').addEventListener('click', doLogin);
  $('btn-scan').addEventListener('click', startScan);
  $('btn-logout').addEventListener('click', () => showError('confirm-logout'));
  $('btn-cancel-scan').addEventListener('click', async () => { await stopScan(); show('home'); });
  $('btn-playpause').addEventListener('click', togglePlay);
  $('btn-next').addEventListener('click', () => {
    if (playing) pause().catch(() => {});
    setPlaying(false);
    startScan();
  });

  try {
    if (await handleRedirect()) { show('home'); return; }
  } catch (e) {
    show('login');
    showError(e.code === 'network' ? 'network' : 'login-failed', e.message);
    return;
  }

  show(isLoggedIn() ? 'home' : 'login');
}

init();
