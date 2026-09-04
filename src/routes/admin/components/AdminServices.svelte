<script lang="ts">
	import TextInput from '$lib/components/ui/TextInput.svelte';
	import SelectInput from '$lib/components/ui/SelectInput.svelte';
	import ToggleInput from '$lib/components/ui/ToggleInput.svelte';
	import UrlInput from '$lib/components/ui/UrlInput.svelte';

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

	let isAddServiceExpanded = $state(false);
	let isCreatingCategory = $state(false);
	let newCategoryName = $state("");
	let newServiceCategoryId = $state("");

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
	<div class="bg-white dark:bg-gray-800 shadow-md rounded-2xl border border-gray-100 dark:border-gray-700">
		<button 
			onclick={() => isAddServiceExpanded = !isAddServiceExpanded}
			class="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
		>
			<div class="flex items-center space-x-3">
				<div class="p-1.5 bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400 rounded-lg">
					<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						{#if isAddServiceExpanded}
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
						{:else}
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
						{/if}
					</svg>
				</div>
				<h3 class="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">Aggiungi Servizio</h3>
			</div>
		</button>
		
		{#if isAddServiceExpanded}
		<div transition:slide|local class="px-5 pb-6 border-t border-gray-100 dark:border-gray-700 pt-5">
			<form method="POST" action="?/createService" use:enhance class="space-y-5">
								<!-- Row 1: Nome, URL -->
				<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
					<TextInput label="Nome" name="name" id="name" required />
					<UrlInput label="URL (Richiesto)" name="url" id="url" required />
				</div>

				<!-- Row 2: Icona, Descrizione -->
				<div class="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start mt-4">
					<div class="flex gap-2 items-center">
						<TextInput label="Icona" name="icon" id="icon" placeholder="Nome o carica ->" />
						<label class="cursor-pointer border border-gray-200 dark:border-gray-700 rounded-xl w-[42px] h-[42px] flex items-center justify-center transition-colors bg-white dark:bg-gray-800 shadow-sm shrink-0 hover:bg-gray-50 dark:hover:bg-gray-700">
							<svg class="h-5 w-5 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
							</svg>
							<input type="file" accept="image/png, image/svg+xml, image/jpeg" class="hidden" onchange={async (e) => {
								const target = e.target; const file = target.files?.[0]; if (!file) return;
								const formData = new FormData(); formData.append('file', file);
								const btn = target.parentElement; btn.classList.add('opacity-50');
								try {
									const res = await fetch('/api/icons', { method: 'POST', body: formData });
									const data = await res.json();
									if (data.url) (document.getElementById("icon")).value = data.url;
								} catch (err) { console.error(err); } finally { btn.classList.remove('opacity-50'); }
							}} />
						</label>
					</div>
					<TextInput label="Descrizione" name="description" id="description" />
				</div>

				<!-- Row 3: Categoria, Ping, Widget, Button -->
				<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end mt-4">
					<div class="flex flex-col gap-2">
						{#if isCreatingCategory}
							<div class="flex gap-2 h-[42px]">
								<TextInput label="Nome" bind:value={newCategoryName} />
								<button type="button" onclick={async () => {
									if (!newCategoryName) { isCreatingCategory = false; return; }
									try {
										const res = await fetch('/api/categories/create', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ name: newCategoryName }) });
										if (res.ok) {
											const data = await res.json();
											localCategories = [...localCategories, data.category];
											newServiceCategoryId = data.category.id;
											isCreatingCategory = false;
										}
									} catch(e) { console.error(e); }
								}} class="px-3 bg-green-600 text-white rounded-xl hover:bg-green-700 text-sm font-medium whitespace-nowrap">Ok</button>
								<button type="button" onclick={() => isCreatingCategory = false} class="px-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 text-sm font-medium">X</button>
							</div>
						{:else}
							<SelectInput label="Categoria" name="categoryId" bind:value={newServiceCategoryId} required options={[{value: '', label: '-- Seleziona --'}, ...localCategories.map(c => ({value: c.id, label: c.name})), {value: 'new_category_trigger', label: '+ Nuova...', class: 'font-bold text-blue-600'}]} onchange={(val) => { if (val === 'new_category_trigger') { isCreatingCategory = true; newServiceCategoryId = ''; } }} />
						{/if}
					</div>

					<ToggleInput label="Ping" name="pingEnabled" value="true" checked={true} />

					<SelectInput label="Widget" name="widgetType" options={[{value: '', label: 'Nessuno'}, {value: 'qbittorrent', label: 'qBittorrent'}]} />

					<div>
						<button type="submit" class="w-full inline-flex items-center justify-center px-4 py-2.5 border border-transparent rounded-xl shadow-md shadow-green-500/30 text-sm font-bold uppercase tracking-wider text-white bg-green-600 hover:bg-green-700 hover:shadow-lg focus:outline-none transition-all h-[42px]">
							<svg class="-ml-1 mr-1.5 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
							</svg>
							Salva
						</button>
					</div>
				</div>
			</form>
		</div>
		{/if}
	</div>
	
	<!-- Services Grouped by Categories List -->
	<div class="space-y-6">
		{#each localCategories as category}
			{@const catId = category.id}
			{@const categoryName = category.name}
			{#if groupedServices[catId]}
			
			<div class="bg-white dark:bg-gray-800 shadow-md rounded-2xl border border-gray-100 dark:border-gray-700">
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
									<div transition:slide class="space-y-4 w-full bg-white dark:bg-gray-800 p-5 mt-2 rounded-xl border border-gray-200 dark:border-gray-700 shadow-md relative"><div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-t-xl"></div>
										<!-- Row 1: Nome, URL -->
										<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
											<TextInput label="Nome" name="name" value={service.name} required />
											<UrlInput label="URL (Richiesto)" name="url" value={service.url} required />
										</div>
										
										<!-- Row 2: Icona, Descrizione -->
										<div class="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
											<div class="flex gap-2 items-center">
												<TextInput label="Icona" name="icon" id={"icon_edit_" + service.id} value={service.icon || ''} />
												<label class="cursor-pointer border border-gray-200 dark:border-gray-700 rounded-xl w-[42px] h-[42px] flex items-center justify-center transition-colors bg-white dark:bg-gray-800 shadow-sm shrink-0 hover:bg-gray-50 dark:hover:bg-gray-700">
													<svg class="h-5 w-5 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
														<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
													</svg>
													<input type="file" accept="image/png, image/svg+xml, image/jpeg" class="hidden" onchange={async (e) => {
														const target = e.target; const file = target.files?.[0];
														if (!file) return;
														const formData = new FormData(); formData.append('file', file);
														const btn = target.parentElement; btn.classList.add('opacity-50');
														try {
															const res = await fetch('/api/icons', { method: 'POST', body: formData });
															const data = await res.json();
															if (data.url) (document.getElementById("icon_edit_" + service.id)).value = data.url;
														} catch (err) { console.error(err); } finally { btn.classList.remove('opacity-50'); }
													}} />
												</label>
											</div>
											<TextInput label="Descrizione" name="description" value={service.description || ''} />
										</div>
										
										<!-- Row 3: Categoria, Ping, Widget, Button -->
										<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
											<SelectInput label="Categoria" name="categoryId" value={service.categoryId} required options={localCategories.map(c => ({value: c.id, label: c.name}))} />

											<ToggleInput label="Ping" name="pingEnabled" value="true" checked={service.pingEnabled} />

											<SelectInput label="Widget" name="widgetType" value={service.widgetType || ''} options={[{value: '', label: 'Nessuno'}, {value: 'qbittorrent', label: 'qBittorrent'}]} />

											<div class="flex gap-2 h-[42px]">
												<button type="button" onclick={() => editingServiceId = null} class="flex-1 inline-flex items-center justify-center border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm">
													X
												</button>
												<button type="submit" class="flex-[2] inline-flex items-center justify-center border border-transparent rounded-xl shadow-sm text-sm font-bold uppercase tracking-wider text-white bg-blue-600 hover:bg-blue-700 focus:outline-none transition-colors">
													<svg class="-ml-1 mr-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
														<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
													</svg>
													Salva
												</button>
											</div>
										</div>
									</div>
								</form>
							{:else}
								<div class="flex items-center justify-between w-full">
									<div class="flex items-center">
										<svg class="h-5 w-5 text-gray-400 mr-3 hidden sm:block cursor-grab" fill="none" viewBox="0 0 24 24" stroke="currentColor">
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8h16M4 16h16" />
										</svg>
										{#if service.iconDetails}
											<div class="h-8 w-8 rounded-lg flex items-center justify-center mr-3 shadow-sm border border-gray-200 dark:border-gray-700" style="background-color: {service.iconDetails.hex || '#4B5563'};">
												{#if service.iconDetails.isCustomUrl}
													<img src={service.iconDetails.url} alt={service.name} class="h-8 w-8 rounded-lg object-contain bg-white dark:bg-gray-800 p-0.5" />
												{:else}
													<img src={service.iconDetails.url} alt={service.name} class="h-5 w-5" />
												{/if}
											</div>
										{:else if service.icon}
											<div class="h-8 w-8 rounded-lg flex items-center justify-center mr-3 shadow-sm border border-gray-200 dark:border-gray-700 bg-gray-500">
												<span class="text-sm font-bold uppercase text-white">{service.icon.charAt(0)}</span>
											</div>
										{:else}
											<div class="h-8 w-8 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center mr-3 text-gray-500 dark:text-gray-400">
												<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
											</div>
										{/if}
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
			{/if}
		{/each}
	</div>
</div>
