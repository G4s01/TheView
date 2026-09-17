const fs = require('fs');
let code = fs.readFileSync('src/routes/+page.svelte', 'utf-8');

const keydownStr = `
	<svelte:window onkeydown={(e) => {
		if (appState.isEditMode && e.key === 'z' && (e.ctrlKey || e.metaKey)) {
			e.preventDefault();
			performUndo();
		}
	}} />
`;

code = code.replace(/<svelte:head>/, `${keydownStr}\n<svelte:head>`);
fs.writeFileSync('src/routes/+page.svelte', code);
