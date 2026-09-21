import fs from 'fs';

const italianCities = [
  "Roma", "Milano", "Napoli", "Torino", "Palermo", "Genova", "Bologna", "Firenze", "Bari", "Catania", 
  "Venezia", "Verona", "Messina", "Padova", "Trieste", "Brescia", "Parma", "Taranto", "Prato", "Modena",
  "Reggio Calabria", "Reggio Emilia", "Perugia", "Livorno", "Ravenna", "Cagliari", "Foggia", "Rimini", "Salerno", "Ferrara",
  "Sassari", "Siracusa", "Pescara", "Monza", "Latina", "Bergamo", "Forlì", "Giugliano in Campania", "Trento", "Vicenza",
  "Terni", "Novara", "Bolzano", "Piacenza", "Ancona", "Arezzo", "Andria", "Udine", "Cesena", "Lecce",
  "New York", "London", "Paris", "Berlin", "Tokyo", "Madrid", "Barcelona", "Los Angeles", "Chicago", "Miami"
].sort();

let content = fs.readFileSync('src/lib/config/widgetRegistry.ts', 'utf8');

const opts = italianCities.map(c => `{ value: '${c}', label: '${c}' }`).join(', ');

content = content.replace(
    /\{ id: 'weather_location', label: 'Località \(città\)', type: 'combobox', options: \[\] \},/,
    `{ id: 'weather_location', label: 'Località (città)', type: 'combobox', options: [${opts}] },`
);

fs.writeFileSync('src/lib/config/widgetRegistry.ts', content);
