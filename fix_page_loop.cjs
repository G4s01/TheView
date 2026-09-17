const fs = require('fs');
let code = fs.readFileSync('src/routes/+page.svelte', 'utf-8');

code = code.replace(/\{#each Object\.entries\(localGroups\) as \[gridName, services\] \(gridName\)\}/g, 
`{#each Object.entries(localGroups) as [gridId, services] (gridId)}`);

code = code.replace(/\{\@const gridObj = gridsData\.find\(\(g:any\) => g\.name === gridName\)\}/g,
`{@const gridObj = gridId === 'Inbox' ? null : gridsData.find((g:any) => g.id.toString() === gridId)}
		{@const gridName = gridId === 'Inbox' ? 'Inbox' : (gridObj ? gridObj.name : 'Unknown')}`);

code = code.replace(/initGrid=\{\{ gridName, services \}\}/g, `initGrid={{ gridName: gridId, services }}`); // wait, initGrid uses gridName? Let's check!

fs.writeFileSync('src/routes/+page.svelte', code);
