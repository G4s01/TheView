# Changelog

Tutte le modifiche più significative a **TheView** saranno documentate in questo file.

## [2.0.3] - 2026-09-23

### 📱 Esperienza Mobile e Responsività
- **Rivoluzione del Layout Mobile:** Su dispositivi mobili, l'interfaccia si è definitivamente svincolata dal motore Gridstack. Ora le card e i widget adottano un layout nativo in colonna (Flexbox verticale), garantendo una fluidità perfetta e uno scorrimento organico.
- **Contenuti Dinamici:** Su schermi piccoli, i widget e le liste (es. Dockhand, Docker) non sono più vincolati ad altezze rigide e si ridimensionano in maniera naturale adattandosi al loro contenuto, eliminando antiestetici spazi vuoti.
- **Topbar Mobile Ottimizzata:** Se è presente o visibile una sola griglia, l'ingombrante barra di navigazione secondaria (Indice Griglie) scompare. Il titolo personalizzato (es. "HOME") viene iniettato elegantemente nella Topbar principale di fianco al logo (a patto che tu l'abbia impostato), risparmiando spazio prezioso.
- **Scrollbar Visibili:** Introdotte scrollbar semi-trasparenti personalizzate (per Webkit) per rendere immediatamente evidente la possibilità di scorrimento all'interno delle liste contenute nei widget (come Dockhand e Docker).

### 🎨 Design & Widget
- **Jellyfin Widget (Stato Idle):** Ridisegnata completamente la schermata a riposo. Rimosso il logo gigante e il testo ridondante a favore di una moderna griglia 2x2 che dà il massimo risalto alle statistiche della libreria (Film, Serie TV, Brani, Utenti).
- **Meteo Widget:** Risolto un problema di calcolo dimensionale che inibiva la visualizzazione delle previsioni orarie sui dispositivi mobili a causa della natura fluida (senza altezze predefinite) delle card su smartphone.

### 🐛 Bug Fix
- **Compilazione Svelte 5:** Corretto un grave errore di "shadowing" reattivo (`$state` vs `let state`) nel Widget Duplicati, e sanata la dichiarazione mancante della prop `hideHeader` in vari widget integrati che rischiavano di mandare in crash l'intera griglia Desktop.

## [2.0.2] - 2026-09-23

### ✨ Nuove Funzionalità
- **Nuovo Widget Integrato: Jellyfin!** 
  - Visualizzazione in tempo reale di ciò che è in riproduzione (Now Playing), con sfondo sfocato immersivo basato sul backdrop del film/episodio.
  - Informazioni dettagliate: utente, titolo, stagione/episodio, barra di progressione temporale.
  - Statistiche libreria (Film, Serie, Canzoni) in modalità IDLE (quando non c'è nulla in riproduzione).
  - Piena responsività al formato della griglia (layout largo o quadrato).
- **Nuovo Componente `UrlInput`**: Adesso le impostazioni per gli indirizzi web di tutti i widget (Jellyfin, qBittorrent, AdGuard, ecc.) godono di un nuovo e comodo selettore grafico `http://` / `https://` al posto del classico campo di testo generico.

### 🐛 Bug Fix
- **Drag & Drop (GridStack)**: Risolto un problema per cui la tendina manuale (Aggiungi Servizio) e il pannello di aggiunta Widget Standalone "tagliavano" o nascondevano i menu a discesa (dropdown/combobox) a causa di regole di overflow restrittive ereditate dalle vecchie card.
- **qBittorrent Widget**: Risolto un bug critico che impediva l'inserimento corretto dei **Magnet Link** tramite tasto Invio o bottone dedicato. Il payload dell'API è stato convertito da `multipart/form-data` a `application/x-www-form-urlencoded` nel proxy interno.
- **FileBrowser Widget**: Sistemazione estetica. L'indicatore dei GB in uso e totali è stato spostato centralmente e integrato in maniera elegante all'interno della barra circolare SVG (anziché affiancato disordinatamente all'esterno).
- **Crittografia API Key**: Risolta la mancata decrittografia/crittografia del campo dell'API Key per Jellyfin nel pannello Admin che portava l'API proxy a generare chiavi invalide.
- **Header Autenticazione Jellyfin**: Migrazione dell'header storico `X-Emby-Token` a favore dell'ufficiale `Authorization: MediaBrowser Token="..."` per risolvere errori **401 Unauthorized** (silenziosi) con le versioni moderne di Jellyfin.

### ♻️ Refactoring & Sicurezza
- Pulizia estensiva dell'architettura e disaccoppiamento controlli multimediali ridondanti nel proxy Jellyfin per mantenere un'interfaccia pulita e priva di bottoni non reattivi.
