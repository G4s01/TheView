const fs = require('fs');
let code = fs.readFileSync('src/routes/+page.svelte', 'utf-8');

// The old aside
const oldAside = `	{#if appState.isEditMode}
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
	{/if}`;

const newAside = `	{#if appState.isEditMode}
		<aside class="fixed top-1/2 -translate-y-1/2 {editModeSidebarPosition === 'left' ? 'left-4' : 'right-4'} z-50 flex flex-col gap-2 w-14">
			<div class="bg-card py-4 rounded-full border border-border shadow-2xl flex flex-col items-center gap-5">
				
				<div class="text-primary cursor-help" title="EDIT MODE: Clicca o trascina gli elementi per modificare la dashboard">
					<Pencil class="w-5 h-5" />
				</div>

				<div class="w-8 h-px bg-border/50"></div>
                
                <button onclick={() => isDiscoveryModalOpen = true} class="w-10 h-10 flex items-center justify-center rounded-full hover:bg-primary/10 text-primary transition-colors" title="Aggiungi Servizio / Discovery">
					<Layers class="w-5 h-5" />
				</button>
				
				<button onclick={createGrid} class="w-10 h-10 flex items-center justify-center rounded-full hover:bg-primary/10 text-primary transition-colors" title="Nuova Griglia">
					<PlusSquare class="w-5 h-5" />
				</button>

				<button onclick={performUndo} disabled={undoStack.length === 0} class="w-10 h-10 flex items-center justify-center rounded-full {undoStack.length > 0 ? 'hover:bg-primary/10 text-primary cursor-pointer' : 'opacity-50 cursor-not-allowed'} transition-colors" title="Annulla Modifica (Ctrl+Z)">
					<Undo2 class="w-5 h-5" />
				</button>

				<div class="w-8 h-px bg-border/50"></div>

				<div class="drag-in-spacer grid-stack-item cursor-grab active:cursor-grabbing w-10 h-10 rounded-full border border-dashed border-primary/50 bg-primary/10 flex items-center justify-center transition-colors hover:bg-primary/20 hover:border-primary text-primary" {...{'gs-w':"2", 'gs-h':"2", 'gs-min-w':"2", 'gs-min-h':"2"}} data-type="spacer" title="Trascina in griglia per creare uno Spacer">
					<div class="grid-stack-item-content pointer-events-none flex items-center justify-center static! bg-transparent border-none shadow-none inset-0 w-full h-full">
						<SquareDashed class="w-5 h-5" />
					</div>
				</div>
			</div>
		</aside>
	{/if}`;

code = code.replace(oldAside, newAside);
fs.writeFileSync('src/routes/+page.svelte', code);
