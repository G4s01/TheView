const fs = require('fs');
let code = fs.readFileSync('src/routes/+page.svelte', 'utf-8');

// In performUndo, last.grid is now gridId!
code = code.replace(/const gridObj = data\.grids\?\.find\(\(g: any\) => g\.name === last\.grid\);\n\s*const gridId = last\.grid === 'Inbox' \? null : \(gridObj \? gridObj\.id : null\);/,
`const gridIdStr = last.grid;
		const gridId = gridIdStr === 'Inbox' ? null : parseInt(gridIdStr);`);

// In saveGridState, gridName is actually gridId string!
code = code.replace(/const gridObj = data\.grids\?\.find\(\(g: any\) => g\.name === gridName\);\n\s*const gridId = gridName === 'Inbox' \? null : \(gridObj \? gridObj\.id : null\);/,
`const gridIdStr = gridName;
				const gridId = gridIdStr === 'Inbox' ? null : parseInt(gridIdStr);`);

fs.writeFileSync('src/routes/+page.svelte', code);
