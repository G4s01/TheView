export const themes = [
  { id: "default", name: "Default" },
  { id: "dracula", name: "Dracula" },
  { id: "dracula-soft", name: "Dracula Soft" },
  { id: "dracula-pro", name: "Dracula PRO" },
  { id: "dracula-alucard", name: "Dracula Alucard" },
  { id: "dracula-van-helsing", name: "Dracula Van Helsing" },
  { id: "catppuccin-latte", name: "Catppuccin Latte" },
  { id: "catppuccin-frappe", name: "Catppuccin Frappé" },
  { id: "catppuccin-macchiato", name: "Catppuccin Macchiato" },
  { id: "catppuccin", name: "Catppuccin Mocha" },
];

function createThemeStore() {
  let theme = $state("default");

  return {
    get theme() {
      return theme;
    },
    setTheme(newTheme: string) {
      theme = newTheme;
      if (typeof document !== "undefined") {
        if (newTheme === "default") {
          document.documentElement.removeAttribute("data-theme");
        } else {
          document.documentElement.setAttribute("data-theme", newTheme);
        }
        localStorage.setItem("theview-theme", newTheme);
      }
    },
    init() {
      if (typeof document !== "undefined") {
        const saved = localStorage.getItem("theview-theme");
        if (saved && themes.find((t) => t.id === saved)) {
          this.setTheme(saved);
        }
      }
    },
  };
}

export const themeStore = createThemeStore();
