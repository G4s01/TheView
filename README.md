<p align="center">
  <img src="static/favicon.svg" width="150" alt="TheView Logo" />
</p>

<h1 align="center">TheView</h1>

<p align="center">
  <strong>A modern, dynamic, and blazing fast homelab dashboard.</strong>
  <br />
  No YAML editing. No config files. Pure Web UI.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/SvelteKit-5.0-FF3E00?style=for-the-badge&logo=svelte&logoColor=white" alt="SvelteKit" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/SQLite-Drizzle_ORM-003B57?style=for-the-badge&logo=sqlite&logoColor=white" alt="SQLite" />
  <img src="https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker" />
</p>

---

## ✨ Features

**TheView** is conceived as a lightweight, aesthetically pleasing, and dynamic alternative to projects like Homer, Heimdall, or Dashy. 

- **100% Web UI Driven**: Forget editing YAML files. Add, edit, remove, and reorder services using an intuitive drag-and-drop web interface.
- **Auto-Discovery Engine**: Seamlessly integrates with your local **Docker socket** and **Nginx Proxy Manager**. TheView automatically finds running containers and active proxy hosts, allowing you to add them in a single click.
- **Smart Brand Icons**: Automatically fetches SVG icons from *Simple-Icons* based on the service name. It then extracts the brand's primary color and applies a beautiful tinted glassmorphism background to the card.
- **Live Health Checks**: Built-in pinging system. Shows live online/offline status and latency (ms) for all your tracked services with pulsing indicators.
- **In-Place Quick Edit**: Click the gear icon on any service card, and it seamlessly expands into a fully functional form directly on the grid, without annoying popups.
- **Interactive Widgets**: Rich integrations for your favorite services (e.g., live qBittorrent download/upload speeds) directly visible on the service cards.
- **Advanced Theming**: Pick your vibe. Full support for Dark/Light modes with premium community themes including **Dracula** (Classic, Alucard) and **Catppuccin** (Latte, Macchiato).

---

## 🚀 Quick Start (Docker)

The recommended and most robust way to deploy TheView is via Docker Compose.

```yaml
services:
  theview:
    image: ghcr.io/g4s01/theview:latest
    container_name: theview_portal
    network_mode: host  # Recommended for accurate local network pinging
    restart: unless-stopped
    volumes:
      - ./data:/app/data
      - /var/run/docker.sock:/var/run/docker.sock:ro # Required for Docker Auto-Discovery
    environment:
      - TZ=Europe/Rome
      - NODE_ENV=production
      - PORT=3001
      - ORIGIN=http://your-homelab-ip:3001 # Or your public domain
```

### 1. Launch the Container
```bash
docker compose up -d
```

### 2. First Access & Admin Setup
Navigate to `http://your-homelab-ip:3001`.
Click the unlock icon 🔓 in the top right corner to access the **Admin Panel**.
By default, there is no password. You will be prompted to set your secure Admin Password on the first login.

---

## ⚙️ Configuration & Secrets

TheView stores all state (Categories, Services, uploaded Icons, and Settings) in a local SQLite database inside the `/app/data` volume. This means your dashboard is entirely portable just by backing up the `data/` folder!

### Nginx Proxy Manager Discovery
To enable NPM discovery:
1. Go to **Settings** in the Admin panel.
2. Enter your NPM instance URL (e.g., `http://127.0.0.1:81`).
3. Enter your NPM Email and Password.
4. Navigate to the **Discovery** tab to see your proxy hosts!

### qBittorrent Widget
To enable live torrent stats on a service card:
1. Create a service and set its widget to `qBittorrent`.
2. Add your qBittorrent credentials to your `docker-compose.yml` environment:
   - `QBIT_USERNAME=admin`
   - `QBIT_PASSWORD=adminadmin`
   - `QBIT_URL=http://172.17.0.1:8080`

---

## 🛠️ Local Development

Want to contribute or run from source? TheView is built on SvelteKit 5.

```bash
# Clone the repo
git clone https://github.com/g4s01/TheView.git
cd TheView

# Install dependencies
npm install

# Setup local SQLite database
npm run db:push
npm run db:seed

# Start development server
npm run dev
```

To update the database schema after making changes to `src/lib/server/db/schema.ts`, run `npx drizzle-kit push`.

---

## 🛡️ License & Credits

TheView is open-source and free to use. Built with ❤️ for the self-hosting community.
Icons provided by [Simple Icons](https://simpleicons.org/).
