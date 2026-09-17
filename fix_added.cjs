const fs = require('fs');
let code = fs.readFileSync('src/routes/+page.svelte', 'utf-8');
code = code.replace(/await fetch\('\/api\/services\/spacer', \{ method: 'POST', body: JSON\.stringify\(\{ categoryId: gridId \}\) \}\);\n\s*await invalidateAll\(\);/g, `
							grid!.removeWidget(item.el, true, false);
							await fetch('/api/services/spacer', { method: 'POST', body: JSON.stringify({ gridId: gridId }) });
							await invalidateAll();
`);
fs.writeFileSync('src/routes/+page.svelte', code);
