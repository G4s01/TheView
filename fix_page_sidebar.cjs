const fs = require('fs');
let code = fs.readFileSync('src/routes/+page.svelte', 'utf-8');

// Add variables
code = code.replace(/let grids = new Map<string, GridStack>\(\);/, "let editModeSidebarPosition = $derived(data.settings?.editModeSidebarPosition || 'right');\n\tlet grids = new Map<string, GridStack>();\n\tlet undoStack = $state<Array<{ grid: string, state: any[] }>>([]);\n\t\n\tfunction performUndo() {\n\t\tconst last = undoStack.pop();\n\t\tif (!last) return;\n\t\tconst grid = grids.get(last.grid);\n\t\tif (grid) {\n\t\t\tgrid.load(last.state, true);\n\t\t\tsaveGridState(last.grid);\n\t\t}\n\t}");

// Import BackButton
code = code.replace(/import ConfirmDeleteButton from '\$lib\/components\/ui\/ConfirmDeleteButton\.svelte';/, "import ConfirmDeleteButton from '$lib/components/ui/ConfirmDeleteButton.svelte';\n\timport BackButton from '$lib/components/ui/BackButton.svelte';");

// Modify saveGridState to take an optional gridName (since undo targets one grid)
// Actually saveGridState in +page.svelte DOES NOT TAKE gridName, it reads `gridName` from closure if it was defined per-grid?
// Wait, `saveGridState` is defined INSIDE the `initGrid` action closure! So it captures `gridName` automatically.
// This means I can't call `saveGridState(last.grid)` globally.
// I will just trigger a synthetic `change` event on the grid after `load()`, which will trigger `saveGridState` internally.

code = code.replace(/function performUndo\(\) \{[\s\S]*?\}/, `function performUndo() {
		const last = undoStack.pop();
		if (!last) return;
		const grid = grids.get(last.grid);
		if (grid) {
			grid.load(last.state, true);
			// Trigger the internal save mechanism by emitting 'change' or by a manual fetch
            // But grid.load triggers 'change' event in GridStack anyway! So it will auto-save!
		}
	}`);

fs.writeFileSync('src/routes/+page.svelte', code);
