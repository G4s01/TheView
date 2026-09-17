const fs = require('fs');
let code = fs.readFileSync('src/routes/+page.svelte', 'utf-8');

// 1. Imports
code = code.replace(/import \{ Plus, Trash, EyeOff, Eye, Pencil, Layers, PlusSquare, Undo2, SquareDashed \} from '@lucide\/svelte';/, "import { Plus, Trash, EyeOff, Eye, Pencil, Layers, PlusSquare, Undo2, SquareDashed, LayoutGrid, Search, ChevronUp, ChevronDown } from '@lucide/svelte';");
if (!code.includes("import { slide }")) {
    code = code.replace(/import \{ navigating \} from '\$app\/stores';/, "import { navigating } from '$app/stores';\n\timport { slide } from 'svelte/transition';");
}

// 2. State for Add Manual
code = code.replace(/let isDiscoveryModalOpen = \$state\(false\);/, "let isDiscoveryModalOpen = $state(false);\n\tlet isAddManualExpanded = $state(false);");

// 3. Modal HTML
const oldModal = /<Dialog\.Root bind:open=\{isDiscoveryModalOpen\}>[\s\S]*?<\/Dialog\.Root>/;
const newModal = `<Dialog.Root bind:open={isDiscoveryModalOpen}>
	<Dialog.Content class="max-w-6xl max-h-[95vh] overflow-y-auto w-[95vw] p-4 sm:p-6 md:p-8">
		<Dialog.Header class="mb-4">
			<Dialog.Title class="text-2xl font-bold">Aggiungi Servizio</Dialog.Title>
			<Dialog.Description class="text-base">
				Cerca nel database locale, scopri tramite Docker o aggiungi manualmente.
			</Dialog.Description>
		</Dialog.Header>
		
		<div class="flex flex-col gap-6">
			<!-- Discovery/Search -->
			<div class="bg-card p-2 sm:p-4 rounded-xl border border-border shadow-sm">
				<AdminDiscovery />
			</div>

			<!-- Manual Add Accordion -->
			<div class="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
				<button 
					onclick={() => isAddManualExpanded = !isAddManualExpanded} 
					class="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
				>
					<div class="flex items-center gap-3 font-bold uppercase tracking-wider text-sm">
						<Plus class="w-5 h-5 text-primary" />
						Aggiunta Manuale
					</div>
					{#if isAddManualExpanded}
						<ChevronUp class="w-5 h-5 text-muted-foreground" />
					{:else}
						<ChevronDown class="w-5 h-5 text-muted-foreground" />
					{/if}
				</button>
				{#if isAddManualExpanded}
					<div transition:slide class="p-6 border-t border-border bg-muted/5">
						<ServiceForm 
							mode="add" 
							bind:service={newServiceModal} 
							action="/admin?/createService" 
							useEnhance={true} 
							enhanceFn={() => {
								return async ({ result }: any) => {
									if (result.type === 'success' || result.type === 'redirect') {
										isDiscoveryModalOpen = false;
										window.location.reload();
									}
								};
							}} 
						/>
					</div>
				{/if}
			</div>
		</div>
	</Dialog.Content>
</Dialog.Root>`;
code = code.replace(oldModal, newModal);

// 4. Sidebar HTML
const oldSidebar = /<aside class="fixed[\s\S]*?<\/aside>/;
const newSidebar = `<aside class="fixed top-1/2 -translate-y-1/2 {editModeSidebarPosition === 'left' ? 'left-4' : 'right-4'} z-50 flex flex-col gap-2 w-16">
			<div class="bg-card py-4 rounded-xl border border-border shadow-2xl flex flex-col items-center gap-5">
                
                <button onclick={() => isDiscoveryModalOpen = true} class="w-12 h-12 flex items-center justify-center rounded-xl hover:bg-primary/10 text-primary transition-colors relative group" title="Aggiungi Servizio">
					<div class="relative flex items-center justify-center">
						<Search class="w-6 h-6 group-hover:scale-110 transition-transform" />
						<div class="absolute -bottom-2 -right-2 bg-primary text-primary-foreground rounded-full shadow-sm ring-2 ring-card p-0.5">
							<Plus class="w-2.5 h-2.5" strokeWidth={4} />
						</div>
					</div>
				</button>
				
				<button onclick={createGrid} class="w-12 h-12 flex items-center justify-center rounded-xl hover:bg-primary/10 text-primary transition-colors relative group" title="Nuova Griglia">
					<div class="relative flex items-center justify-center">
						<LayoutGrid class="w-6 h-6 group-hover:scale-110 transition-transform" />
						<div class="absolute -bottom-2 -right-2 bg-primary text-primary-foreground rounded-full shadow-sm ring-2 ring-card p-0.5">
							<Plus class="w-2.5 h-2.5" strokeWidth={4} />
						</div>
					</div>
				</button>

				<button onclick={performUndo} disabled={undoStack.length === 0} class="w-12 h-12 flex items-center justify-center rounded-xl {undoStack.length > 0 ? 'hover:bg-primary/10 text-primary cursor-pointer' : 'opacity-50 cursor-not-allowed'} transition-colors group" title="Annulla Modifica (Ctrl+Z)">
					<Undo2 class="w-6 h-6 {undoStack.length > 0 ? 'group-hover:-rotate-12 transition-transform' : ''}" />
				</button>

				<div class="w-8 h-px bg-border/50"></div>

				<div class="drag-in-spacer grid-stack-item cursor-grab active:cursor-grabbing w-12 h-12 rounded-xl border-2 border-dashed border-primary/50 bg-primary/10 flex items-center justify-center transition-colors hover:bg-primary/20 hover:border-primary text-primary" {...{'gs-w':"2", 'gs-h':"2", 'gs-min-w':"2", 'gs-min-h':"2"}} data-type="spacer" title="Trascina in griglia per creare una Blank Card">
					<div class="grid-stack-item-content pointer-events-none flex items-center justify-center static! bg-transparent border-none shadow-none inset-0 w-full h-full">
						<SquareDashed class="w-6 h-6" />
					</div>
				</div>
			</div>
		</aside>`;
code = code.replace(oldSidebar, newSidebar);

fs.writeFileSync('src/routes/+page.svelte', code);
