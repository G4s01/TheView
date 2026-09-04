<script lang="ts">
	import { enhance } from '$app/forms';
	import { slide } from 'svelte/transition';
	import { dndzone } from 'svelte-dnd-action';
	import { flip } from 'svelte/animate';
	import { invalidateAll } from '$app/navigation';

	let { services, localCategories } = $props();

	let editingServiceId = $state<number | null>(null);
	
	let groupedServices = $state<Record<number, any[]>>({});
	
	// Create an untracked local copy to prevent infinite loops during drag
	let isDragging = $state(false);

	$effect(() => {
		if (isDragging) return;
		
		const newGrouped: Record<number, any[]> = {};
		for (const cat of localCategories) {
			newGrouped[cat.id] = [];
		}
		
		for (const s of services) {
			if (!newGrouped[s.categoryId]) {
				newGrouped[s.categoryId] = [];
			}
			// Only add if not already in the array (though we recreate newGrouped entirely)
			newGrouped[s.categoryId].push(s);
		}
		
		for (const catId in newGrouped) {
			newGrouped[catId].sort((a, b) => (a.position || 0) - (b.position || 0));
		}
		
		groupedServices = newGrouped;
	});

	const flipDurationMs = 200;

	function handleDndConsider(e: CustomEvent, categoryId: number) {
		isDragging = true;
		groupedServices[categoryId] = e.detail.items;
	}
	
	async function handleDndFinalize(e: CustomEvent, categoryId: number) {
		groupedServices[categoryId] = e.detail.items;
		
		const orderedIds = groupedServices[categoryId].map((s: any) => s.id);
		
		try {
			await fetch('/api/services/reorder', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ orderedIds, categoryId })
			});
		} catch (err) {
			console.error(err);
		} finally {
			// After a short delay, turn off dragging flag and refresh data
			setTimeout(async () => {
				isDragging = false;
				await invalidateAll();
			}, 100);
		}
	}
</script>

