const fs = require('fs');
let code = fs.readFileSync('src/routes/+page.svelte', 'utf-8');

const modalHtml = `
{#if appState.isEditMode && isDiscoveryModalOpen}
<Dialog.Root bind:open={isDiscoveryModalOpen}>
	<Dialog.Content class="max-w-4xl max-h-[90vh] overflow-y-auto w-[90vw]">
		<Dialog.Header>
			<Dialog.Title>Aggiungi Servizio</Dialog.Title>
			<Dialog.Description>
				Scopri automaticamente i servizi tramite NPM/Docker o aggiungine uno manualmente.
			</Dialog.Description>
		</Dialog.Header>
		
		<div class="flex flex-col gap-6 py-4">
			<div class="bg-card p-6 rounded-xl border border-border shadow-sm">
				<h3 class="text-lg font-bold mb-4">Aggiunta Manuale</h3>
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

			<div class="bg-card p-6 rounded-xl border border-border shadow-sm">
				<AdminDiscovery />
			</div>
		</div>
	</Dialog.Content>
</Dialog.Root>
{/if}
`;

code = code.replace(/\{\/if\}\n\n<style>/, `{/if}\n\n${modalHtml}\n\n<style>`);
fs.writeFileSync('src/routes/+page.svelte', code);
