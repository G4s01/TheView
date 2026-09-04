export const themes = [
    { id: 'default', name: 'Default' },
    { id: 'dracula', name: 'Dracula' },
    { id: 'nord', name: 'Nord' },
    { id: 'catppuccin', name: 'Catppuccin' }
];

function createThemeStore() {
    let theme = $state('default');

    return {
        get theme() {
            return theme;
        },
        setTheme(newTheme: string) {
            theme = newTheme;
            if (typeof document !== 'undefined') {
                if (newTheme === 'default') {
                    document.documentElement.removeAttribute('data-theme');
                } else {
                    document.documentElement.setAttribute('data-theme', newTheme);
                }
                localStorage.setItem('theview-theme', newTheme);
            }
        },
        init() {
            if (typeof document !== 'undefined') {
                const saved = localStorage.getItem('theview-theme');
                if (saved && themes.find(t => t.id === saved)) {
                    this.setTheme(saved);
                }
            }
        }
    };
}

export const themeStore = createThemeStore();
