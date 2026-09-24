<div align="center">
  <img src="static/favicon.svg" width="150" alt="TheView Logo" />

  <h1>TheView 2.0.2</h1>

  <p>
    <strong>A modern, dynamic, and blazing-fast homelab dashboard.</strong>
    <br />
    No YAML editing. No config files. Pure Web UI.
  </p>

  <p>
    <a href="https://svelte.dev"><img src="https://img.shields.io/badge/SvelteKit-5.0-FF3E00?style=for-the-badge&logo=svelte&logoColor=white" alt="SvelteKit" /></a>
    <a href="https://tailwindcss.com"><img src="https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" /></a>
    <a href="https://orm.drizzle.team/"><img src="https://img.shields.io/badge/SQLite-Drizzle_ORM-003B57?style=for-the-badge&logo=sqlite&logoColor=white" alt="SQLite" /></a>
    <a href="https://ui.shadcn.com/"><img src="https://img.shields.io/badge/shadcn--svelte-latest-000000?style=for-the-badge&logo=shadcnui&logoColor=white" alt="shadcn-svelte" /></a>
    <a href="https://tanstack.com/query"><img src="https://img.shields.io/badge/TanStack_Query-latest-FF4154?style=for-the-badge&logo=reactquery&logoColor=white" alt="TanStack Query" /></a>
    <a href="https://gridstackjs.com/"><img src="https://img.shields.io/badge/Gridstack.js-latest-00b4ff?style=for-the-badge&logo=javascript&logoColor=white" alt="Gridstack.js" /></a>
  </p>
</div>

---

## ✨ Features

**TheView** is a lightweight, highly customizable, and aesthetically pleasing alternative to dashboard projects like Homer, Heimdall, or Dashy. It is built natively for users who want a rich UI without the burden of manual configuration files.

Built with **Svelte 5 Runes**, `shadcn-svelte`, **Tailwind CSS v4**, **TanStack Query**, and powered by **Gridstack.js**, TheView delivers a pristine, highly-polished interface that feels like a native desktop app.

- 📱 **Native Mobile Experience**: Enjoy an optimized mobile view where grids gracefully fallback to native vertical stacking for fluid scrolling and content expansion.
- 🖥️ **100% Web UI Driven**: Forget editing YAML files. Add, edit, remove, and configure categories and services using an intuitive web interface.
- 🍱 **Multi-Grid Bento Layout**: Create distinct grid areas per category, each with its own Title and Widget arrangement. The elegant 12-column Gridstack engine allows components to perfectly adapt to your screen size.
- 📐 **Interactive 2D Drag & Resize**: In Edit Mode, effortlessly resize any service card in true 2D space. Drag items, change their dimensions, and lock them in place. The grid natively handles empty spaces.
- 🔐 **Two-Factor Authentication (2FA)**: Secure your admin panel with TOTP-based 2FA. Fully integrated with your favorite authenticator apps (Google Authenticator, Authy, etc.).
- 🔍 **Hybrid Icon Search Engine**: The built-in icon picker works like a search engine. Start typing to get instant autocomplete suggestions with visual previews directly from the `homarr-labs/dashboard-icons` repository, or fetch millions of icons directly from the Iconify API.
- 📡 **Live Health Checks (Ping)**: Built-in pinging system powered by TanStack Query. Shows live online/offline status with an elegant pulsating glow, and tracks latency (ms) for all your tracked services.
- 📦 **Auto-Discovery Engine**: Seamlessly integrates with your local **Docker socket** and **Nginx Proxy Manager**. TheView automatically finds running containers and active proxy hosts, allowing you to add them in a single click.
- 🔄 **Docker Update Notifications**: Automatically checks if your Docker containers have new versions available on Docker Hub or GHCR by comparing image SHA256 digests.
- ⚡ **Zero Layout-Shift Edit Mode**: Non-intrusive, sliding side panels let you configure services and widgets without disrupting or squishing your beautifully crafted dashboard.
- 🎨 **Advanced Theming & Appearance**: Pick your vibe. Full support for Dark/Light modes. Extensive appearance settings allow toggling categories, service counts, and mobile/desktop-specific layouts.

---

## 🔌 Widget Integrations

TheView goes beyond simple links by offering deep integrations with your favorite self-hosted services via rich, responsive widgets. **Every widget dynamically adapts its internal layout based on its physical GridStack proportions (wide, tall, square, or compact).**

