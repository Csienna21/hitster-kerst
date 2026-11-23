// Draai met:  npm test
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseSpotifyTrack } from '../js/spotify-link.js';

const ID = '4uLU6hMCjMI75M1A2tKUQC';

const good = [
  `https://open.spotify.com/track/${ID}`,
  `https://open.spotify.com/track/${ID}?si=abc123def456`,
  `https://open.spotify.com/track/${ID}?si=abc&context=spotify%3Aplaylist%3A37i9`,
  `https://open.spotify.com/intl-nl/track/${ID}?si=xyz`,
  `https://open.spotify.com/intl-pt-BR/track/${ID}`,
  `https://open.spotify.com/embed/track/${ID}`,
  `https://open.spotify.com/track/${ID}/`,
  `http://open.spotify.com/track/${ID}`,
  `open.spotify.com/track/${ID}`,
  `HTTPS://OPEN.SPOTIFY.COM/track/${ID}`,
  `  https://open.spotify.com/track/${ID}  \n`,
  `https://open.spotify.com/track/${ID}#hash`,
  `spotify:track:${ID}`,
  `spotify://track/${ID}`,
];

for (const input of good) {
  test(`herkent: ${JSON.stringify(input)}`, () => {
    assert.deepEqual(parseSpotifyTrack(input), { ok: true, id: ID });
  });
}

const bad = [
  ['', 'empty'],
  ['   ', 'empty'],
  [null, 'empty'],
  ['https://example.com/track/' + ID, 'not-spotify'],
  ['Hallo mama!', 'not-spotify'],
  ['https://open.spotify.com/album/' + ID, 'not-track'],
  ['https://open.spotify.com/playlist/' + ID, 'not-track'],
  ['spotify:album:' + ID, 'not-track'],
  ['https://open.spotify.com/track/kort', 'not-track'],
  ['https://open.spotify.com/', 'not-track'],
  ['https://spotify.link/AbCdEf', 'short-link'],
  ['https://open.spotify.com.evil.com/track/' + ID, 'not-spotify'],
];

for (const [input, reason] of bad) {
  test(`weigert: ${JSON.stringify(input)} -> ${reason}`, () => {
    assert.deepEqual(parseSpotifyTrack(input), { ok: false, reason });
  });
}
