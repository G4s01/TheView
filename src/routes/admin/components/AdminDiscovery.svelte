<script lang="ts">
	import TextInput from '$lib/components/ui/TextInput.svelte';
	import SelectInput from '$lib/components/ui/SelectInput.svelte';
	import ToggleInput from '$lib/components/ui/ToggleInput.svelte';

	import { slide } from 'svelte/transition';
	import { enhance } from '$app/forms';
	import { onMount } from 'svelte';
	
	let { localCategories = $bindable() } = $props();

	let discoveredServices = $state<any[]>([]);
	let npmError = $state<string | null>(null);
	let isDiscovering = $state(false);
	let expandedId = $state<string | null>(null);
	let isNpmEditing = $state(true);
	let showNpmPassword = $state(false);

	let npmScheme = $state('http://');
	let npmHost = $state('');
	let npmEmail = $state('');
	let npmPassword = $state('');

	onMount(async () => {
		const res = await fetch('/api/settings');
		const data = await res.json();
		if (data.npmUrl) {
			if (data.npmUrl.startsWith('https://')) { npmScheme = 'https://'; npmHost = data.npmUrl.replace('https://', ''); }
			else { npmScheme = 'http://'; npmHost = data.npmUrl.replace('http://', ''); }
		}
		npmEmail = data.npmEmail || '';
		npmPassword = data.npmPassword || '';
		if (npmHost && npmEmail && npmPassword) isNpmEditing = false;
		
		if (discoveredServices.length === 0 && !isDiscovering) {
			fetchDiscovery();
		}
	});

	async function fetchDiscovery() {
		isDiscovering = true;
		try {
			// Save settings first
			await fetch('/api/settings', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ npmUrl: npmHost ? npmScheme + npmHost : '', npmEmail, npmPassword })
			});

			const res = await fetch('/api/discovery');
			if (res.ok) {
				const data = await res.json();
				discoveredServices = data.services;
				npmError = data.npmError;
			}
		} catch (e) {
			console.error(e);
		} finally {
			isDiscovering = false;
		}
	}
</script>

