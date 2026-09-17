const fs = require('fs');
let code = fs.readFileSync('src/routes/+page.svelte', 'utf-8');

const newUndo = `
	async function performUndo() {
		const last = undoStack.pop();
		if (!last) return;
		
		const gridObj = data.grids?.find((g: any) => g.name === last.grid);
		const gridId = last.grid === 'Inbox' ? null : (gridObj ? gridObj.id : null);
		const grid = grids.get(last.grid);

		const itemsWithPositions = last.state.map((n: any) => ({
			id: parseInt(n.id as string),
			x: n.x,
			y: n.y,
			w: n.w,
			h: n.h,
		})).filter((n: any) => !isNaN(n.id));

		if (grid) {
			// Restore positions visually
			for (const savedNode of last.state) {
				const existing = grid.engine.nodes.find(n => n.id === savedNode.id);
				if (existing && existing.el) {
					grid.update(existing.el, { x: savedNode.x, y: savedNode.y, w: savedNode.w, h: savedNode.h });
				}
			}
		}

		try {
			await fetch('/api/services/reorder', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ itemsWithPositions, gridId })
			});
		} catch (e) {}
	}
`;

code = code.replace(/async function performUndo\(\) \{[\s\S]*?\} catch \(e\) \{\}\n\t\}/, newUndo.trim());

// Restore reload for modal close
code = code.replace(/\/\/ window\.location\.reload\(\);/g, (match, offset) => {
    // We only want to restore the modal reload, not the grid rename reload
    return offset < 1000 ? match : (offset > 1000 && offset < 3000 ? "window.location.reload();" : match);
});

fs.writeFileSync('src/routes/+page.svelte', code);
