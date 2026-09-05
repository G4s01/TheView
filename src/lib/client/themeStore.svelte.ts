export const themes = [
  { id: "default", name: "DEFAULT", type: "both" },
  { id: "dracula", name: "DRACULA", type: "dark" },
  { id: "dracula-soft", name: "DRACULA SOFT", type: "dark" },
  { id: "dracula-pro", name: "DRACULA PRO", type: "dark" },
  { id: "dracula-alucard", name: "DRACULA ALUCARD", type: "light" },
  { id: "dracula-van-helsing", name: "DRACULA VAN HELSING", type: "dark" },
  { id: "catppuccin-latte", name: "CATPPUCCIN LATTE", type: "light" },
  { id: "catppuccin-frappe", name: "CATPPUCCIN FRAPPÉ", type: "dark" },
  { id: "catppuccin-macchiato", name: "CATPPUCCIN MACCHIATO", type: "dark" },
  { id: "catppuccin", name: "CATPPUCCIN MOCHA", type: "dark" },
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

        // Force Tailwind dark mode class if theme is strictly dark or light
        const tObj = themes.find((t) => t.id === newTheme);
        if (tObj) {
          if (tObj.type === "dark") {
            document.documentElement.classList.add("dark");
            localStorage.setItem("theview-color-scheme", "dark");
          } else if (tObj.type === "light") {
            document.documentElement.classList.remove("dark");
            localStorage.setItem("theview-color-scheme", "light");
          }
        }
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
