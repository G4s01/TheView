const fs = require('fs');
let code = fs.readFileSync('src/routes/+page.svelte', 'utf-8');

code = code.replace(/const gridObj = data\.grids\?\.find\(\(g: any\) => g\.name === gridName\);\n\s*const gridId = gridName === 'Inbox' \? null : \(gridObj \? gridObj\.id : null\);/,
`const gridIdStr = gridName;
						const gridId = gridIdStr === 'Inbox' ? null : parseInt(gridIdStr);`);

fs.writeFileSync('src/routes/+page.svelte', code);
