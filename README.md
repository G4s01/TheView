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
    <a href="https://ui.shadcn.com/"><img src="https://img.shields.io/badge/shadcn--svelte-latest-000000?style=for-the-badge&logo=shadcnui&logoColor=white" alt="shadcn-svelte" /></a>
    <a href="https://tanstack.com/query"><img src="https://img.shields.io/badge/TanStack_Query-latest-FF4154?style=for-the-badge&logo=reactquery&logoColor=white" alt="TanStack Query" /></a>
  </p>
</div>

---

## ✨ Features

**TheView** is a lightweight, highly customizable, and aesthetically pleasing alternative to dashboard projects like Homer, Heimdall, or Dashy. It is built natively for users who want a rich UI without the burden of manual configuration files.

Built with **Svelte 5 Runes**, `shadcn-svelte`, **Tailwind CSS v4**, and **TanStack Query**, TheView delivers a pristine, highly-polished interface that feels like a native desktop app.

- 🖥️ **100% Web UI Driven**: Forget editing YAML files. Add, edit, remove, and reorder categories and services using an intuitive drag-and-drop web interface.
- 🍱 **Bento Grid Design**: A beautiful, modern Bento Box layout with responsive Flexbox wrapping. Cards can flexibly span 1x1, 1x2, 2x1, or 2x2 blocks that perfectly adapt to your screen size. Cells dynamically resize to fit widget content — no scrollbars, no clipping.
- 📐 **Interactive Drag & Resize**: In Edit Mode, you can effortlessly resize any service card by dragging its borders (top, bottom, left, right) or the bottom-right corner to snap it into different dimensions!
- 🧱 **Blank Spacer Cards**: Structure your dashboard exactly how you want it. In Edit Mode, you can inject functional "Spacer" cards in empty slots. Spacers can be dynamically resized in all directions up to an ultra-wide **4x2 format** (unlike regular widgets restricted to 2x2).
- 🔀 **Drag & Drop Reordering**: Full drag-and-drop reordering powered by `svelte-dnd-action`. In edit mode, spacer items allow free vertical placement — stack services across multiple rows even when there aren't enough items to fill a row.
- 🔐 **Two-Factor Authentication (2FA)**: Secure your admin panel with TOTP-based 2FA. Fully integrated with your favorite authenticator apps (Google Authenticator, Authy, etc.) for maximum security.
- 🔍 **Hybrid Icon Search Engine**: The built-in icon picker works like a search engine. Start typing to get instant autocomplete suggestions with visual previews directly from the `homarr-labs/dashboard-icons` repository, **or fetch millions of icons directly from the Iconify API**. You can also paste a custom direct URL.
- 📡 **Live Health Checks (Ping)**: Built-in pinging system powered by TanStack Query with 30-second polling. Shows live online/offline status and latency (ms) for all your tracked services with smooth pulsing indicators.
- 📦 **Auto-Discovery Engine**: Seamlessly integrates with your local **Docker socket** and **Nginx Proxy Manager**. TheView automatically finds running containers and active proxy hosts, allowing you to add them in a single click. The smart icon parser automatically matches services like AdGuard Home, Filebrowser, and Beszel.
- 🔄 **Docker Update Notifications**: Automatically checks if your Docker containers have new versions available on Docker Hub or GHCR by comparing image SHA256 digests. A notification badge will alert you directly on the dashboard!
- ⚡ **Seamless In-Place Edit**: Click the edit icon on any service card, and it elegantly scales into a fully functional form directly on the grid, gracefully expanding its layout without annoying popups.
- 🔌 **Interactive Widgets**:
  - **qBittorrent**: Live download/upload speeds, active torrent list with pause/resume controls, and torrent addition via magnet link or `.torrent` file upload — all directly on the dashboard.
  - **AdGuard Home**: Real-time DNS query stats, protection toggle with timed pause via a scrollable time wheel picker, and automatic countdown to re-activation.
  - _Both widgets support a "Separate Cells" layout mode that looks stunning in both horizontal (2x1) and vertical (1x2) sizes._
- 🎨 **Advanced Theming**: Pick your vibe. Full support for Dark/Light modes powered by semantic `shadcn-svelte` HSL variables for pixel-perfect contrast. The entire UI is built on a clean, scalable Tailwind v4 design system, with no hardcoded colors.
- 🦴 **Beautiful Loading States**: Skeletons that match actual component layouts instead of basic spinners, providing a native application feel while TanStack Query fetches data in the background.
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
      - SECURE_COOKIE=false # Set to true ONLY if you are accessing via HTTPS
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
      - SECURE_COOKIE=true # Set to true because we are using HTTPS
