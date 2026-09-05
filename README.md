<div align="center">
  <img src="static/favicon.svg" width="150" alt="TheView Logo" />

  <h1>TheView</h1>

  <p>
    <strong>A modern, dynamic, and blazing-fast homelab dashboard.</strong>
    <br />
    No YAML editing. No config files. Pure Web UI.
  </p>

  <p>
    <a href="https://svelte.dev"><img src="https://img.shields.io/badge/SvelteKit-5.0-FF3E00?style=for-the-badge&logo=svelte&logoColor=white" alt="SvelteKit" /></a>
    <a href="https://tailwindcss.com"><img src="https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" /></a>
    <a href="https://orm.drizzle.team/"><img src="https://img.shields.io/badge/SQLite-Drizzle_ORM-003B57?style=for-the-badge&logo=sqlite&logoColor=white" alt="SQLite" /></a>
    <a href="https://hub.docker.com/"><img src="https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker" /></a>
  </p>
</div>

---

## ✨ Features

**TheView** is conceived as a lightweight, highly customizable, and aesthetically pleasing alternative to dashboard projects like Homer, Heimdall, or Dashy. It is built natively for users who want a rich UI without the burden of manual configuration files.

- 🖥️ **100% Web UI Driven**: Forget editing YAML files. Add, edit, remove, and reorder services using an intuitive drag-and-drop web interface.
- 🔍 **Auto-Discovery Engine**: Seamlessly integrates with your local **Docker socket** and **Nginx Proxy Manager**. TheView automatically finds running containers and active proxy hosts, allowing you to add them in a single click.
- 🎨 **Smart Brand Icons & Glassmorphism**: Automatically fetches SVG icons from *Simple-Icons* based on the service name. It extracts the brand's primary color and applies a beautiful tinted glassmorphism background to the card.
- 📡 **Live Health Checks (Ping)**: Built-in pinging system. Shows live online/offline status and latency (ms) for all your tracked services with smooth pulsing indicators.
- ⚡ **In-Place Quick Edit**: Click the gear icon on any service card, and it seamlessly expands into a fully functional form directly on the grid, without annoying popups.
- 🔌 **Interactive Widgets**: Rich integrations for your favorite services (e.g., live qBittorrent download/upload speeds) directly visible on the service cards.
- 🌙 **Advanced Theming**: Pick your vibe. Full support for Dark/Light modes with premium community themes including **Dracula** (Classic, Alucard, Soft) and **Catppuccin** (Latte, Macchiato, Frappé).
- 📱 **Fully Responsive**: Carefully designed to look stunning and function perfectly on desktops, tablets, and smartphones.

---

## 🚀 Quick Start (Docker)

The recommended and most robust way to deploy TheView is via Docker Compose.

### Basic Setup (Host Network - Recommended)

Using `network_mode: host` is highly recommended if you want TheView to easily ping local services on your host machine without complicated Docker bridge routing.

```yaml
services:
  theview:
    image: ghcr.io/g4s01/theview:latest
    container_name: theview_portal
    network_mode: host
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

### Advanced Setup (Bridge Network)

If you prefer to keep TheView in a custom Docker bridge network (e.g., behind a reverse proxy like NGINX Proxy Manager or Traefik):

```yaml
services:
  theview:
    image: ghcr.io/g4s01/theview:latest
    container_name: theview_portal
    restart: unless-stopped
    ports:
      - "3001:3001"
    volumes:
      - ./data:/app/data
      - /var/run/docker.sock:/var/run/docker.sock:ro
    environment:
      - TZ=Europe/Rome
      - NODE_ENV=production
      - PORT=3001
      # Essential when running behind a proxy:
      - ORIGIN=https://dashboard.yourdomain.com
```

### First Access & Admin Setup
1. Launch the container: `docker compose up -d`
2. Navigate to `http://your-homelab-ip:3001` (or your configured `ORIGIN`).
3. Click the unlock icon 🔓 in the top right corner of the navbar to access the **Admin Panel**.
4. By default, there is no password. You will be prompted to set your secure **Admin Password** on your first login.

---

## ⚙️ Configuration & Secrets

TheView stores all state (Categories, Services, uploaded Icons, and UI Settings) in a local SQLite database inside the `/app/data` volume. This means your dashboard is entirely portable just by backing up the `data/` folder!

### Nginx Proxy Manager Discovery
To enable automatic discovery of your Nginx Proxy Manager hosts:
1. Go to **Settings** in the Admin panel.
2. Enter your NPM instance URL (e.g., `http://192.168.1.100:81`).
3. Enter your NPM Email and Password.
4. Navigate to the **Discovery** tab to see your proxy hosts merged with your Docker containers!

### qBittorrent Widget Integration
To enable live torrent stats (download/upload speeds, active torrents) directly on a service card:
1. Go to **Settings** in the Admin panel and open the **Widget Integrations** section.
2. Add your qBittorrent credentials (URL, Username, Password).
3. In the Home dashboard, edit or create a service and select `qBittorrent` from the Widget dropdown.

---

## 🛠️ Local Development

Want to contribute or run from source? TheView is built on SvelteKit 5 and Tailwind CSS v4.

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

To update the database schema after making changes to `src/lib/server/db/schema.ts`:
```bash
npx drizzle-kit push
```

---

## 🛡️ License & Credits

TheView is open-source and free to use. Built with ❤️ for the self-hosting community.
Icons automatically fetched and processed thanks to [Simple Icons](https://simpleicons.org/).
