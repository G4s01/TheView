export type WidgetField = {
  id: string; // e.g., 'qbit_url', 'clock_timezone'
  label: string;
  type: 'text' | 'password' | 'checkbox' | 'select';
  options?: { value: string; label: string }[]; // for 'select'
  description?: string;
};

export type WidgetDef = {
  id: string; // e.g. 'qbittorrent', 'weather'
  name: string;
  icon: string;
  description: string;
  fields: WidgetField[];
};

export const WIDGET_REGISTRY: WidgetDef[] = [
  {
    id: 'qbittorrent',
    name: 'qBittorrent',
    icon: 'qbittorrent',
    description: 'Impostazioni per l\'API di qBittorrent',
    fields: [
      { id: 'qbit_url', label: 'URL', type: 'text' },
      { id: 'qbit_username', label: 'Username', type: 'text' },
      { id: 'qbit_password', label: 'Password', type: 'password' },
      { id: 'qbit_require_auth', label: 'Nascondi ad utenti non loggati', type: 'checkbox' },
    ]
  },
  {
    id: 'adguard',
    name: 'AdGuard Home',
    icon: 'adguard-home',
    description: 'Impostazioni per l\'API di AdGuard Home',
    fields: [
      { id: 'adguard_url', label: 'URL', type: 'text' },
      { id: 'adguard_username', label: 'Username', type: 'text' },
      { id: 'adguard_password', label: 'Password', type: 'password' },
      { id: 'adguard_require_auth', label: 'Nascondi ad utenti non loggati', type: 'checkbox' },
    ]
  },
  {
    id: 'beszel',
    name: 'Beszel',
    icon: 'https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/svg/beszel.svg',
    description: 'Impostazioni per l\'API di Beszel',
    fields: [
      { id: 'beszel_url', label: 'URL', type: 'text' },
      { id: 'beszel_username', label: 'Username', type: 'text' },
      { id: 'beszel_password', label: 'Password', type: 'password' },
      { id: 'beszel_require_auth', label: 'Nascondi ad utenti non loggati', type: 'checkbox' },
    ]
  },
  {
    id: 'wgeasy',
    name: 'Wg-easy',
    icon: 'https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/svg/wireguard.svg',
    description: 'Impostazioni per l\'API di Wg-easy',
    fields: [
      { id: 'wgeasy_url', label: 'URL', type: 'text' },
      { id: 'wgeasy_password', label: 'Password', type: 'password' },
      { id: 'wgeasy_require_auth', label: 'Nascondi ad utenti non loggati', type: 'checkbox' },
    ]
  },
  {
    id: 'duplicati',
    name: 'Duplicati',
    icon: 'https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/svg/duplicati.svg',
    description: 'Impostazioni per l\'API di Duplicati',
    fields: [
      { id: 'duplicati_url', label: 'URL', type: 'text' },
      { id: 'duplicati_password', label: 'Password', type: 'password' },
      { id: 'duplicati_require_auth', label: 'Nascondi ad utenti non loggati', type: 'checkbox' },
    ]
  },
  {
    id: 'filebrowser',
    name: 'Filebrowser',
    icon: 'https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/svg/filebrowser.svg',
    description: 'Impostazioni per l\'API di Filebrowser',
    fields: [
      { id: 'filebrowser_url', label: 'URL', type: 'text' },
      { id: 'filebrowser_username', label: 'Username', type: 'text' },
      { id: 'filebrowser_password', label: 'Password', type: 'password' },
      { id: 'filebrowser_require_auth', label: 'Nascondi ad utenti non loggati', type: 'checkbox' },
    ]
  },
  {
    id: 'docker',
    name: 'Docker',
    icon: 'https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/svg/docker.svg',
    description: 'Impostazioni per l\'API di Docker Socket',
    fields: [
      { id: 'docker_socket_path', label: 'Socket Path (es: /var/run/docker.sock)', type: 'text' },
      { id: 'docker_require_auth', label: 'Nascondi ad utenti non loggati', type: 'checkbox' },
    ]
  },
  {
    id: 'dockhand',
    name: 'Dockhand',
    icon: 'dockhand',
    description: 'Impostazioni per l\'API di Dockhand',
    fields: [
      { id: 'dockhand_url', label: 'URL', type: 'text' },
      { id: 'dockhand_username', label: 'Username', type: 'text' },
      { id: 'dockhand_password', label: 'Password', type: 'password' },
      { id: 'dockhand_require_auth', label: 'Nascondi ad utenti non loggati', type: 'checkbox' },
    ]
  },
  {
    id: 'clock',
    name: 'Orologio',
    icon: 'lucide:clock',
    description: 'Impostazioni Widget Orologio',
    fields: [
      { id: 'clock_timezone', label: 'Fuso Orario (es. Europe/Rome)', type: 'text' },
      { id: 'clock_format', label: 'Formato', type: 'select', options: [
        { value: 'digital', label: 'Digitale (Testo)' },
        { value: 'analog', label: 'Analogico (Lancette)' }
      ] },
      { id: 'clock_require_auth', label: 'Nascondi ad utenti non loggati', type: 'checkbox' },
    ]
  },
  {
    id: 'weather',
    name: 'Meteo',
    icon: 'lucide:cloud-sun',
    description: 'Impostazioni Widget Meteo',
    fields: [
      { id: 'weather_location', label: 'Località (es. Milan, Italy)', type: 'text' },
      { id: 'weather_require_auth', label: 'Nascondi ad utenti non loggati', type: 'checkbox' },
    ]
  }
];

export function getWidgetRequireAuthKey(widgetId: string | null | undefined): string | null {
  if (!widgetId || widgetId === 'none' || widgetId === 'spacer') return null;
  const def = WIDGET_REGISTRY.find(w => w.id === widgetId);
  if (!def) return null;
  const authField = def.fields.find(f => f.id.endsWith('_require_auth'));
  return authField ? authField.id : null;
}
