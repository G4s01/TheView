const fs = require('fs');
let code = fs.readFileSync('src/routes/+page.svelte', 'utf-8');

const newUndo = `
	async function performUndo() {
		const last = undoStack.pop();
		if (!last) return;
		
		const gridObj = data.grids?.find((g: any) => g.name === last.grid);
		const gridId = last.grid === 'Inbox' ? null : (gridObj ? gridObj.id : null);

		const itemsWithPositions = last.state.map((n: any) => ({
			id: parseInt(n.id as string),
			x: n.x,
			y: n.y,
			w: n.w,
			h: n.h,
		})).filter((n: any) => !isNaN(n.id));

		try {
			await fetch('/api/services/reorder', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ itemsWithPositions, gridId })
			});
			window.location.reload();
		} catch (e) {}
	}
`;

code = code.replace(/function performUndo\(\) \{[\s\S]*?\}\n/, newUndo.trim() + '\n');
fs.writeFileSync('src/routes/+page.svelte', code);
