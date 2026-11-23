// Spotify-login met Authorization Code + PKCE (geen server nodig).
// Tokens staan in localStorage, zodat inloggen maar één keer hoeft:
// het access token wordt automatisch ververst met het refresh token.
import { CLIENT_ID, SCOPES, REDIRECT_URI } from './config.js';

const AUTH_URL = 'https://accounts.spotify.com/authorize';
const TOKEN_URL = 'https://accounts.spotify.com/api/token';
const KEY = 'hitster.tokens';
const VERIFIER_KEY = 'hitster.pkce_verifier';
const STATE_KEY = 'hitster.pkce_state';

export class AuthError extends Error {
  constructor(code, message) {
    super(message || code);
    this.code = code; // 'not-logged-in' | 'denied' | 'refresh-failed' | 'network' | 'config'
  }
}

function load() {
  try { return JSON.parse(localStorage.getItem(KEY)) || null; } catch { return null; }
}
function save(t) { localStorage.setItem(KEY, JSON.stringify(t)); }
export function logout() { localStorage.removeItem(KEY); }
export function isLoggedIn() { return !!load()?.refresh_token; }
export function isConfigured() { return CLIENT_ID && !CLIENT_ID.startsWith('PLAK'); }

function randomString(len) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const bytes = crypto.getRandomValues(new Uint8Array(len));
  return Array.from(bytes, (b) => chars[b % chars.length]).join('');
}

async function challengeFor(verifier) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier));
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/** Stuurt de gebruiker naar de Spotify-inlogpagina. */
export async function login() {
  if (!isConfigured()) throw new AuthError('config');
  const verifier = randomString(64);
  const state = randomString(16);
  localStorage.setItem(VERIFIER_KEY, verifier);
  localStorage.setItem(STATE_KEY, state);
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    response_type: 'code',
    redirect_uri: REDIRECT_URI,
    scope: SCOPES.join(' '),
    code_challenge_method: 'S256',
    code_challenge: await challengeFor(verifier),
    state,
  });
  location.assign(`${AUTH_URL}?${params}`);
}

/**
 * Verwerkt de terugkeer van Spotify (?code=... of ?error=...).
 * @returns {Promise<boolean>} true als er een callback verwerkt is.
 */
export async function handleRedirect() {
  const params = new URLSearchParams(location.search);
  const code = params.get('code');
  const error = params.get('error');
  if (!code && !error) return false;

  // Haal ?code=... uit de adresbalk, ook als er iets misgaat.
  history.replaceState(null, '', REDIRECT_URI);

  const expectedState = localStorage.getItem(STATE_KEY);
  const verifier = localStorage.getItem(VERIFIER_KEY);
  localStorage.removeItem(STATE_KEY);
  localStorage.removeItem(VERIFIER_KEY);

  if (error) throw new AuthError('denied', error);
  if (!verifier || params.get('state') !== expectedState) {
    // Bv. inloggen gestart in Safari maar teruggekomen in de beginschermapp.
    throw new AuthError('denied', 'state-mismatch');
  }

  const tokens = await tokenRequest({
    grant_type: 'authorization_code',
    code,
    redirect_uri: REDIRECT_URI,
    client_id: CLIENT_ID,
    code_verifier: verifier,
  });
  save(withExpiry(tokens));
  return true;
}

function withExpiry(t, previous) {
  return {
    access_token: t.access_token,
    // Spotify geeft soms een nieuw refresh token; anders het oude houden.
    refresh_token: t.refresh_token || previous?.refresh_token,
    expires_at: Date.now() + (t.expires_in || 3600) * 1000,
  };
}

async function tokenRequest(body) {
  let res;
  try {
    res = await fetch(TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(body),
    });
  } catch {
    throw new AuthError('network');
  }
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new AuthError(body.grant_type === 'refresh_token' ? 'refresh-failed' : 'denied', data.error);
  }
  return res.json();
}

let refreshing = null;

/** Ververst het access token (één tegelijk). */
export async function refresh() {
  const current = load();
  if (!current?.refresh_token) throw new AuthError('not-logged-in');
  refreshing ??= tokenRequest({
    grant_type: 'refresh_token',
    refresh_token: current.refresh_token,
    client_id: CLIENT_ID,
  })
    .then((t) => save(withExpiry(t, current)))
    .catch((e) => {
      // Alleen uitloggen als Spotify het refresh token echt weigert,
      // niet bij een tijdelijk netwerkprobleem.
      if (e.code === 'refresh-failed') logout();
      throw e;
    })
    .finally(() => { refreshing = null; });
  return refreshing;
}

/** Geeft een geldig access token, ververst indien nodig. */
export async function getAccessToken() {
  let t = load();
  if (!t?.refresh_token) throw new AuthError('not-logged-in');
  if (!t.access_token || Date.now() > t.expires_at - 60_000) {
    await refresh();
    t = load();
  }
  return t.access_token;
}
