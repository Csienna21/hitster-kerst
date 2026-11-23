// Haalt een Spotify track-ID uit de tekst van een gescande QR-code.
// Ondersteunt o.a.:
//   https://open.spotify.com/track/<id>?si=...
//   https://open.spotify.com/intl-nl/track/<id>
//   https://open.spotify.com/embed/track/<id>
//   open.spotify.com/track/<id>            (zonder https://)
//   spotify:track:<id>
//   spotify://track/<id>

const ID_RE = /^[A-Za-z0-9]{22}$/;
const SPOTIFY_HOSTS = ['open.spotify.com', 'play.spotify.com', 'www.spotify.com', 'spotify.com'];
const SHORT_LINK_HOSTS = ['spotify.link', 'spoti.fi'];

/**
 * @param {string} raw  tekst uit de QR-code
 * @returns {{ok: true, id: string} | {ok: false, reason: 'empty'|'short-link'|'not-track'|'not-spotify'}}
 */
export function parseSpotifyTrack(raw) {
  if (typeof raw !== 'string') return { ok: false, reason: 'empty' };
  const text = raw.trim();
  if (!text) return { ok: false, reason: 'empty' };

  const direct = parseSingle(text);
  if (direct.ok) return direct;

  // De code bevat misschien tekst rondom de link, bv.
  // "Luister naar ... op Spotify: https://open.spotify.com/track/...".
  // Zoek dan losse links/URI's in de tekst.
  const candidates = text.match(/(?:https?:\/\/|spotify:|open\.spotify\.com\/)[^\s"'<>]+/gi) || [];
  const results = candidates.map((c) => parseSingle(c.replace(/[.,;:!?)\]]+$/, '')));
  const found = results.find((r) => r.ok);
  if (found) return found;

  // Geef de meest behulpzame foutreden terug.
  for (const reason of ['short-link', 'not-track']) {
    if (direct.reason === reason || results.some((r) => r.reason === reason)) return { ok: false, reason };
  }
  return direct;
}

function parseSingle(text) {
  // spotify:track:<id>  (URI-vorm; soms met extra :-delen erachter)
  const uri = /^spotify:(\w+):([A-Za-z0-9]+)/i.exec(text);
  if (uri) {
    return uri[1].toLowerCase() === 'track' && ID_RE.test(uri[2])
      ? { ok: true, id: uri[2] }
      : { ok: false, reason: 'not-track' };
  }

  // Webadres; voeg https:// toe als dat ontbreekt.
  let url;
  try {
    const withScheme = /^[a-z][a-z0-9+.-]*:\/\//i.test(text) ? text : 'https://' + text;
    url = new URL(withScheme);
  } catch {
    return { ok: false, reason: 'not-spotify' };
  }

  const host = url.hostname.toLowerCase();

  // spotify://track/<id>
  if (url.protocol === 'spotify:') {
    const parts = (host + url.pathname).split('/').filter(Boolean);
    return findTrackId(parts);
  }

  if (SHORT_LINK_HOSTS.includes(host)) return { ok: false, reason: 'short-link' };
  if (!SPOTIFY_HOSTS.includes(host)) return { ok: false, reason: 'not-spotify' };

  return findTrackId(url.pathname.split('/').filter(Boolean));
}

function findTrackId(parts) {
  // Zoek het segment "track" en neem het volgende segment als ID.
  // Zo maakt een taalvoorvoegsel (intl-nl) of "embed" niet uit.
  const i = parts.findIndex((p) => p.toLowerCase() === 'track');
  if (i === -1) return { ok: false, reason: 'not-track' };
  const id = decodeURIComponent(parts[i + 1] || '');
  return ID_RE.test(id) ? { ok: true, id } : { ok: false, reason: 'not-track' };
}
