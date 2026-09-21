# Changelog

## [2.0.2] - 2026-09-21

### ✨ New Features & Enhancements
- **Massive Widget Expansion**: Added 7 completely new native widgets to supercharge your dashboard: **Docker, FileBrowser, Duplicati, Beszel, Wg-Easy, Dockhand, and Clock**.
- **Physical Pixel Responsiveness**: Completely rewrote the responsiveness engine for all widgets. Instead of relying on abstract Gridstack columns, widgets now observe their true *physical pixel dimensions* in real-time. This guarantees perfect UI scaling across mobile, tablet, and 4K displays.
- **Live Drag & Resize**: The dashboard UI now instantly adapts and re-renders *during* the GridStack drag-and-drop resize action, providing a seamless, native-app feel without waiting for the drop event.
- **Intelligent Weather Matrix**: The Weather widget has been fully overhauled. It now features an intelligent spatial matrix that perfectly calculates the best layout (Horizontal Hourly, Vertical Daily, or both) depending on the exact physical aspect ratio of the widget.
- **Blazing Fast Geocoding**: The Weather widget now utilizes the Open-Meteo Geocoding API for instantaneous, autocomplete location searches globally.
- **Standalone Widget Editor**: Revamped standalone widget editing via the sliding `EditServiceSheet`, eliminating full-screen layout shifts and intrusive inline forms.
- **Granular Appearance Settings**: Added discrete Admin settings for Desktop vs Mobile UI preferences, allowing you to independently hide service descriptions based on the device.
- **Pristine Defaults**: Fresh installations now feature a much cleaner default configuration (Counters Off, Grid Indexes Off, Sidebar Right, streamlined titles).

### 🐛 Bug Fixes
- Fixed a critical GridStack mathematical bug where `gs-*` class parsing resulted in `NaN`, completely breaking FileBrowser layouts.
- Fixed a highly disruptive regression where `use:clickOutside` directives aggressively closed newly opened Shadcn dropdowns and dialogs.
- Fixed an issue where the top navigation bar animation would stutter or pop when scrolling down.
- Resolved SvelteKit reactivity state mismatches. Settings changes now deeply integrate `await update()` with TanStack Query's `invalidateQueries()`, ensuring the dashboard updates instantly without ever requiring a manual page reload.
- Polished the Edit form UI by swapping confusing icons (replaced `Undo2` with `X` for cancel actions) to clearly differentiate from navigation buttons.
