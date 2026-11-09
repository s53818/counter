# Rep Counter (PWA)

Counter-App zum Mitzählen von Wiederholungen. Reines HTML/CSS/JS, offline-fähig, Daten nur lokal (localStorage).

## Dateien
`index.html`, `style.css`, `app.js`, `sw.js`, `manifest.webmanifest`, `icon.svg`, PNG-Icons (`apple-touch-icon.png`, `icon-192.png`, `icon-512.png`, `icon-maskable-512.png`), `generate-icons.html`, `.nojekyll`.
Die PNG-Icons liegen bereits bei. Anderes Motiv gewünscht? `icon.svg` ändern, `generate-icons.html` öffnen und die PNGs neu herunterladen.

## 1. Repository anlegen
1. Auf github.com: **New repository** (z. B. `counter`, Public).
2. **uploading an existing file** → alle Dateien (auch `.nojekyll`) hochladen → **Commit changes**.
   (Versteckte Dateien am Mac im Finder mit ⇧⌘. anzeigen.)

## 2. GitHub Pages aktivieren
**Settings → Pages → Build and deployment → Deploy from a branch → Branch `main` / `/ (root)` → Save.**
Nach ca. 1 Minute läuft die App unter `https://<user>.github.io/<repo>/`.

## 3. Auf dem iPhone installieren
1. Die URL in **Safari** öffnen.
2. **Teilen-Symbol → „Zum Home-Bildschirm“ → Hinzufügen**.
3. Über das Home-Bildschirm-Icon starten (läuft dann vollbild und offline).

## 4. Updates veröffentlichen
1. Dateien ändern und hochladen.
2. In `sw.js` `CACHE_VERSION` erhöhen (`"v1"` → `"v2"`), sonst liefert der Cache die alte Version.
3. Beim nächsten Start erscheint oben „Neue Version verfügbar – Neu laden“.

## Backup
Tab **Backup → Exportieren** speichert eine JSON-Datei (Teilen-Dialog → „In Dateien sichern“). **Importieren** ersetzt die aktuellen Daten.
Hinweis: iOS kann Website-Daten löschen, wenn die App lange nicht genutzt wird – daher regelmäßig exportieren.

## Anpassen
- Farben/Layout: Variablen oben in `style.css`.
- Datenformat: `app.js` (`STORE_KEY`, `state`).
