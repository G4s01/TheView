# TheView - Homelab Portal

TheView is a modern, responsive, and blazing fast homelab dashboard built with SvelteKit, Tailwind CSS, and SQLite. It serves as a drop-in replacement for traditional dashboards like `gethomepage/homepage`, offering a dynamic Admin UI and built-in widget integrations.

## ✨ Features

- **Modern UI/UX**: Built with Svelte 5 and Tailwind CSS v4. Includes full Dark Mode support and responsive grid layouts.
- **Dynamic Admin Panel**: Manage your services (Create, Read, Update, Delete) directly from the `/admin` web interface. No YAML editing required!
- **Health Checks**: Built-in pinging system. Shows live online/offline status and latency (ms) for all your tracked services.
- **Auto-Themed Icons**: Automatically fetches SVGs from Simple-Icons based on the service name, and intelligently tints the card background to match the brand's primary color.
- **Advanced Widgets**: Built-in proxy API widgets for popular services (e.g., live qBittorrent download/upload speeds) directly on the cards.

## 🚀 Deployment (Docker)

The recommended way to deploy TheView is via Docker Compose.

1. Ensure you have Docker and Docker Compose installed.
2. Create a `docker-compose.yml` file:

```yaml
services:
  theview:
    image: ghcr.io/G4s01/theview:main # Sostituisci con il tuo username se hai forkato la repo
    container_name: theview_portal
    network_mode: host
    restart: unless-stopped
    volumes:
      - ./data:/app/data
      - /var/run/docker.sock:/var/run/docker.sock:ro
    environment:
      - TZ=Europe/Rome
      - NODE_ENV=production
      - PORT=3001
      - ORIGIN=https://tuo-dominio.duckdns.org
      - DB_PATH=/app/data/sqlite.db
      # - QBIT_USERNAME=admin
      # - QBIT_PASSWORD=tua_password
      # - QBIT_URL=http://172.17.0.1:8080
```

3. Start the container:

```bash
docker compose up -d
```

## 🛠️ Local Development

If you want to modify the source code or run it locally:

```bash
# Install dependencies
npm install

# Setup database (SQLite)
npm run db:push
npm run db:seed

# Start development server
npm run dev
```

## 🗄️ Database

The project uses `better-sqlite3` and `drizzle-orm`. The database schema is stored in `src/lib/server/db/schema.ts`.
To apply migrations after changing the schema, run `npx drizzle-kit push`.

## 🤖 CI/CD

This repository includes a GitHub Actions workflow that automatically builds and pushes the Docker image to GitHub Container Registry (GHCR) upon pushing to the `main` branch.
