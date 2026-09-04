<script lang="ts">
	import { enhance } from '$app/forms';
	import { dndzone } from 'svelte-dnd-action';
	import { flip } from 'svelte/animate';
	import { slide, fade } from 'svelte/transition';
	
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
	let isNpmEditing = $state(true);
	let showAdminPassword = $state(false);
	let showNpmPassword = $state(false);

	$effect(() => {
		if (activeTab === 'discovery' && discoveredServices.length === 0 && !isDiscovering) {
			fetchDiscovery();
		}
	});

	let npmScheme = $state('http://');
	let npmHost = $state('');
	let npmEmail = $state('');
	let npmPassword = $state('');
	let adminPassword = $state('');
	
	let isSettingsLoaded = $state(false);
	
	// Carica credenziali dal server
	$effect(() => {
		if (!isSettingsLoaded) {
			isSettingsLoaded = true;
			fetch('/api/settings').then(r => r.json()).then(data => {
				if (data.npmUrl) {
					if (data.npmUrl.startsWith('https://')) { npmScheme = 'https://'; npmHost = data.npmUrl.replace('https://', ''); }
					else { npmScheme = 'http://'; npmHost = data.npmUrl.replace('http://', ''); }
				}
				npmEmail = data.npmEmail || '';
				npmPassword = data.npmPassword || '';
				if (npmHost && npmEmail && npmPassword) isNpmEditing = false;
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
				body: JSON.stringify({ npmUrl: npmHost ? npmScheme + npmHost : '', npmEmail, npmPassword, ...(adminPassword ? { adminPassword } : {}) })
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
							<div class="relative">
								<input type={showAdminPassword ? "text" : "password"} bind:value={adminPassword} placeholder="Lascia vuoto per non cambiare" class="block w-full px-4 py-2.5 pr-10 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all dark:text-white">
								<button type="button" onclick={() => showAdminPassword = !showAdminPassword} class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
									{#if showAdminPassword}
										<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
									{:else}
										<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
									{/if}
								</button>
							</div>
						</div>
						<button
							onclick={async () => {
								if (!adminPassword) return alert("Inserisci una password!");
								try {
									await fetch('/api/settings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ adminPassword, npmUrl: npmHost ? npmScheme + npmHost : '', npmEmail, npmPassword }) });
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
						<div transition:slide class="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
							<div>
								<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Indirizzo NPM</label>
								<div class="flex">
									<select bind:value={npmScheme} class="block w-24 px-2 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-l-xl focus:ring-2 focus:ring-blue-500 dark:text-white border-r-0">
										<option value="http://">http://</option>
										<option value="https://">https://</option>
									</select>
									<input type="text" bind:value={npmHost} placeholder="172.17.0.1:81" class="block w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-r-xl focus:ring-2 focus:ring-blue-500 dark:text-white transition-all">
								</div>
							</div>
							<div>
								<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
								<input type="email" bind:value={npmEmail} placeholder="admin@example.com" class="block w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 dark:text-white transition-all">
							</div>
							<div>
								<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
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
					{:else}
						<div transition:slide class="bg-gray-50 dark:bg-gray-900 rounded-xl p-4 mb-6 flex items-center justify-between border border-gray-200 dark:border-gray-700">
							<div class="flex items-center gap-3">
								<div class="p-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg">
									<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
								</div>
								<div>
									<p class="text-sm font-medium text-gray-900 dark:text-white">Connesso a {npmScheme}{npmHost}</p>
									<p class="text-xs text-gray-500 dark:text-gray-400">Account: {npmEmail}</p>
								</div>
							</div>
							<button type="button" onclick={() => isNpmEditing = true} class="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
								Modifica Credenziali
							</button>
						</div>
					{/if}

					<div class="flex items-center justify-between border-t border-gray-100 dark:border-gray-700 pt-6">
						{#if npmHost && npmEmail && npmPassword}
							<button 
								onclick={async () => {
									if (!confirm("Sei sicuro di voler disconnettere NPM e cancellare le credenziali salvate?")) return;
									npmHost = ''; npmEmail = ''; npmPassword = '';
									isNpmEditing = true;
									await fetch('/api/settings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ npmUrl: npmHost ? npmScheme + npmHost : '', npmEmail, npmPassword }) });
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
									await fetch('/api/settings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ npmUrl: npmHost ? npmScheme + npmHost : '', npmEmail, npmPassword }) });
									isNpmEditing = false;
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
						<li class="px-6 py-5 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
							<div class="flex items-center">
								<div class="flex-shrink-0">
									<span class="inline-flex items-center justify-center h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold uppercase shadow-sm">
										{ds.name.charAt(0)}
									</span>
								</div>
								<div class="ml-4">
									<p class="text-sm font-semibold text-gray-900 dark:text-white">{ds.name}</p>
									<p class="text-sm text-gray-500 dark:text-gray-400 mt-0.5 truncate max-w-xs sm:max-w-md">{ds.url || ds.description}</p>
									<div class="mt-2 flex items-center gap-1.5">
										{#if ds.source === 'npm' || ds.source === 'npm+docker'}
											<span class="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400" title="Trovato via Nginx Proxy Manager">
												<svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0l-12 5.5v13l12 5.5 12-5.5v-13l-12-5.5zM12 21.5L2.5 17V7.5L12 3.1l9.5 4.4v9.5L12 21.5zM7.5 12.5v-3H9v3.5l3.5-3.5h2L11 13v3H9.5V12.5h-2z"/></svg>
											</span>
										{/if}
										{#if ds.source === 'docker' || ds.source === 'npm+docker'}
											<span class="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400" title="Trovato via Docker">
												<svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M13.983 11.078h2.119a.186.186 0 00.186-.185V9.006a.186.186 0 00-.186-.186h-2.119a.186.186 0 00-.185.186v1.886c0 .102.083.185.185.185zm-2.95 0h2.119a.186.186 0 00.185-.185V9.006a.186.186 0 00-.185-.186h-2.119a.186.186 0 00-.185.186v1.886c0 .102.082.185.185.185zm-2.949 0h2.119a.186.186 0 00.186-.185V9.006a.186.186 0 00-.186-.186H8.084a.186.186 0 00-.186.186v1.886c0 .102.083.185.186.185zm-2.95 0h2.119a.186.186 0 00.185-.185V9.006a.186.186 0 00-.185-.186H5.135a.186.186 0 00-.186.186v1.886c0 .102.083.185.186.185zm-2.95 0h2.12a.186.186 0 00.185-.185V9.006a.186.186 0 00-.185-.186h-2.12a.186.186 0 00-.185.186v1.886c0 .102.082.185.185.185zm11.799-2.95h2.119a.186.186 0 00.186-.185V6.057a.186.186 0 00-.186-.186h-2.119a.186.186 0 00-.185.186v1.886c0 .102.083.185.185.185zm-2.95 0h2.119a.186.186 0 00.185-.185V6.057a.186.186 0 00-.185-.186h-2.119a.186.186 0 00-.185.186v1.886c0 .102.082.185.185.185zm-2.949 0h2.119a.186.186 0 00.186-.185V6.057a.186.186 0 00-.186-.186H8.084a.186.186 0 00-.186.186v1.886c0 .102.083.185.186.185zm-2.95 0h2.119a.186.186 0 00.185-.185V6.057a.186.186 0 00-.185-.186H5.135a.186.186 0 00-.186.186v1.886c0 .102.083.185.186.185zm14.498 2.502h-1.637l-1.077-1.127a.18.18 0 00-.135-.054h-1.28c-.048 0-.092.019-.135.054l-1.077 1.127H1.942a.185.185 0 00-.185.185v4.526c0 .102.082.185.185.185h19.539a.186.186 0 00.186-.185v-4.526a.186.186 0 00-.186-.185z"/></svg>
											</span>
										{/if}
									</div>
								</div>
							</div>
							<div class="w-full sm:w-auto flex-1 flex justify-end">
								{#if ds.added}
									<span class="inline-flex items-center px-3 py-1.5 rounded-xl text-sm font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300">
										<svg class="mr-1.5 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
										Aggiunto
									</span>
								{:else}
									<form method="POST" action="?/createService" use:enhance={() => {
										return async ({ result, update }) => {
											if (result.type === 'success') {
												ds.added = true;
											}
											await update();
										};
									}} class="w-full">
										<div class="flex items-center justify-end">
											<button type="button" onclick={() => ds.expanded = !ds.expanded} class="inline-flex items-center justify-center w-10 h-10 border border-transparent rounded-full shadow-sm text-lg font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none transition-transform hover:scale-110">
												{#if ds.expanded || !ds.url}
													<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
												{:else}
													<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" /></svg>
												{/if}
											</button>
										</div>
										
										{#if ds.expanded || !ds.url}
											<div transition:slide|local={{ duration: 250 }} class="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 p-5 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 relative overflow-hidden">
												<!-- Decoration line -->
												<div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
												
												<div>
													<label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Nome</label>
													<input type="text" name="name" bind:value={ds.name} required class="block w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500" />
												</div>
												<div>
													<label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">URL (Richiesto)</label>
													<input type="url" name="url" bind:value={ds.url} placeholder="es. https://..." required class="block w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500" />
												</div>
												<div>
													<label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Descrizione</label>
													<input type="text" name="description" bind:value={ds.description} class="block w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500" />
												</div>
												<div>
													<label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Categoria</label>
													<div class="flex flex-col gap-2">
														{#if ds.isCreatingCategory}
															<div class="flex gap-2" transition:slide|local>
																<input type="text" bind:value={ds.newCategoryName} placeholder="Nome categoria" class="block w-full px-3 py-1.5 text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500" />
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
																}} class="px-3 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium whitespace-nowrap">Crea</button>
																<button type="button" onclick={() => ds.isCreatingCategory = false} class="px-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 text-sm font-medium">X</button>
															</div>
														{:else}
															<select name="categoryId" bind:value={ds.categoryId} class="block w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500" onchange={(e) => { if (e.target.value === 'new_category_trigger') ds.isCreatingCategory = true; }}>
																{#each localCategories as cat}
																	<option value={cat.id}>{cat.name}</option>
																{/each}
																<option value="new_category_trigger" class="font-bold text-blue-600">+ Nuova Categoria...</option>
															</select>
														{/if}
													</div>
												</div>
												<div class="sm:col-span-2">
													<label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Icona</label>
													<div class="flex gap-2">
														<input type="text" name="icon" id={"icon_dsc_" + ds.id} value={ds.name} class="block w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500" />
														<label class="cursor-pointer bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 flex items-center justify-center transition-colors">
															<svg class="h-5 w-5 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
																<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
															</svg>
															<input type="file" accept="image/png, image/svg+xml, image/jpeg" class="hidden" onchange={async (e) => {
																const target = e.target; const file = target.files?.[0];
																if (!file) return;
																
																const formData = new FormData();
																formData.append('file', file);
																const btn = target.parentElement; btn.classList.add('opacity-50');
																
																try {
																	const res = await fetch('/api/icons', { method: 'POST', body: formData });
																	const data = await res.json();
																	if (data.url) { (document.getElementById("icon_dsc_" + ds.id)).value = data.url; }
																} catch (err) { console.error(err); } finally { btn.classList.remove('opacity-50'); }
															}} />
														</label>
													</div>
												</div>
												<div class="sm:col-span-2 mt-2 flex justify-end">
													<button type="submit" class="inline-flex items-center px-6 py-2.5 border border-transparent rounded-xl shadow-md shadow-green-500/30 text-sm font-bold text-white bg-green-600 hover:bg-green-700 hover:shadow-lg focus:outline-none transition-all hover:scale-105">
														<svg class="-ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
															<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
														</svg>
														Aggiungi Servizio
													</button>
												</div>
											</div>
										{:else}
											<!-- Empty because the + button expands the block -->
										{/if}
									</form>
								{/if}
							</div>
						</li>
					{/each}
				</ul>
			</div>
		</div>
	{/if}

</div>

