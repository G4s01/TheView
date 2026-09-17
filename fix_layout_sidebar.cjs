const fs = require('fs');
let code = fs.readFileSync('src/routes/+page.svelte', 'utf-8');

// The original Edit mode banner
const oldBanner = `	{#if appState.isEditMode}
		<div class="mb-3 flex justify-between items-center bg-card p-4 rounded-xl border border-border shadow-sm">
			<div class="text-sm font-bold uppercase tracking-wider text-muted-foreground flex flex-col gap-1">
				<span>MULTI-GRID EDIT MODE</span>
				<span class="text-[10px] opacity-70">Trascina i widget per posizionarli. Puoi spostarli liberamente tra le griglie.</span>
			</div>
			<div class="flex gap-4 items-center">
				<div class="drag-in-spacer grid-stack-item cursor-grab active:cursor-grabbing w-12 h-12 rounded-xl border-2 border-dashed border-primary/50 bg-primary/10 flex items-center justify-center transition-colors hover:bg-primary/20 hover:border-primary text-primary shadow-sm" {...{'gs-w':"1", 'gs-h':"1", 'gs-min-w':"1", 'gs-min-h':"1"}} data-type="spacer" title="Trascina in griglia per creare uno Spacer">
					<div class="grid-stack-item-content pointer-events-none flex flex-col items-center justify-center static! bg-transparent border-none shadow-none inset-0 w-full h-full">
						<Plus class="w-5 h-5" />
					</div>
				</div>
			</div>
		</div>
	{/if}`;

// Remove old banner
code = code.replace(oldBanner, '');

// Wrap main content
code = code.replace(/<div class="space-y-6">/, '<div class="flex flex-col md:flex-row gap-6 relative items-start w-full">\n\t<div class="flex-1 w-full space-y-6 min-w-0">');

// The old Add Grid button
const oldAddGrid = `	{#if appState.isEditMode}
		<div class="flex justify-center mt-12 mb-8">
			<button onclick={createGrid} class="flex items-center gap-2 px-6 py-3 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 rounded-xl font-bold uppercase tracking-wider transition-all hover:scale-105 active:scale-95 shadow-sm">
				<Plus class="w-5 h-5" />
				Aggiungi Nuova Griglia
			</button>
		</div>
	{/if}`;

code = code.replace(oldAddGrid, '</div>');

// Now append the sidebar just before the final `</div>\n{/if}` (for isLoading else)
const sidebarStr = `
	{#if appState.isEditMode}
		<aside class="sticky top-24 w-full md:w-64 shrink-0 flex flex-col gap-4 {editModeSidebarPosition === 'left' ? 'order-first' : 'order-last'}">
			<div class="bg-card p-5 rounded-xl border border-border shadow-sm flex flex-col gap-6">
				<div class="text-sm font-bold uppercase tracking-wider text-primary flex flex-col gap-1 border-b border-border/50 pb-3">
					<span>EDIT MODE</span>
					<span class="text-[10px] text-muted-foreground font-normal normal-case">Trascina i widget, crea griglie o annulla.</span>
				</div>
				
				<div class="flex flex-col gap-3">
					<span class="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Azioni</span>
					<div class="flex flex-col gap-2">
						<BackButton onclick={performUndo} disabled={undoStack.length === 0} class="w-full justify-center" text="ANNULLA (CTRL+Z)" />
						<button onclick={createGrid} class="flex justify-center items-center gap-2 w-full px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 rounded-md font-bold uppercase tracking-wider text-sm transition-all shadow-sm">
							<Plus class="w-4 h-4" />
							Nuova Griglia
						</button>
					</div>
				</div>

				<div class="flex flex-col gap-3 pt-3 border-t border-border/50">
					<span class="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Blank Card</span>
					<div class="drag-in-spacer grid-stack-item cursor-grab active:cursor-grabbing w-full h-24 rounded-xl border-2 border-dashed border-primary/50 bg-primary/10 flex items-center justify-center transition-colors hover:bg-primary/20 hover:border-primary text-primary shadow-sm" {...{'gs-w':"2", 'gs-h':"2", 'gs-min-w':"2", 'gs-min-h':"2"}} data-type="spacer" title="Trascina in griglia per creare uno Spacer">
						<div class="grid-stack-item-content pointer-events-none flex flex-col items-center justify-center static! bg-transparent border-none shadow-none inset-0 w-full h-full gap-2">
							<Plus class="w-6 h-6" />
							<span class="text-[10px] font-bold uppercase tracking-wider">Trascina</span>
						</div>
					</div>
				</div>
			</div>
		</aside>
	{/if}
`;

// Insert sidebar before the closing of the flex container
code = code.replace(/<\/div>\n\{\/if\}\n\n<style>/, `${sidebarStr}\n</div>\n{/if}\n\n<style>`);

fs.writeFileSync('src/routes/+page.svelte', code);
