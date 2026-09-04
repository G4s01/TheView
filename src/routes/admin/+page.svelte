<script lang="ts">
	import { enhance } from '$app/forms';
	import { dndzone } from 'svelte-dnd-action';
	import { flip } from 'svelte/animate';
	
	let { data, form } = $props();
	
	let services = $derived(data.services);
	
	// Create local mutable state for category drag and drop
	let localCategories = $state<any[]>([]);
	
	$effect(() => {
		if (data.categories) {
			localCategories = JSON.parse(JSON.stringify(data.categories));
		}
	});

	let activeTab = $state('services');

	const flipDurationMs = 200;
	
	let discoveredServices = $state<any[]>([]);
	let npmError = $state<string | null>(null);
	let isDiscovering = $state(false);

	$effect(() => {
		if (activeTab === 'discovery' && discoveredServices.length === 0 && !isDiscovering) {
			fetchDiscovery();
		}
	});

	let npmUrl = $state('');
	let npmEmail = $state('');
	let npmPassword = $state('');
	let adminPassword = $state('');
	
	let isSettingsLoaded = $state(false);
	
	// Carica credenziali dal server
	$effect(() => {
		if (activeTab === 'discovery' && !isSettingsLoaded) {
			isSettingsLoaded = true;
			fetch('/api/settings').then(r => r.json()).then(data => {
				npmUrl = data.npmUrl || '';
				npmEmail = data.npmEmail || '';
				npmPassword = data.npmPassword || '';
			});
		}
	});

	async function fetchDiscovery() {
		isDiscovering = true;
		try {
			// Save settings first
			await fetch('/api/settings', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ npmUrl, npmEmail, npmPassword, ...(adminPassword ? { adminPassword } : {}) })
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
	
	function handleDndConsider(e: CustomEvent) {
		localCategories = e.detail.items;
	}
	
	async function handleDndFinalize(e: CustomEvent) {
		localCategories = e.detail.items;
		
		// Save new order to DB
		const orderedIds = localCategories.map((c: any) => c.id);
		fetch('/api/categories/reorder', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ orderedIds })
		}).catch(console.error);
	}
</script>

<svelte:head>
	<title>Admin - TheView</title>
</svelte:head>

