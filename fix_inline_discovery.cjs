const fs = require('fs');
let code = fs.readFileSync('src/routes/+page.svelte', 'utf-8');

// Replace Dialog with inline div
const dialogRegex = /<Dialog\.Root bind:open=\{isDiscoveryModalOpen\}>[\s\S]*?<\/Dialog\.Root>/;

const inlinePanel = `
{#if isDiscoveryModalOpen}
	<div transition:slide class="w-full bg-card rounded-2xl border-2 border-primary/20 p-6 shadow-lg mb-6 flex flex-col gap-6 relative overflow-hidden">
		<!-- Decorazione sfondo -->
		<div class="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10 -translate-y-1/2 translate-x-1/3"></div>

		<div class="flex items-center justify-between border-b border-border/50 pb-4">
			<div class="flex items-center gap-3">
				<div class="p-2 bg-primary/20 text-primary rounded-xl">
					<Layers class="w-6 h-6" />
				</div>
				<div>
					<h2 class="text-xl font-bold uppercase tracking-wider text-foreground">Aggiunta Servizio</h2>
					<p class="text-xs text-muted-foreground mt-0.5">Aggiungi manualmente o scansiona automaticamente la rete tramite Docker.</p>
				</div>
			</div>
			<button onclick={() => isDiscoveryModalOpen = false} class="p-2 text-muted-foreground hover:bg-muted hover:text-foreground rounded-xl transition-colors ring-1 ring-border shadow-sm">
				<X class="w-5 h-5" />
			</button>
		</div>
		
		<div class="flex flex-col gap-8 z-10">
			<!-- Manual Add is always visible and FIRST -->
			<div>
				<h3 class="text-sm font-bold uppercase tracking-wider text-primary mb-4 flex items-center gap-2"><Plus class="w-4 h-4"/> Aggiunta Manuale</h3>
				<div class="bg-background p-5 rounded-xl border border-border shadow-inner">
					<ServiceForm 
						mode="add" 
						bind:service={newServiceModal} 
						action="/admin?/createService" 
						useEnhance={true} 
						enhanceFn={() => {
							return async ({ result }) => {
								if (result.type === 'success' || result.type === 'redirect') {
									isDiscoveryModalOpen = false;
									window.location.reload();
								}
							};
						}} 
					/>
				</div>
			</div>

			<!-- Docker Discovery SECOND -->
			<div>
				<h3 class="text-sm font-bold uppercase tracking-wider text-primary mb-4 flex items-center gap-2"><Search class="w-4 h-4"/> Scansione Automatica Docker</h3>
				<div class="bg-background rounded-xl border border-border shadow-inner">
					<AdminDiscovery mode="dashboard" />
				</div>
			</div>
		</div>
	</div>
{/if}
`;

// Insert the inlinePanel BEFORE the first `#each` or inside the flex-1 space-y-6 div
// Actually let's put it right after `<div class="flex-1 w-full space-y-6 min-w-0">`
code = code.replace(/<div class="flex-1 w-full space-y-6 min-w-0">/, `<div class="flex-1 w-full space-y-6 min-w-0">\n${inlinePanel}`);

// Remove the old Dialog
code = code.replace(/\{#if appState\.isEditMode && isDiscoveryModalOpen\}\n<Dialog\.Root bind:open=\{isDiscoveryModalOpen\}>[\s\S]*?<\/Dialog\.Root>\n\{\/if\}/, '');

// Also import X if missing
if (!code.includes(" X,")) code = code.replace(/import \{ Plus,/, "import { Plus, X,");

fs.writeFileSync('src/routes/+page.svelte', code);