- **Weather (Meteo)**: Real-time weather, hourly, and daily forecasts. Features a matrix layout that perfectly conforms to its aspect ratio. Uses Open-Meteo for blazing-fast geocoding.
- **Docker**: Live container stats (CPU, RAM, Status). Check for updates and issue Start/Stop/Restart commands without leaving the dashboard.
- **qBittorrent**: Real-time speeds, active torrent list with pause/resume controls, and torrent addition via magnet link or `.torrent` file upload.
- **AdGuard Home**: DNS queries and protection controls. Includes a custom scrollable Time Wheel Picker to pause protection for a specific duration.
- **Wg-Easy**: Track active Wireguard VPN clients, toggle connections, view transfer speeds, and download config files or QR Codes.
- **Duplicati**: Live backup monitoring, progress tracking, and the ability to start/stop backup tasks directly.
- **FileBrowser**: Disk usage monitoring visualized with dynamic SVG radial progress bars.
- **Jellyfin**: Live "Now Playing" monitoring with beautiful backdrop UI and playback progression. Library statistics when idle.
- **Beszel**: System stats, CPU, RAM, and Network usage monitoring.
- **Dockhand**: Quick execution of configured docker backup/restore scripts.
- **OpenWRT**: Monitor router health (CPU/RAM/Uptime) and live network interfaces with physical port status (Ping, Speed, Tx/Rx metrics) via ubus RPC.
- **Clock**: A beautifully minimal analog/digital clock widget.

---

## 🚀 Quick Start (Docker)

The recommended and most robust way to deploy TheView is via Docker Compose.

> [!TIP]
> Using `network_mode: host` is highly recommended if you want TheView to easily ping local services on your host machine without complicated Docker bridge routing.

```yaml
services:
  theview:
    image: ghcr.io/g4s01/theview:latest
    container_name: theview_portal
    network_mode: host # Or use standard bridge and ports: - "3001:3001"
    restart: unless-stopped
    volumes:
      - ./data:/app/data
      - /var/run/docker.sock:/var/run/docker.sock:ro # Required for Docker Auto-Discovery
    environment:
      - TZ=Europe/Rome
      - NODE_ENV=production
      - PORT=3001
      - ORIGIN=http://your-homelab-ip:3001
      - SECURE_COOKIE=false # Set to true ONLY if you are accessing via HTTPS
```

### First Access & Admin Setup

1. Launch the container: `docker compose up -d`
2. Navigate to `http://your-homelab-ip:3001` (or your configured `ORIGIN`).
3. Click the login icon ➜] in the top right corner of the navbar to access the **Admin Panel**.
4. By default, there is no password. You will be prompted to set your secure **Admin Password** on your first login.
5. Navigate to the **Discovery tab** to auto-populate your dashboard!

---

## ⚙️ Configuration & Security

TheView stores all state in a robust local SQLite database inside the `/app/data` volume.

> [!IMPORTANT]
> Your dashboard is entirely portable just by backing up the `data/sqlite.db` file!

### 👤 Volume Permissions (PUID/PGID & UMASK)

To avoid permission issues with the mounted `/app/data` volume, TheView supports standard **`PUID`**, **`PGID`**, and **`UMASK`** environment variables. Set them in your `docker-compose.yml` to match your host user (e.g., PUID=1000).

### 🔐 Security & Encryption

All sensitive data (Passwords, API keys, and 2FA secrets) are **strongly encrypted or hashed** (AES-256-GCM / SHA-256) inside the database. The system automatically generates a unique `APP_SECRET` safely stored inside the persistent `/app/data/secret.key` file.

**Privileged Widgets (Access Control):** You can mark any interactive widget as "Privileged" in the Admin settings. This hides the widget from unauthenticated users and entirely blocks the backend proxy API (Fail-Closed `HTTP 401`) preventing unauthorized execution or data leaks.

### 💾 Backup & Restore

Backup or migrate your dashboard directly from the web interface:

1. Go to **Settings > Backup e Ripristino**.
2. Click **ESPORTA** to instantly download your entire SQLite database.
3. You can restore an old backup by uploading it via **IMPORTA**. The dashboard will automatically restart to apply the new database.

---

## 🛠️ Local Development

Want to contribute or run from source?

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

---

## 🧩 Tech Stack

| Layer             | Technology                                           |
| ----------------- | ---------------------------------------------------- |
| **Framework**     | SvelteKit 5 (Runes)                                  |
| **Styling**       | Tailwind CSS v4 + shadcn-svelte                      |
| **Database**      | SQLite via Drizzle ORM                               |
| **Data Fetching** | TanStack Query (Svelte)                              |
| **Drag & Drop**   | Gridstack.js                                         |
| **Icons**         | lucide-svelte + Homarr Dashboard Icons + Iconify API |
| **Encryption**    | AES-256-GCM / SHA-256                                |
| **Deployment**    | Docker / Docker Compose                              |