<div class="max-w-7xl mx-auto space-y-6">
	<div>
		<h2 class="text-2xl font-bold text-gray-900 dark:text-white">Admin Panel</h2>
		<p class="mt-1 text-sm text-gray-500 dark:text-gray-400">Manage your homelab services and categories.</p>
	</div>

	<div class="border-b border-gray-200 dark:border-gray-700">
		<nav class="-mb-px flex space-x-8">
			<button
				onclick={() => activeTab = 'services'}
				class="whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm {activeTab === 'services' ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'}"
			>
				Servizi
			</button>
			<button
				onclick={() => activeTab = 'categories'}
				class="whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm {activeTab === 'categories' ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'}"
			>
				Categorie
			</button>
			<button
				onclick={() => activeTab = 'discovery'}
				class="whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm {activeTab === 'discovery' ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'}"
			>
				Discovery
			</button>
		</nav>
	</div>

	{#if form?.error}
		<div class="p-4 rounded-md bg-red-50 text-red-700 dark:bg-red-900/50 dark:text-red-200">
			{form.error}
		</div>
	{/if}

	{#if activeTab === 'services'}
		<div class="space-y-8">
			<!-- Add New Service Form -->
			<div class="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
				<div class="px-4 py-5 sm:p-6">
					<h3 class="text-lg leading-6 font-medium text-gray-900 dark:text-white mb-4">Add New Service</h3>
					<form method="POST" action="?/createService" use:enhance class="space-y-4">
						<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
							<div>
								<label for="name" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Name *</label>
								<input type="text" name="name" id="name" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm">
							</div>
							<div>
								<label for="url" class="block text-sm font-medium text-gray-700 dark:text-gray-300">URL *</label>
								<input type="url" name="url" id="url" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm">
							</div>
							<div>
								<label for="categoryId" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Category *</label>
								<select name="categoryId" id="categoryId" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm">
									{#each localCategories as category}
										<option value={category.id}>{category.name}</option>
									{/each}
								</select>
							</div>
							<div>
								<label for="icon" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Icona (SimpleIcons o Custom)</label>
								<div class="mt-1 flex space-x-2">
									<input type="text" name="icon" id="icon" placeholder="e.g. server o carica ->" class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm">
									<label class="cursor-pointer bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 flex items-center justify-center transition-colors">
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
								<label for="description" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Description (Optional)</label>
								<input type="text" name="description" id="description" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm">
							</div>
							<div>
								<label for="widgetType" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Widget Type (Optional)</label>
								<select name="widgetType" id="widgetType" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm">
									<option value="">None</option>
									<option value="qbittorrent">qBittorrent</option>
								</select>
							</div>
						</div>
						<div class="flex items-center mt-4">
							<input id="pingEnabled" name="pingEnabled" type="checkbox" checked class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600">
							<label for="pingEnabled" class="ml-2 block text-sm text-gray-900 dark:text-gray-300">Enable Ping (Health Check)</label>
						</div>
						<div class="pt-2">
							<button type="submit" class="inline-flex justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
								Save Service
							</button>
						</div>
					</form>
				</div>
			</div>

			<!-- Services List -->
			<div class="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
				<ul class="divide-y divide-gray-200 dark:divide-gray-700">
					{#each services as service}
						<li class="px-4 py-4 sm:px-6 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50">
							<div>
								<p class="text-sm font-medium text-blue-600 dark:text-blue-400 truncate">{service.name}</p>
								<p class="text-sm text-gray-500 dark:text-gray-400 truncate">{service.url}</p>
							</div>
							<div class="flex items-center space-x-4">
								<form method="POST" action="?/deleteService" use:enhance>
									<input type="hidden" name="id" value={service.id}>
									<button type="submit" class="text-sm text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">
										Delete
									</button>
								</form>
							</div>
						</li>
					{/each}
				</ul>
			</div>
		</div>
	{:else if activeTab === 'categories'}
		<!-- Categories Tab -->
		<div class="space-y-8">
			<!-- Add New Category -->
			<div class="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
				<div class="px-4 py-5 sm:p-6">
					<h3 class="text-lg leading-6 font-medium text-gray-900 dark:text-white mb-4">Aggiungi Categoria</h3>
					<form method="POST" action="?/createCategory" use:enhance class="flex items-end space-x-4">
						<div class="flex-1">
							<label for="cat_name" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Nome</label>
							<input type="text" name="name" id="cat_name" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm">
						</div>
						<button type="submit" class="inline-flex justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none">
							Aggiungi
						</button>
					</form>
				</div>
			</div>

			<!-- Categories List (DnD) -->
			<div class="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
				<div class="px-4 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
					<p class="text-sm text-gray-500 dark:text-gray-400">Trascina per riordinare. L'ordine si rifletterà sui menu e sulla homepage.</p>
				</div>
				<ul 
					class="divide-y divide-gray-200 dark:divide-gray-700 min-h-[50px]"
					use:dndzone={{items: localCategories, flipDurationMs}}
					onconsider={handleDndConsider}
					onfinalize={handleDndFinalize}
				>
					{#each localCategories as category (category.id)}
						<li 
							animate:flip={{duration: flipDurationMs}}
							class="px-4 py-4 sm:px-6 flex items-center justify-between bg-white dark:bg-gray-800 cursor-move hover:bg-gray-50 dark:hover:bg-gray-700/50"
						>
							<div class="flex items-center flex-1 mr-4">
								<svg class="h-5 w-5 text-gray-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8h16M4 16h16" />
								</svg>
								<form method="POST" action="?/updateCategory" use:enhance class="flex-1 flex items-center space-x-2">
									<input type="hidden" name="id" value={category.id}>
									<input type="text" name="name" value={category.name} required class="block w-full max-w-xs rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm">
									<button type="submit" class="text-sm text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300">
										Salva
									</button>
								</form>
							</div>
							<div class="flex items-center space-x-4">
								<form method="POST" action="?/deleteCategory" use:enhance onsubmit={() => confirm('Attenzione: cancellando la categoria eliminerai anche tutti i servizi al suo interno. Procedere?')}>
									<input type="hidden" name="id" value={category.id}>
									<button type="submit" class="text-sm text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">
										Elimina
									</button>
								</form>
							</div>
						</li>
					{/each}
				</ul>
			</div>
		</div>
		{:else if activeTab === 'discovery'}
		<div class="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
			<!-- Settings & NPM Block -->
			<div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
				
				<!-- App Settings -->
				<div class="p-6 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
					<div class="flex items-center space-x-3 mb-4">
						<div class="p-2 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-lg">
							<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
						</div>
						<h3 class="text-xl font-bold text-gray-900 dark:text-white">Sicurezza</h3>
					</div>
					<p class="text-sm text-gray-500 dark:text-gray-400 mb-4">La password di default è <code>admin</code>. Ti consigliamo di cambiarla per proteggere la tua dashboard.</p>
					
					<div class="flex items-end space-x-4">
						<div class="flex-1 max-w-sm">
							<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nuova Password Admin</label>
							<input type="password" bind:value={adminPassword} placeholder="Lascia vuoto per non cambiare" class="block w-full px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all dark:text-white">
						</div>
						<button
							onclick={async () => {
								if (!adminPassword) return alert("Inserisci una password!");
								try {
									await fetch('/api/settings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ adminPassword, npmUrl, npmEmail, npmPassword }) });
									adminPassword = '';
									alert("Password modificata!");
								} catch(e) { alert("Errore!"); }
							}}
							class="px-6 py-2.5 bg-gray-900 dark:bg-gray-700 text-white font-medium rounded-xl shadow-sm hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors"
						>
							Aggiorna
						</button>
					</div>
				</div>

				<!-- NPM Integration -->
				<div class="p-6">
					<div class="flex items-center space-x-3 mb-6">
						<img src="https://cdn.simpleicons.org/nginxproxymanager/4B5563" alt="NPM" class="w-8 h-8" />
						<div>
							<h3 class="text-xl font-bold text-gray-900 dark:text-white">Nginx Proxy Manager</h3>
							<p class="text-sm text-gray-500 dark:text-gray-400">Collega NPM per scovare automaticamente i tuoi servizi web esposti.</p>
						</div>
						<div class="flex-1"></div>
						{#if npmUrl && npmEmail && npmPassword}
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

					<div class="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
						<div>
							<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Indirizzo NPM</label>
							<input type="url" bind:value={npmUrl} placeholder="http://172.17.0.1:81" class="block w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 dark:text-white transition-all">
						</div>
						<div>
							<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
							<input type="email" bind:value={npmEmail} placeholder="admin@example.com" class="block w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 dark:text-white transition-all">
						</div>
						<div>
							<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
							<input type="password" bind:value={npmPassword} placeholder="••••••••" class="block w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 dark:text-white transition-all">
						</div>
					</div>

					<div class="flex items-center justify-between border-t border-gray-100 dark:border-gray-700 pt-6">
						{#if npmUrl && npmEmail && npmPassword}
							<button 
								onclick={async () => {
									npmUrl = ''; npmEmail = ''; npmPassword = '';
									await fetch('/api/settings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ npmUrl, npmEmail, npmPassword }) });
								}}
								class="text-red-500 hover:text-red-700 font-medium text-sm transition-colors flex items-center"
							>
								<svg class="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
								Disconnetti NPM
							</button>
						{:else}
							<div></div>
						{/if}

						<div class="flex space-x-3">
							<button
								onclick={async () => {
									await fetch('/api/settings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ npmUrl, npmEmail, npmPassword }) });
									alert('Credenziali salvate!');
								}}
								class="px-5 py-2.5 text-blue-700 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-300 font-medium rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
							>
								Salva
							</button>
							<button
								onclick={fetchDiscovery}
								disabled={isDiscovering}
								class="flex items-center px-6 py-2.5 bg-blue-600 text-white font-medium rounded-xl shadow-md shadow-blue-500/20 hover:bg-blue-700 hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:hover:translate-y-0"
							>
								{#if isDiscovering}
									<svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
									Scansione...
								{:else}
									<svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
									Esegui Discovery
								{/if}
							</button>
						</div>
					</div>
				</div>
			</div>

			<!-- Discovery Results -->
			<div class="flex items-center justify-between">
				<h3 class="text-xl font-bold text-gray-900 dark:text-white">Risultati Discovery</h3>
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

					{#each discoveredServices as ds}
						<li class="px-6 py-5 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors flex items-center justify-between">
							<div class="flex items-center">
								<div class="flex-shrink-0">
									<span class="inline-flex items-center justify-center h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold uppercase shadow-sm">
										{ds.name.charAt(0)}
									</span>
								</div>
								<div class="ml-4">
									<p class="text-sm font-semibold text-gray-900 dark:text-white">{ds.name}</p>
									<p class="text-sm text-gray-500 dark:text-gray-400 mt-0.5 truncate max-w-xs sm:max-w-md">{ds.url || ds.description}</p>
									<span class="mt-1.5 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
										Sorgente: {ds.source}
									</span>
								</div>
							</div>
							<div class="ml-4">
								<form method="POST" action="?/createService" use:enhance>
									<input type="hidden" name="name" value={ds.name}>
									<input type="hidden" name="url" value={ds.url || ('http://' + ds.name + '.local')}>
									<input type="hidden" name="description" value={ds.description}>
									<!-- Default to the first category for fast insertion -->
									<input type="hidden" name="categoryId" value={localCategories.length > 0 ? localCategories[0].id : ''}>
									<input type="hidden" name="icon" value={ds.name}>
									<button type="submit" class="inline-flex items-center px-4 py-2 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none transition-transform hover:scale-105">
										<svg class="-ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
										</svg>
										Aggiungi
									</button>
								</form>
							</div>
						</li>
					{/each}
				</ul>
			</div>
		</div>
	{/if}

</div>

