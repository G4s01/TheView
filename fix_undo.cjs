const fs = require('fs');
let code = fs.readFileSync('src/routes/+page.svelte', 'utf-8');

const undoEvents = `
			grid!.on('dragstart', () => {
				if (appState.isEditMode) undoStack.push({ grid: gridName, state: grid!.save() });
			});
			grid!.on('resizestart', () => {
				if (appState.isEditMode) undoStack.push({ grid: gridName, state: grid!.save() });
			});
`;

code = code.replace(/grid!\.on\('dragstop',/g, `${undoEvents}\n\t\t\tgrid!.on('dragstop',`);
fs.writeFileSync('src/routes/+page.svelte', code);
