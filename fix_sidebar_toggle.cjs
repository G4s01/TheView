const fs = require('fs');
let code = fs.readFileSync('src/routes/+page.svelte', 'utf-8');

const oldButton = /<button onclick=\{\(\) => isDiscoveryModalOpen = true\} class="w-12 h-12 flex items-center justify-center rounded-xl hover:bg-primary\/10 text-primary transition-colors relative group" title="Aggiungi Servizio">[\s\S]*?<\/button>/;

const newButton = `<button onclick={() => isDiscoveryModalOpen = !isDiscoveryModalOpen} class="w-12 h-12 flex items-center justify-center rounded-xl {isDiscoveryModalOpen ? 'bg-primary/20 ring-2 ring-primary/50' : 'hover:bg-primary/10'} text-primary transition-colors relative group" title={isDiscoveryModalOpen ? "Chiudi Aggiunta Servizio" : "Aggiungi Servizio"}>
					<div class="relative flex items-center justify-center">
						<Search class="w-6 h-6 group-hover:scale-110 transition-transform" />
						<div class="absolute -bottom-2 -right-2 bg-primary text-primary-foreground rounded-full shadow-sm ring-2 ring-card p-0.5">
							{#if isDiscoveryModalOpen}
								<X class="w-2.5 h-2.5" strokeWidth={4} />
							{:else}
								<Plus class="w-2.5 h-2.5" strokeWidth={4} />
							{/if}
						</div>
					</div>
				</button>`;

code = code.replace(oldButton, newButton);
fs.writeFileSync('src/routes/+page.svelte', code);
