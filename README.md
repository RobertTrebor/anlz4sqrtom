# anlz4sqr

Web-App zum Auswerten der eigenen Swarm-Check-ins (Foursquare): Historie, Karte, Auswertungen,
Kommentare/Fotos und eine Ortssuche.

Neufassung der alten Java-EE-/JSF-App. Der alte Stand liegt unverändert auf dem Branch `master`.

## Technik

- Next.js (App Router) + React + TypeScript
- Karte: Leaflet mit OpenStreetMap-Kacheln (kein Google-Maps-Schlüssel nötig)
- Keine Datenbank: Check-ins werden im Browser (`localStorage`) zwischengespeichert

## Welche Foursquare-API wofür

| Funktion | API | Zugang |
|---|---|---|
| Login | OAuth 2 (`foursquare.com/oauth2/…`) | Client-ID + Client-Secret |
| Check-in-Historie | v2 `users/self/checkins` | OAuth-Token des Nutzers |
| Kommentare/Fotos | v2 `checkins/{id}` | OAuth-Token des Nutzers |
| Ortssuche | Places API `places-api.foursquare.com/places/search` | Service Key |

Die Aufrufe laufen ausschließlich serverseitig (`src/app/api/*`); Secret, Service Key und Token
erreichen den Browser nie. Das Token liegt in einem httpOnly-Cookie.

## Einrichtung

1. In der [Foursquare Developer Console](https://foursquare.com/developers/) ein Projekt anlegen.
2. OAuth-Zugangsdaten (Client-ID/Secret) erzeugen und als Redirect-URL
   `http://localhost:3000/api/auth/callback` eintragen.
3. Für die Ortssuche einen Service Key erzeugen.
4. `.env.example` nach `.env.local` kopieren und die Werte eintragen.

```bash
npm install
npm run dev        # http://localhost:3000
```

Ohne Zugangsdaten lässt sich die Oberfläche über „Demo-Daten ansehen“ mit erfundenen Check-ins ausprobieren.

Weitere Befehle: `npm test`, `npm run typecheck`, `npm run build`.

## Deployment

Läuft auf jedem Node-Host (`npm run build && npm start`) oder z. B. auf Vercel. Dort die vier
Umgebungsvariablen setzen und `FSQ_REDIRECT_URI` auf `https://<deine-domain>/api/auth/callback`
stellen – dieselbe URL muss in der Developer Console eingetragen sein.

## Noch nicht gegen die echte API geprüft

Die App wurde ohne Foursquare-Zugang entwickelt. Getestet sind Auswertungslogik und das Einlesen der
Antwortformate (Unit-Tests) sowie die Oberfläche mit Demo-Daten. Beim ersten echten Lauf bitte prüfen:

- Login: ob Foursquare den `state`-Parameter zurückgibt (der Callback kommt mit beidem zurecht).
- Check-ins: ob dein Konto die v2-Endpunkte ohne Zahlungsdaten nutzen darf (Fehler erscheinen im Klartext).
- Ortssuche: ob die Kategorie-IDs aus `src/data/categories.json` (Stand der alten App) noch gelten.

## Sicherheitshinweis zum alten Stand

Auf `master` sind in `fs.properties` eine Client-ID samt Secret und in `index.xhtml` ein
Google-Maps-Schlüssel eingecheckt. Das Repository ist öffentlich – diese Schlüssel bitte in den
jeweiligen Konsolen widerrufen bzw. neu erzeugen.
