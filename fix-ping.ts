import fs from 'fs';

let content = fs.readFileSync('src/lib/queries/usePing.ts', 'utf8');
content = content.replace(/url: \(\) => string/, 'id: () => number');
content = content.replace(/url\(\)/g, 'id()');
content = content.replace(/const currentUrl = id\(\);/, 'const currentId = id();');
content = content.replace(/ping\?url=\$\{encodeURIComponent\(currentUrl\)\}/, 'ping?id=${currentId}');
fs.writeFileSync('src/lib/queries/usePing.ts', content);

let cardContent = fs.readFileSync('src/lib/components/ServiceCard.svelte', 'utf8');
cardContent = cardContent.replace(/usePing\(\(\) => service\.url/, 'usePing(() => service.id');
fs.writeFileSync('src/lib/components/ServiceCard.svelte', cardContent);