<div class="space-y-8">
	<!-- Add New Service Form -->
	<div class="bg-white dark:bg-gray-800 shadow-md rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
		<div class="px-5 py-6">
			<h3 class="text-lg leading-6 font-bold text-gray-900 dark:text-white mb-4 uppercase tracking-wider">Aggiungi Servizio</h3>
			<form method="POST" action="?/createService" use:enhance class="space-y-5">
				<div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
					<div>
						<label for="name" class="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Nome *</label>
						<input type="text" name="name" id="name" required class="block w-full rounded-xl border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-900 dark:border-gray-600 dark:text-white sm:text-sm px-4 py-2.5">
					</div>
					<div>
						<label for="url" class="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">URL *</label>
						<input type="url" name="url" id="url" required class="block w-full rounded-xl border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-900 dark:border-gray-600 dark:text-white sm:text-sm px-4 py-2.5">
					</div>
					<div>
						<label for="categoryId" class="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Categoria *</label>
						<select name="categoryId" id="categoryId" required class="block w-full rounded-xl border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-900 dark:border-gray-600 dark:text-white sm:text-sm px-4 py-2.5">
							{#each localCategories as category}
								<option value={category.id}>{category.name}</option>
							{/each}
						</select>
					</div>
					<div>
						<label for="icon" class="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Icona (SimpleIcons o Custom)</label>
						<div class="flex gap-2">
							<input type="text" name="icon" id="icon" placeholder="es. server o carica ->" class="block w-full rounded-xl border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-900 dark:border-gray-600 dark:text-white sm:text-sm px-4 py-2.5">
							<label class="cursor-pointer bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-2.5 flex items-center justify-center transition-colors shadow-sm">
								<svg class="h-5 w-5 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
								</svg>
								<input type="file" accept="image/png, image/svg+xml, image/jpeg" class="hidden" onchange={async (e) => {
									const target = e.target as HTMLInputElement; const file = target.files?.[0];
									if (!file) return;
									
									const formData = new FormData();
									formData.append('file', file);
									
									const btn = target.parentElement as HTMLElement;
									btn.classList.add('opacity-50');
									
									try {
										const res = await fetch('/api/icons', { method: 'POST', body: formData });
										const data = await res.json();
										if (data.url) {
											(document.getElementById("icon") as HTMLInputElement).value = data.url;
										}
									} catch (err) {
										console.error(err);
									} finally {
										btn.classList.remove('opacity-50');
									}
								}} />
							</label>
						</div>
					</div>
					<div>
						<label for="description" class="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Descrizione (Opzionale)</label>
						<input type="text" name="description" id="description" class="block w-full rounded-xl border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-900 dark:border-gray-600 dark:text-white sm:text-sm px-4 py-2.5">
					</div>
					<div>
						<label for="widgetType" class="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Tipo Widget (Opzionale)</label>
						<select name="widgetType" id="widgetType" class="block w-full rounded-xl border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-900 dark:border-gray-600 dark:text-white sm:text-sm px-4 py-2.5">
							<option value="">Nessuno</option>
							<option value="qbittorrent">qBittorrent</option>
						</select>
					</div>
				</div>
					<div class="pt-2">
						<label class="relative inline-flex items-center cursor-pointer">
							<input type="checkbox" name="pingEnabled" checked class="sr-only peer">
							<div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
							<span class="ml-3 text-sm font-bold text-gray-900 dark:text-gray-300 uppercase tracking-wider">Abilita Ping (Health Check)</span>
						</label>
					</div>
				<div class="pt-4 flex justify-end">
					<button type="submit" class="inline-flex justify-center rounded-xl border border-transparent bg-green-600 py-2.5 px-6 text-sm font-bold text-white shadow-md shadow-green-500/30 hover:bg-green-700 hover:shadow-lg focus:outline-none uppercase tracking-wider transition-all hover:-translate-y-0.5">
						Salva Servizio
					</button>
				</div>
			</form>
		</div>
	</div>

	<!-- Services Grouped by Categories List -->
	<div class="space-y-6">
		{#each Object.keys(groupedServices) as catIdStr}
			{@const catId = parseInt(catIdStr)}
			{@const categoryName = localCategories.find(c => c.id === catId)?.name || 'Senza Categoria'}
			
			<div class="bg-white dark:bg-gray-800 shadow-md rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
				<div class="px-5 py-3 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50 flex justify-between items-center">
					<h4 class="text-sm font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">{categoryName}</h4>
					<span class="text-xs font-bold text-gray-400 bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded-lg">{groupedServices[catId].length}</span>
				</div>
				
				<ul 
					class="divide-y divide-gray-100 dark:divide-gray-700 min-h-[60px]"
					use:dndzone={{items: groupedServices[catId], flipDurationMs, dropTargetStyle: { outline: '2px dashed #3b82f6', backgroundColor: 'rgba(59, 130, 246, 0.05)' }}}
					onconsider={(e) => handleDndConsider(e, catId)}
					onfinalize={(e) => handleDndFinalize(e, catId)}
				>
					{#if groupedServices[catId].length === 0}
						<li class="px-5 py-8 text-center text-sm font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider opacity-70">
							Trascina qui un servizio
						</li>
					{/if}
					
					{#each groupedServices[catId] as service (service.id)}
						<li animate:flip={{duration: flipDurationMs}} class="px-5 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors bg-white dark:bg-gray-800 cursor-move">
							{#if editingServiceId === service.id}
								<form method="POST" action="?/updateService" use:enhance={() => {
									return async ({ update }) => {
										editingServiceId = null;
										await update();
									};
								}} class="w-full">
									<input type="hidden" name="id" value={service.id}>
									<div transition:slide|local class="grid grid-cols-1 sm:grid-cols-2 gap-4">
										<div>
											<label class="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">Nome</label>
											<input type="text" name="name" value={service.name} required class="block w-full px-4 py-2.5 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 dark:text-white" />
										</div>
										<div>
											<label class="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">URL</label>
											<input type="url" name="url" value={service.url} required class="block w-full px-4 py-2.5 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 dark:text-white" />
										</div>
										<div>
											<label class="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">Categoria</label>
											<select name="categoryId" class="block w-full px-4 py-2.5 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 dark:text-white">
												{#each localCategories as cat}
													<option value={cat.id} selected={cat.id === service.categoryId}>{cat.name}</option>
												{/each}
											</select>
										</div>
										<div>
											<label class="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">Icona</label>
											<div class="flex gap-2">
												<input type="text" name="icon" id={"icon_edit_" + service.id} value={service.icon || ''} class="block w-full px-4 py-2.5 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 dark:text-white" />
												<label class="cursor-pointer bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-2.5 flex items-center justify-center transition-colors shadow-sm">
													<svg class="h-5 w-5 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
														<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
													</svg>
													<input type="file" accept="image/png, image/svg+xml, image/jpeg" class="hidden" onchange={async (e) => {
														const target = e.target as HTMLInputElement; const file = target.files?.[0];
														if (!file) return;
														const formData = new FormData(); formData.append('file', file);
														const btn = target.parentElement as HTMLElement; btn.classList.add('opacity-50');
														try {
															const res = await fetch('/api/icons', { method: 'POST', body: formData });
															const data = await res.json();
															if (data.url) (document.getElementById("icon_edit_" + service.id) as HTMLInputElement).value = data.url;
														} catch (err) { console.error(err); } finally { btn.classList.remove('opacity-50'); }
													}} />
												</label>
											</div>
										</div>
										<div>
											<label class="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">Descrizione</label>
											<input type="text" name="description" value={service.description || ''} class="block w-full px-4 py-2.5 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 dark:text-white" />
										</div>
										<div>
											<label class="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">Tipo Widget</label>
											<select name="widgetType" class="block w-full px-4 py-2.5 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 dark:text-white">
												<option value="" selected={!service.widgetType}>Nessuno</option>
												<option value="qbittorrent" selected={service.widgetType === 'qbittorrent'}>qBittorrent</option>
											</select>
										</div>
										<div class="sm:col-span-2 pt-2">
											<label class="relative inline-flex items-center cursor-pointer">
												<input type="checkbox" name="pingEnabled" checked={service.pingEnabled} class="sr-only peer">
												<div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
												<span class="ml-3 text-sm font-bold uppercase tracking-wider text-gray-900 dark:text-gray-300">Abilita Ping</span>
											</label>
										</div>
										<div class="sm:col-span-2 mt-4 flex justify-end space-x-3 border-t border-gray-100 dark:border-gray-700 pt-4">
											<button type="button" onclick={() => editingServiceId = null} class="px-5 py-2.5 text-gray-700 bg-gray-100 hover:bg-gray-200 dark:text-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-xl text-sm font-bold uppercase tracking-wider transition-colors shadow-sm">
												Annulla
											</button>
											<button type="submit" class="px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 text-sm font-bold uppercase tracking-wider transition-colors shadow-md shadow-blue-500/20">
												Salva Modifiche
											</button>
										</div>
									</div>
								</form>
							{:else}
								<div class="flex items-center justify-between w-full">
									<div class="flex items-center">
										<svg class="h-5 w-5 text-gray-400 mr-3 hidden sm:block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8h16M4 16h16" />
										</svg>
										<div>
											<p class="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">{service.name}</p>
											<p class="text-xs text-gray-500 dark:text-gray-400 font-medium truncate w-48 sm:w-64 md:w-auto">{service.url}</p>
										</div>
									</div>
									<div class="flex items-center space-x-2">
										<button type="button" onclick={() => editingServiceId = service.id} class="p-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/40 rounded-lg shadow-sm" title="Modifica Servizio">
											<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
										</button>
										<form method="POST" action="?/deleteService" use:enhance onsubmit={(e) => { if(!confirm('Vuoi davvero eliminare questo servizio?')) e.preventDefault(); }}>
											<input type="hidden" name="id" value={service.id}>
											<button type="submit" class="p-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 rounded-lg shadow-sm" title="Elimina Servizio">
												<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
											</button>
										</form>
									</div>
								</div>
							{/if}
						</li>
					{/each}
				</ul>
			</div>
		{/each}
	</div>
</div>