```

### First Access & Admin Setup

1. Launch the container: `docker compose up -d`
2. Navigate to `http://your-homelab-ip:3001` (or your configured `ORIGIN`).
3. Click the login icon ➜] in the top right corner of the navbar to access the **Admin Panel**.
4. By default, there is no password. You will be prompted to set your secure **Admin Password** on your first login.
5. If no services are set up, clicking "Accedi e Imposta i Tuoi Servizi" will conveniently redirect you directly to the **Discovery tab** to auto-populate your dashboard!

---

## ⚙️ Configuration & Security

TheView stores all state (Categories, Services, uploaded Icons, and UI Settings) in a robust local SQLite database inside the `/app/data` volume. This means your dashboard is entirely portable just by backing up the `data/sqlite.db` file!

### 🔐 Security & Encryption

All sensitive data (Admin Password, NPM credentials, Widget passwords, and 2FA secrets) are **strongly encrypted or hashed** (AES-256-GCM / SHA-256) inside the database. The system automatically generates a unique `APP_SECRET` on first boot. This secret is safely stored inside the persistent `/app/data/secret.key` file to survive Docker updates flawlessly. TheView does not store plaintext passwords anywhere.

### 💾 Backup & Restore

You can easily backup or migrate your dashboard directly from the web interface:

1. Go to **Settings** in the Admin panel.
2. Scroll down to the **Backup e Ripristino** section.
3. Click **Download Backup** to instantly download your entire SQLite database.
4. You can restore an old backup by uploading it. The dashboard will automatically restart to apply the new database.

### Nginx Proxy Manager Discovery

To enable automatic discovery of your Nginx Proxy Manager hosts:

1. Go to **Settings** in the Admin panel.
2. Enter your NPM instance URL (e.g., `http://192.168.1.100:81`).
3. Enter your NPM Email and Password.
4. Navigate to the **Discovery** tab to see your proxy hosts merged with your Docker containers!

---

## 🔌 Widget Integrations

Widget settings are managed in a **dedicated "Widgets" tab** in the Admin Panel, separated from general settings for clearer navigation.

### qBittorrent

Live torrent monitoring and management directly from your dashboard card.

1. Go to the **Widgets** tab in the Admin panel.
2. Expand the qBittorrent section and enter your credentials (URL, Username, Password).
3. Create or edit a service, select `qBittorrent` as the Widget type.

**Features:**

- Real-time download/upload speeds with 3-second TanStack Query polling.
- Active torrent list with individual pause/resume buttons.
- Add new torrents via magnet link or `.torrent` file upload directly from the widget.
- Configurable Bento Grid size constraints.
- Optional "Separate Cells" mode for a split-view layout.

### AdGuard Home

Real-time DNS protection monitoring and control.

1. Go to the **Widgets** tab in the Admin panel.
2. Expand the AdGuard Home section and enter your credentials (URL, Username, Password).
3. Create or edit a service, select `adguard` as the Widget type.

**Features:**

- DNS Queries count and Blocked Queries count — live stats.
- Protection ON/OFF toggle with visual status indicator.
- Timed pause via a custom **Time Wheel Picker** (Days / Hours / Minutes). Scroll to select a duration, disable protection, and watch the countdown timer for automatic re-activation.
- All data powered by TanStack Query with smart polling.

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

## 🧩 Tech Stack

| Layer             | Technology                                           |
| ----------------- | ---------------------------------------------------- |
| **Framework**     | SvelteKit 5 (Runes)                                  |
| **Styling**       | Tailwind CSS v4 + shadcn-svelte                      |
| **Database**      | SQLite via Drizzle ORM                               |
| **Data Fetching** | TanStack Query (Svelte)                              |
| **Drag & Drop**   | svelte-dnd-action                                    |
| **Icons**         | lucide-svelte + Homarr Dashboard Icons + Iconify API |
| **Encryption**    | AES-256-GCM / SHA-256                                |
| **Deployment**    | Docker / Docker Compose                              |

---

## 🛡️ License & Credits

TheView is open-source and free to use. Built with ❤️ for the self-hosting community.
Icons automatically fetched from [Homarr-Labs](https://github.com/homarr-labs/dashboard-icons) and [Iconify API](https://iconify.design/).
