const fs = require('fs');
let code = fs.readFileSync('src/routes/admin/components/AdminDiscovery.svelte', 'utf-8');

const regex = /<div class="p-6 border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-4">[\s\S]*?<\/div>\n\t\t<\/div>/;

const replacement = `{#if mode === 'admin'}
		<div class="p-6 border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-4">
			<div class="flex items-center space-x-3">
				<div class="p-2 bg-primary/20 text-primary rounded-lg">
					<Search class="w-6 h-6" strokeWidth={1.5} />
				</div>
				<h3 class="text-xl font-bold uppercase tracking-wider text-foreground">RISULTATI</h3>
			</div>
			<div class="flex items-center gap-3">
				<button 
					onclick={fetchDiscovery} 
					disabled={isDiscovering}
					class="inline-flex items-center justify-center w-full md:w-auto px-5 py-2.5 bg-primary text-primary-foreground hover:opacity-90 text-sm font-bold uppercase tracking-wider rounded-xl transition-all shadow-md disabled:opacity-50"
				>
					{#if isDiscovering}
						<LoaderCircle class="animate-spin -ml-1 mr-2 h-4 w-4 text-primary-foreground" strokeWidth={2} />
						STO CERCANDO...
					{:else}
						<Search class="-ml-1 mr-2 h-4 w-4" strokeWidth={1.5} />
						DISCOVERY
					{/if}
				</button>
			</div>
		</div>
		{:else}
		<div class="p-4 border-b border-border flex justify-between items-center bg-muted/30">
            <span class="text-xs text-muted-foreground uppercase font-bold tracking-wider">Container Trovati</span>
			<button 
					onclick={fetchDiscovery} 
					disabled={isDiscovering}
					class="inline-flex items-center justify-center px-4 py-2 bg-primary/10 text-primary hover:bg-primary/20 text-xs font-bold uppercase tracking-wider rounded-lg transition-all disabled:opacity-50"
				>
					{#if isDiscovering}
						<LoaderCircle class="animate-spin -ml-1 mr-2 h-4 w-4 text-primary" strokeWidth={2} />
						STO CERCANDO...
					{:else}
						<Search class="-ml-1 mr-2 h-4 w-4" strokeWidth={1.5} />
						AVVIA SCANSIONE
					{/if}
				</button>
		</div>
		{/if}`;

code = code.replace(regex, replacement);
fs.writeFileSync('src/routes/admin/components/AdminDiscovery.svelte', code);
