// Plak hier de Client ID van je Spotify Developer app (zie README).
// De Client ID is niet geheim: met PKCE is er geen Client Secret nodig.
export const CLIENT_ID = '573682f9bee24e6394ab28ce2fd1a22f';

// Minimale rechten: alleen afspelen bedienen en apparaten zien.
export const SCOPES = ['user-read-playback-state', 'user-modify-playback-state'];

// De redirect URI is het adres van deze pagina zelf (zonder index.html),
// bv. https://csienna21.github.io/hitster-kerst/
// Dit adres moet EXACT zo in het Spotify Developer Dashboard staan.
export const REDIRECT_URI = location.origin + location.pathname.replace(/index\.html$/, '');
