# Pianificazione Prossime Feature (TheView v2)

Questa roadmap raccoglie gli step per implementare le nuove funzionalità richieste per la gestione dinamica avanzata, personalizzazione e integrazione con NPM.

## 1. Sicurezza e Modalità "Quick Edit" (Chiave Inglese)

- [x] Creare un pulsante "Chiave Inglese" (Edit Mode) nella navbar visibile a tutti.
- [x] Al click della chiave inglese, mostrare un modal per inserire la password di amministrazione (da salvare protetta in `.env` o DB).
- [x] Una volta sbloccata la sessione, il pulsante chiave inglese rimane attivo e fa comparire:
  - [x] L'icona a ingranaggio per accedere alla rotta `/admin` completa.
  - [x] Un pulsante "Esci dalla modalità modifica" per invalidare la sessione corrente.
- [x] In Edit Mode, abilitare bottoni rapidi sulle Service Card e Categorie per:
  - [x] Drag-and-drop (ordinamento dinamico sul posto).
  - [x] Modifica rapida in-place di nome, url, icona.

## 2. Gestione Avanzata Categorie e Servizi

- [x] Espandere l'interfaccia Admin (`/admin`) per supportare completamente il CRUD delle **Categorie** (Aggiungi, Rinomina, Elimina, Cambia Ordine).
- [x] Integrare la logica di riordino (campo `order` o `position` nel database SQLite).

## 3. Temi Personalizzati

- [ ] Creare un sistema per caricare combinazioni di colori o temi CSS (es. Dracula Theme, Nord, Catppuccin).
- [ ] Salvare la preferenza di tema dell'utente nel `localStorage` o nei Cookie in modo che sia persistente.
- [ ] Aggiungere un menu a tendina o una finestra modale per la selezione rapida del tema.

## 4. Integrazione Nginx Proxy Manager (NPM) e Docker

- [ ] Sviluppare un servizio in background (cron o task) in Node.js che interroghi le API di Nginx Proxy Manager (o legga i suoi file SQLite) per scoprire nuovi host proxy configurati.
- [ ] Sviluppare un'interrogazione al socket Docker (già montato in compose) per leggere quali container sono attivi e avere metadati.
- [ ] Creare una tab "Discovery" nell'Admin Panel per vedere i servizi non ancora in dashboard e permettere di aggiungerli con 1 click.