<div class="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
	<!-- Settings & NPM Block -->
	<div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
		<!-- NPM Integration -->
		<div class="p-6">
			<div class="flex items-center space-x-3 mb-6">
				<img src="https://cdn.simpleicons.org/nginxproxymanager/4B5563" alt="NPM" class="w-8 h-8" />
				<div>
					<h3 class="text-xl font-bold uppercase tracking-wider text-gray-900 dark:text-white">Nginx Proxy Manager</h3>
					<p class="text-sm text-gray-500 dark:text-gray-400">Collega NPM per scovare automaticamente i tuoi servizi web esposti.</p>
				</div>
				<div class="flex-1"></div>
				{#if npmHost && npmEmail && npmPassword}
					<span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300">
						<span class="w-2 h-2 rounded-full bg-emerald-500 mr-2"></span>
						Configurato
					</span>
				{:else}
					<span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300">
						Non Configurato
					</span>
				{/if}
			</div>

			{#if isNpmEditing}
				<div  class="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
					<div>
						<label class="block text-sm font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1">Indirizzo NPM</label>
						<div class="flex">
							<select bind:value={npmScheme} class="block w-24 px-2 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-l-xl focus:ring-2 focus:ring-blue-500 dark:text-white border-r-0">
								<option value="http://">http://</option>
								<option value="https://">https://</option>
							</select>
							<input type="text" bind:value={npmHost} placeholder="192.168.1.100:81" class="block w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-r-xl focus:ring-2 focus:ring-blue-500 dark:text-white transition-all">
						</div>
					</div>
					<div>
						<label class="block text-sm font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1">Email</label>
						<input type="email" bind:value={npmEmail} placeholder="admin@example.com" class="block w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 dark:text-white transition-all">
					</div>
					<div>
						<label class="block text-sm font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1">Password</label>
						<div class="relative">
							<input type={showNpmPassword ? "text" : "password"} bind:value={npmPassword} placeholder="••••••••" class="block w-full px-4 py-2.5 pr-10 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 dark:text-white transition-all">
							<button type="button" onclick={() => showNpmPassword = !showNpmPassword} class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
								{#if showNpmPassword}
									<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
								{:else}
									<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
								{/if}
							</button>
						</div>
					</div>
				</div>
				<div class="flex items-center justify-end border-t border-gray-100 dark:border-gray-700 pt-6 space-x-3">
					{#if npmHost && npmEmail && npmPassword}
						<button onclick={() => isNpmEditing = false} class="px-5 py-2.5 text-gray-700 bg-gray-100 dark:bg-gray-800 dark:text-gray-300 font-bold uppercase tracking-wider rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">Annulla</button>
					{/if}
					<button
						onclick={async () => {
							await fetch('/api/settings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ npmUrl: npmHost ? npmScheme + npmHost : '', npmEmail, npmPassword }) });
							isNpmEditing = false;
						}}
						class="px-5 py-2.5 text-blue-700 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-300 font-bold uppercase tracking-wider rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
					>
						Salva
					</button>
				</div>
			{:else}
				<div  class="bg-gray-50 dark:bg-gray-900 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between border border-gray-200 dark:border-gray-700">
					<div class="flex items-center gap-3 mb-4 sm:mb-0">
						<div class="p-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg">
							<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
						</div>
						<div>
							<p class="text-sm font-medium text-gray-900 dark:text-white">Connesso a {npmScheme}{npmHost}</p>
							<p class="text-xs text-gray-500 dark:text-gray-400">Account: {npmEmail}</p>
						</div>
					</div>
					<div class="flex items-center space-x-3 w-full sm:w-auto justify-end">
						<button 
							onclick={async () => {
								if (!confirm("Sei sicuro di voler disconnettere NPM e cancellare le credenziali salvate?")) return;
								npmHost = ''; npmEmail = ''; npmPassword = '';
								isNpmEditing = true;
								await fetch('/api/settings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ npmUrl: '', npmEmail: '', npmPassword: '' }) });
							}}
							class="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 font-medium text-sm transition-colors flex items-center px-3 py-2 bg-red-50 dark:bg-red-900/20 rounded-lg"
						>
							<svg class="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
							Logout
						</button>
						<button type="button" onclick={() => isNpmEditing = true} class="px-3 py-2 text-sm font-bold uppercase tracking-wider text-gray-700 bg-gray-100 hover:bg-gray-200 dark:text-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-lg transition-colors">
							Modifica
						</button>
					</div>
				</div>
			{/if}

			<div class="mt-6 flex justify-end">
				<button
					onclick={fetchDiscovery}
					disabled={isDiscovering}
					class="flex items-center px-6 py-2.5 bg-blue-600 text-white font-bold uppercase tracking-wider rounded-xl shadow-md shadow-blue-500/20 hover:bg-blue-700 hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:hover:translate-y-0"
				>
					{#if isDiscovering}
						<svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
						Scansione in corso...
					{:else}
						<svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
						Esegui Discovery
					{/if}
				</button>
			</div>
		</div>
	</div>

	<!-- Discovery Results -->
	<div class="flex items-center justify-between">
		<h3 class="text-xl font-bold uppercase tracking-wider text-gray-900 dark:text-white">Risultati Discovery</h3>
	</div>

	{#if npmError}
		<div class="p-4 rounded-md bg-yellow-50 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200 border border-yellow-200 dark:border-yellow-800">
			<strong>NPM Error:</strong> {npmError}
			<p class="text-sm mt-1">Assicurati che TheView possa raggiungere questo indirizzo. Se sei in Docker, <code>localhost</code> punterà al container stesso, non all'host!</p>
		</div>
	{/if}

	<div class="bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden">
		<ul class="divide-y divide-gray-200 dark:divide-gray-700">
			{#if isDiscovering}
				<li class="px-6 py-12 text-center text-sm text-gray-500">Ricerca in corso su Docker e NPM...</li>
			{:else if discoveredServices.length === 0}
				<li class="px-6 py-12 text-center text-sm text-gray-500">
					<svg class="mx-auto h-12 w-12 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
					Nessun nuovo servizio trovato. Clicca "Esegui Discovery".
				</li>
			{/if}

			{#each discoveredServices as ds, i}
				<li class="px-6 py-5 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors flex flex-col gap-4 cursor-pointer" onclick={() => { expandedId = expandedId === ds.id ? null : ds.id; }}>
					<div class="flex items-center justify-between w-full">
						<div class="flex items-center space-x-4 flex-1 mr-4">
							<div class="flex-shrink-0">
								{#if ds.iconDetails}
									<div class="h-10 w-10 rounded-xl flex items-center justify-center shadow-sm border border-gray-200 dark:border-gray-700" style="background-color: {ds.iconDetails.hex || '#4B5563'};">
										{#if ds.iconDetails.isCustomUrl}
											<img src={ds.iconDetails.url} alt={ds.name} class="h-10 w-10 rounded-xl object-contain bg-white dark:bg-gray-800 p-0.5" />
										{:else}
											<img src={ds.iconDetails.url} alt={ds.name} class="h-6 w-6" />
										{/if}
									</div>
								{:else}
									<span class="inline-flex items-center justify-center h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold uppercase shadow-sm">
										{ds.name.charAt(0)}
									</span>
								{/if}
							</div>
							<div class="flex flex-col sm:flex-row sm:items-center sm:gap-3 flex-1 min-w-0">
								<div class="flex items-center gap-2">
									<p class="text-sm font-semibold text-gray-900 dark:text-white truncate">{ds.name}</p>
									<div class="flex items-center gap-1">
										{#if ds.source === 'npm' || ds.source === 'npm+docker'}
											<span class="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400" title="Trovato via Nginx Proxy Manager">
												<svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0l-12 5.5v13l12 5.5 12-5.5v-13l-12-5.5zM12 21.5L2.5 17V7.5L12 3.1l9.5 4.4v9.5L12 21.5zM7.5 12.5v-3H9v3.5l3.5-3.5h2L11 13v3H9.5V12.5h-2z"/></svg>
											</span>
										{/if}
										{#if ds.source === 'docker' || ds.source === 'npm+docker'}
											<span class="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400" title="Trovato via Docker">
												<svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M13.983 11.078h2.119a.186.186 0 00.186-.185V9.006a.186.186 0 00-.186-.186h-2.119a.186.186 0 00-.185.186v1.886c0 .102.083.185.185.185zm-2.95 0h2.119a.186.186 0 00.185-.185V9.006a.186.186 0 00-.185-.186h-2.119a.186.186 0 00-.185.186v1.886c0 .102.082.185.185.185zm-2.949 0h2.119a.186.186 0 00.186-.185V9.006a.186.186 0 00-.186-.186H8.084a.186.186 0 00-.186.186v1.886c0 .102.083.185.186.185zm-2.95 0h2.119a.186.186 0 00.185-.185V9.006a.186.186 0 00-.185-.186H5.135a.186.186 0 00-.186.186v1.886c0 .102.083.185.186.185zm-2.95 0h2.12a.186.186 0 00.185-.185V9.006a.186.186 0 00-.185-.186h-2.12a.186.186 0 00-.185.186v1.886c0 .102.082.185.185.185zm11.799-2.95h2.119a.186.186 0 00.186-.185V6.057a.186.186 0 00-.186-.186h-2.119a.186.186 0 00-.185.186v1.886c0 .102.083.185.185.185zm-2.95 0h2.119a.186.186 0 00.185-.185V6.057a.186.186 0 00-.185-.186h-2.119a.186.186 0 00-.185.186v1.886c0 .102.082.185.185.185zm-2.949 0h2.119a.186.186 0 00.186-.185V6.057a.186.186 0 00-.186-.186H8.084a.186.186 0 00-.186.186v1.886c0 .102.083.185.186.185zm-2.95 0h2.119a.186.186 0 00.185-.185V6.057a.186.186 0 00-.185-.186H5.135a.186.186 0 00-.186.186v1.886c0 .102.083.185.186.185zm14.498 2.502h-1.637l-1.077-1.127a.18.18 0 00-.135-.054h-1.28c-.048 0-.092.019-.135.054l-1.077 1.127H1.942a.185.185 0 00-.185.185v4.526c0 .102.082.185.185.185h19.539a.186.186 0 00.186-.185v-4.526a.186.186 0 00-.186-.185z"/></svg>
											</span>
										{/if}
									</div>
								</div>
								<p class="text-sm text-gray-500 dark:text-gray-400 truncate flex-1">{ds.url || ds.description}</p>
							</div>
						</div>
						
						<div>
							{#if ds.added}
								<span class="inline-flex items-center px-3 py-1.5 rounded-xl text-sm font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300">
									<svg class="mr-1.5 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
									Aggiunto
								</span>
							{:else}
								<button type="button" onclick={(e) => { e.stopPropagation(); expandedId = expandedId === ds.id ? null : ds.id; }} class="inline-flex items-center justify-center w-10 h-10 border border-transparent rounded-full shadow-sm text-lg font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none transition-transform hover:scale-110">
									{#if expandedId === ds.id}
										<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
									{:else}
										<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" /></svg>
									{/if}
								</button>
							{/if}
						</div>
					</div>
					
					{#if !ds.added && expandedId === ds.id}
						<form method="POST" action="?/createService" onclick={(e) => e.stopPropagation()} use:enhance={() => {
							return async ({ result, update }) => {
								if (result.type === 'success') {
									ds.added = true;
									expandedId = null;
								}
								await update();
							};
						}} class="w-full mt-2">
							<div  class="space-y-4 p-5 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 relative overflow-hidden">
								<!-- Decoration line -->
								<div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-600"></div>

								<div class="space-y-4 relative w-full pt-2">
									<!-- Row 1: Nome, URL -->
									<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
										<TextInput label="Nome" name="name" bind:value={ds.name} required />
										<TextInput label="URL (Richiesto)" type="url" name="url" bind:value={ds.url} required />
									</div>
									
									<!-- Row 2: Icona, Descrizione -->
									<div class="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
										<div class="flex gap-2 items-center">
											<TextInput label="Icona" name="icon" id={"icon_dsc_" + ds.id} value={ds.icon || ds.name} />
											<label class="cursor-pointer border border-gray-200 dark:border-gray-700 rounded-xl w-[42px] h-[42px] flex items-center justify-center transition-colors shadow-sm shrink-0">
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
														if (data.url) { (document.getElementById("icon_dsc_" + ds.id) as HTMLInputElement).value = data.url; }
													} catch (err) { console.error(err); } finally { btn.classList.remove('opacity-50'); }
												}} />
											</label>
										</div>
										<TextInput label="Descrizione" name="description" bind:value={ds.description} />
									</div>
									
									<!-- Row 3: Categoria, Ping, Widget, Button -->
									<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
										<div class="flex flex-col gap-2">
											{#if ds.isCreatingCategory}
												<div class="flex gap-2 h-[42px]" >
													<TextInput label="Nome" bind:value={ds.newCategoryName} />
													<button type="button" onclick={async () => {
														if (!ds.newCategoryName) { ds.isCreatingCategory = false; return; }
														try {
															const res = await fetch('/api/categories/create', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ name: ds.newCategoryName }) });
															if (res.ok) {
																const data = await res.json();
																localCategories = [...localCategories, data.category];
																ds.categoryId = data.category.id;
																ds.isCreatingCategory = false;
															}
														} catch(e) { console.error(e); }
													}} class="px-3 bg-green-600 text-white rounded-xl hover:bg-green-700 text-sm font-medium">Ok</button>
													<button type="button" onclick={() => ds.isCreatingCategory = false} class="px-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 text-sm font-medium">X</button>
												</div>
											{:else}
												<SelectInput label="Categoria" name="categoryId" bind:value={ds.categoryId} onchange={(e) => { if ((e.target as HTMLSelectElement).value === 'new_category_trigger') { ds.isCreatingCategory = true; ds.categoryId = ''; } }}>
													<option value="" disabled selected={!ds.categoryId}>-- Seleziona --</option>
													{#each localCategories as cat}
														<option value={cat.id}>{cat.name}</option>
													{/each}
													<option value="new_category_trigger" class="font-bold text-blue-600">+ Nuova...</option>
												</SelectInput>
											{/if}
										</div>

										<ToggleInput label="Ping" name="pingEnabled" bind:checked={ds.pingEnabled} />

										<SelectInput label="Widget" name="widgetType" bind:value={ds.widgetType}>
											<option value="">Nessuno</option>
											<option value="qbittorrent">qBittorrent</option>
										</SelectInput>

										<div>
											<button type="submit" class="w-full inline-flex items-center justify-center px-4 py-2.5 border border-transparent rounded-xl shadow-md shadow-green-500/30 text-sm font-bold uppercase tracking-wider text-white bg-green-600 hover:bg-green-700 hover:shadow-lg focus:outline-none transition-all h-[42px]">
												<svg class="-ml-1 mr-1.5 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
													<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
												</svg>
												Aggiungi
											</button>
										</div>
									</div>
								</div>
							</div>
</form>
					{/if}
				</li>
			{/each}
		</ul>
	</div>
</div>

