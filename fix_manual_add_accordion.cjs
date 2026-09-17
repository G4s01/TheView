const fs = require('fs');
let code = fs.readFileSync('src/routes/+page.svelte', 'utf-8');

const oldHtml = /<!-- Manual Add is always visible and FIRST -->[\s\S]*?<\/div>\n\t\t\t<\/div>/;

const newHtml = `<!-- Manual Add Accordion -->
			<div class="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
				<button 
					onclick={() => isAddManualExpanded = !isAddManualExpanded} 
					class="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
				>
					<div class="flex items-center gap-3 font-bold uppercase tracking-wider text-sm text-primary">
						<Plus class="w-5 h-5" />
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
			</div>`;

code = code.replace(oldHtml, newHtml);
fs.writeFileSync('src/routes/+page.svelte', code);
