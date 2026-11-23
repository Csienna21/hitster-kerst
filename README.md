# 🎄 Muziekkaarten

## Hey mama, dit is voor jou! ✨

Fijne kerst! 🎁

Dit spel heb ik helemaal zelf voor je gemaakt: de kaarten, de tekeningen én de website waarmee je de muziek afspeelt.
De eerste editie staat vol met Disney-liedjes. Je kunt meezingen, raden en vooral samen veel plezier hebben.

Ik hoop dat we er nog heel vaak samen mee gaan spelen. 💙

Liefs,
chantal

---

## Waar gaat het spel over?

**Muziekkaarten** is een muziek-raadspel. Op elke kaart staat een QR-code. Scan je die met je telefoon, dan speelt het nummer af. Je ziet niet welk nummer het is.
Iedereen raadt in welk **jaar** het nummer uitkwam. Op de achterkant van de kaart staan het jaartal, de titel, de film en de artiest.

Speel het spel via deze website:

### 👉 https://csienna21.github.io/hitster-kerst/

---

## Wat heb je nodig?

- Je **iPhone** met de **Spotify-app**, ingelogd met je eigen Spotify Premium-account
- **Internet** (wifi of mobiele data)
- De **kaarten**
- Optioneel: een **bluetooth-speaker** voor beter geluid. Verbind die gewoon zoals altijd met je telefoon.

---

## De eerste keer (eenmalig)

1. Open **Safari** en ga naar **https://csienna21.github.io/hitster-kerst/**
2. Tik op **Inloggen met Spotify**, log in met je Spotify-account en tik op **Akkoord**.
3. Bewaar de pagina, zodat je hem makkelijk terugvindt: tik op het **Deel-icoon** (vierkantje met pijl omhoog) en kies **Zet op beginscherm**.
   *Vraagt het spel daarna nog een keer om in te loggen? Doe dat dan één keer; daarna onthoudt hij het.*
4. De eerste keer vraagt het spel of het de **camera** mag gebruiken. Tik op **Sta toe**.

---

## Zo speel je

### Voorbereiding
- Schud de kaarten en leg ze op een stapel, **QR-code naar boven**.
- Iedereen krijgt één kaart met het **jaartal naar boven**. Dat is het begin van je eigen **tijdlijn**.

### Een beurt
1. Pak de bovenste kaart van de stapel. **Kijk niet naar de achterkant!**
2. Tik op **Scan kaart** en houd de camera boven de QR-code. Het nummer begint vanzelf.
3. Luister en raad: is dit nummer ouder of nieuwer dan de kaarten in je tijdlijn? Leg de kaart op de plek waar jij denkt dat hij hoort.
4. Draai de kaart om:
   - ✅ **Goed gelegd?** Dan mag je de kaart houden.
   - ❌ **Fout?** Dan gaat de kaart uit het spel.
5. Tik op **Volgende kaart scannen**. De volgende speler is aan de beurt.

### Wie wint?
Wie als eerste **10 kaarten** goed in zijn tijdlijn heeft, wint! 🏆
*(Kort spelletje? Speel tot 5 kaarten. Lang gezellig avondje? Ga tot 15.)*

### De knoppen tijdens het spelen

| Knop | Wat doet het? |
|---|---|
| **Grote ronde knop** | Pauzeren en weer verder spelen |
| **Start op een willekeurig moment** | Het volgende nummer begint ergens in het midden. Zo verraadt het intro niets en wordt het lastiger. |
| **Volgende kaart scannen** | Stopt het nummer en opent de camera voor de volgende kaart |

---

## 💡 Handige tips

- **Open de Spotify-app even voordat je begint.** De iPhone zet Spotify na een tijdje in "slaapstand". Is dat zo, dan zegt het spel *"Spotify slaapt nog"*. Open Spotify dan even, ga terug naar het spel, en het nummer begint vanzelf.
- **Leg de telefoon met het scherm naar beneden** terwijl het nummer speelt. Het vergrendelscherm en de bovenkant van het scherm laten namelijk de titel van het nummer zien.
- **Open de Spotify-app niet tijdens een nummer.** Daar staat ook welk nummer er speelt.
- Het **volume** regel je gewoon met de knoppen op de zijkant van je telefoon.

