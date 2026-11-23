# Muziekkaarten 🎄

Een zelfgemaakt muziek-raadspel: scan een kaart, het nummer speelt (zonder titel of artiest te tonen) en iedereen raadt het jaar.
Werkt met elke kaart waarvan de QR-code een Spotify-link naar een nummer bevat.

Webadres: **https://csienna21.github.io/hitster-kerst/**

---

## Deel 1 — Instellen (voor de maker)

Je hebt nodig: een GitHub-account (`Csienna21`), Spotify Premium voor jezelf **en** voor mama.

### Stap 1: Zet de site op GitHub Pages

1. Ga naar <https://github.com/new>.
2. Repository name: `hitster-kerst` — kies **Public** — klik **Create repository**.
3. Upload alle bestanden uit deze map (sleep ze in “uploading an existing file”), of met git:
   ```
   git init
   git add .
   git commit -m "Muziekkaarten"
   git branch -M main
   git remote add origin https://github.com/Csienna21/hitster-kerst.git
   git push -u origin main
   ```
4. In de repository: **Settings › Pages** › bij *Source* kies **Deploy from a branch**, branch **main**, map **/ (root)** › **Save**.
5. Na 1–2 minuten staat de site op `https://csienna21.github.io/hitster-kerst/`.

### Stap 2: Maak de Spotify Developer-app

1. Ga naar <https://developer.spotify.com/dashboard> en log in met **jouw** Spotify-account (Premium).
2. Klik **Create app** en vul in:
   - **App name:** `Muziekkaarten` (mag iets anders zijn)
   - **App description:** `Muziekspel voor thuis`
   - **Redirect URI:** precies dit, inclusief de `/` aan het eind:
     ```
     https://csienna21.github.io/hitster-kerst/
     ```
     en klik **Add**.
   - Bij *Which API/SDKs are you planning to use?* vink **Web API** aan.
   - Ga akkoord met de voorwaarden › **Save**.
3. Open de app › **Settings** › kopieer de **Client ID**.
4. Plak de Client ID in [`js/config.js`](js/config.js):
   ```js
   export const CLIENT_ID = 'jouw-client-id-hier';
   ```
   en upload/push dat bestand opnieuw naar GitHub.

> De Client ID is niet geheim. Er is géén Client Secret nodig (de app gebruikt PKCE).

### Stap 3: Geef mama toegang

Een app in *Development Mode* werkt alleen voor maximaal 5 accounts die je zelf toevoegt.

1. In het dashboard: open de app › **User Management**.
2. Vul mama’s **naam** en het **e-mailadres van haar Spotify-account** in › **Add user**.
   (Het e-mailadres moet precies hetzelfde zijn als waarmee ze bij Spotify inlogt. Check dit in de Spotify-app via *Instellingen › Account*.)
3. Wil je zelf ook testen met jouw account? Voeg jezelf dan ook toe.

### Stap 4: Testen

1. Open op de telefoon **Safari** (iPhone) of **Chrome** (Android) en ga naar `https://csienna21.github.io/hitster-kerst/`.
2. Tik **Inloggen met Spotify** en sta de toegang toe.
3. Open de Spotify-app even, ga terug naar het spel, tik **Scan kaart** en scan een kaart.

### Goed om te weten

- **Spotify Premium** is nodig voor jou (eigenaar van de app; anders stopt de app met werken) en voor mama (afspelen via de app werkt alleen met Premium).
- **iPhone:** als Spotify lang op de achtergrond staat, “slaapt” de app en kan het spel hem niet bereiken. Het spel vraagt dan om Spotify even te openen en start het nummer vanzelf zodra je terugkomt.
- Ontwikkelaarstest van de link-herkenning: `npm test` (Node.js nodig).

---

## Deel 2 — Zo speel je (voor mama)

*Volgt in de volgende versie.*
