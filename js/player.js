// Afspelen via de Spotify Web API (Spotify Connect).
// Speelt af op de Spotify-app op dezelfde telefoon; toont nooit titel/artiest.
import { getAccessToken, refresh, AuthError } from './auth.js';

const API = 'https://api.spotify.com/v1';

export class PlayerError extends Error {
  /**
   * code: 'no-device' | 'premium' | 'not-allowed' | 'login' | 'network' |
   *       'busy' | 'spotify-down' | 'unknown'
   */
  constructor(code, detail) {
    super(code);
    this.code = code;
    this.detail = detail;
  }
}

async function api(method, path, body, { retried = false } = {}) {
  let token;
  try {
    token = await getAccessToken();
  } catch (e) {
    throw toPlayerError(e);
  }

  let res;
  try {
    res = await fetch(API + path, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        ...(body ? { 'Content-Type': 'application/json' } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new PlayerError('network');
  }

  if (res.status === 401 && !retried) {
    try { await refresh(); } catch (e) { throw toPlayerError(e); }
    return api(method, path, body, { retried: true });
  }

  if (res.status === 204 || res.status === 202) return null;
  const data = await res.json().catch(() => null);
  if (res.ok) return data;

  const err = data?.error || {};
  const msg = String(err.message || '');
  const reason = String(err.reason || '');
  switch (res.status) {
    case 401: throw new PlayerError('login', msg);
    case 403:
      if (reason === 'PREMIUM_REQUIRED' || /premium/i.test(msg)) throw new PlayerError('premium', msg);
      if (/registered|developer dashboard|not allowed/i.test(msg)) throw new PlayerError('not-allowed', msg);
      throw new PlayerError('unknown', `403 ${reason} ${msg}`);
    case 404: throw new PlayerError('no-device', msg);
    case 429: throw new PlayerError('busy', msg);
    default:
      if (res.status >= 500) throw new PlayerError('spotify-down', `${res.status} ${msg}`);
      throw new PlayerError('unknown', `${res.status} ${reason} ${msg}`);
  }
}

function toPlayerError(e) {
  if (e instanceof PlayerError) return e;
  if (e instanceof AuthError) return new PlayerError(e.code === 'network' ? 'network' : 'login', e.message);
  return new PlayerError('unknown', String(e));
}

/** Kiest de Spotify-app op deze telefoon (of tablet). */
async function findPhoneDevice() {
  const data = await api('GET', '/me/player/devices');
  const devices = (data?.devices || []).filter((d) => !d.is_restricted && d.id);
  const mobile = devices.filter((d) => /smartphone|tablet/i.test(d.type));
  return mobile.find((d) => d.is_active) || mobile[0] || null;
}

let deviceId = null;

/** Willekeurig startpunt: tussen 30 s en 60% van het nummer. */
async function randomPosition(trackId) {
  let duration = 0;
  try {
    duration = (await api('GET', `/tracks/${trackId}`))?.duration_ms || 0;
  } catch { /* lengte onbekend: val terug op 30-60 s */ }
  if (!duration) return 30_000 + Math.floor(Math.random() * 30_000);
  const min = 30_000;
  const max = Math.floor(duration * 0.6);
  if (max <= min) return Math.floor(duration * 0.2);
  return min + Math.floor(Math.random() * (max - min));
}

export async function playTrack(trackId, { randomStart = false } = {}) {
  const device = await findPhoneDevice();
  if (!device) throw new PlayerError('no-device');
  deviceId = device.id;

  const position_ms = randomStart ? await randomPosition(trackId) : 0;
  await api('PUT', `/me/player/play?device_id=${encodeURIComponent(deviceId)}`, {
    uris: [`spotify:track:${trackId}`],
    position_ms,
  });

  // Herhaal het nummer, zodat Spotify na afloop niet doorspeelt naar
  // een ander (misschien herkenbaar) nummer. Niet erg als dit mislukt.
  api('PUT', `/me/player/repeat?state=track&device_id=${encodeURIComponent(deviceId)}`).catch(() => {});
}

export async function pause() {
  try {
    await api('PUT', `/me/player/pause${deviceId ? `?device_id=${encodeURIComponent(deviceId)}` : ''}`);
  } catch (e) {
    // "Al gepauzeerd" e.d. is geen probleem.
    if (e.code !== 'unknown') throw e;
  }
}

export async function resume() {
  await api('PUT', `/me/player/play${deviceId ? `?device_id=${encodeURIComponent(deviceId)}` : ''}`);
}