---

## Er verschijnt een melding. Wat nu?

| Melding | Oplossing |
|---|---|
| **Spotify slaapt nog** | Tik op **Open Spotify**, ga daarna terug naar het spel. Het nummer start vanzelf. |
| **Geen verbinding** | Controleer of de wifi of mobiele data aan staat, en tik op **Opnieuw proberen**. |
| **Opnieuw inloggen** | Tik op **Inloggen met Spotify** en log in zoals de eerste keer. |
| **Onbekende code** | De QR-code is niet goed gelezen. Probeer het opnieuw met wat meer licht en houd de telefoon stil. |
| **Camera niet beschikbaar** | Ga naar **Instellingen › Safari › Camera** en kies **Sta toe**. |
| **Spotify Premium nodig** | Controleer of je in Spotify met je eigen (Premium-)account bent ingelogd. |
| **Nog geen toegang** | Bel of app mij even, dan los ik het op. 😊 |

---

## Hoe werkt het achter de schermen?

Voor wie nieuwsgierig is: een korte uitleg van de techniek.

**De kaarten.** Elke QR-code bevat een gewone Spotify-link naar een nummer (bijvoorbeeld `open.spotify.com/track/...`). Die link is uniek per nummer.

**De website.** Het spel is een eenvoudige webpagina, gehost op GitHub Pages. Er is geen app-installatie nodig en er draait geen eigen server. Als je een kaart scant, haalt de website de unieke code van het nummer uit de link. Titel, artiest en albumhoes worden bewust **nergens** opgevraagd of getoond.

**Het afspelen.** De website stuurt via de officiële Spotify Web API een opdracht naar de **Spotify-app op je eigen telefoon** (via *Spotify Connect*): "speel dit nummer af". Daardoor gebruikt het spel gewoon je eigen Spotify-account en de geluidskwaliteit van Spotify zelf. Het nummer staat op herhalen, zodat Spotify na afloop niet doorspeelt naar een ander (misschien herkenbaar) nummer.

**Inloggen en privacy.** Je logt in via de officiële inlogpagina van Spotify (OAuth met PKCE). De website krijgt nooit je wachtwoord te zien en vraagt alleen toestemming om het afspelen te bedienen. Je inloggegevens worden alleen op je eigen telefoon bewaard. Er wordt niets naar een andere server gestuurd.

**Nieuwe edities.** Het spel werkt met elk nummer op Spotify. Een volgende editie (kerst, jaren 80, Nederlandstalig…) is dus alleen een kwestie van nieuwe kaarten maken.

---

<details>
<summary><strong>🛠️ Voor de maker: technische installatie</strong></summary>

### Benodigdheden
- GitHub-account (`Csienna21`), repository `hitster-kerst`, GitHub Pages aan (branch `main`, map `/ (root)`)
- Spotify Premium voor de eigenaar van de developer-app (anders stopt de app met werken) én voor de speler

### Spotify Developer-app
1. Ga naar <https://developer.spotify.com/dashboard> › **Create app**.
2. Redirect URI, exact zo (met `/` aan het eind): `https://csienna21.github.io/hitster-kerst/`
3. API: **Web API**.
4. De Client ID staat in [`js/config.js`](js/config.js). Hij is niet geheim; met PKCE is geen Client Secret nodig.

### Spelers toegang geven
Development Mode staat maximaal **5 gebruikers** toe. Voeg ze toe via de app › **Settings** › **User Management**, met naam en het e-mailadres van hun Spotify-account.

### Bestanden

| Pad | Inhoud |
|---|---|
| `index.html` | Pagina en tekeningen (inline SVG) |
| `css/style.css` | Vormgeving |
| `js/app.js` | Schermen, scannen, meldingen |
| `js/auth.js` | Spotify-login (Authorization Code + PKCE, tokens verversen) |
| `js/player.js` | Afspelen via de Web API (Spotify Connect) |
| `js/spotify-link.js` | Track-ID uit de QR-code halen |
| `vendor/html5-qrcode.min.js` | QR-scanner (html5-qrcode 2.3.8) |
| `tests/` | Tests voor de link-herkenning: `npm test` (Node.js) |

</details>
