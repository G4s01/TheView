import fs from 'fs';
let content = fs.readFileSync('src/lib/config/widgetRegistry.ts', 'utf8');
content = content.replace(/\},,/g, '},');
fs.writeFileSync('src/lib/config/widgetRegistry.ts', content);
