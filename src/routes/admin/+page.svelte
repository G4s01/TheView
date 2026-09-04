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
	let isDiscovering = $state(false);

	$effect(() => {
		if (activeTab === 'discovery' && discoveredServices.length === 0 && !isDiscovering) {
			fetchDiscovery();
		}
	});

	let npmUrl = $state('');
	let npmEmail = $state('');
	let npmPassword = $state('');
	
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
				body: JSON.stringify({ npmUrl, npmEmail, npmPassword })
			});

			const res = await fetch('/api/discovery');
			if (res.ok) {
				const data = await res.json();
				discoveredServices = data.services;
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
		<div class="space-y-6">
			<!-- Credenziali NPM -->
			<div class="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700 px-4 py-5 sm:p-6">
				<h3 class="text-lg leading-6 font-medium text-gray-900 dark:text-white mb-2">Credenziali Nginx Proxy Manager (Opzionale)</h3>
				<p class="text-sm text-gray-500 dark:text-gray-400 mb-4">Se inserite, TheView interrogherà NPM per auto-rilevare gli host.</p>
				<div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
					<div>
						<label class="block text-sm font-medium text-gray-700 dark:text-gray-300">URL NPM</label>
						<input type="url" bind:value={npmUrl} placeholder="http://172.17.0.1:81" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm">
					</div>
					<div>
						<label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
						<input type="email" bind:value={npmEmail} placeholder="admin@example.com" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm">
					</div>
					<div>
						<label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
						<input type="password" bind:value={npmPassword} class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm">
					</div>
				</div>
			</div>

			<div class="flex items-center justify-between">
				<p class="text-sm text-gray-500 dark:text-gray-400">
					Questi servizi sono stati trovati su Docker o Nginx Proxy Manager ma non sono ancora in dashboard.
				</p>
				<button 
					onclick={fetchDiscovery}
					disabled={isDiscovering}
					class="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
				>
					{isDiscovering ? 'Scansione...' : 'Aggiorna'}
				</button>
			</div>

			<div class="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
				<ul class="divide-y divide-gray-200 dark:divide-gray-700">
					{#if isDiscovering}
						<li class="px-4 py-8 text-center text-sm text-gray-500">Ricerca in corso...</li>
					{:else if discoveredServices.length === 0}
						<li class="px-4 py-8 text-center text-sm text-gray-500">Nessun nuovo servizio trovato.</li>
					{/if}

					{#each discoveredServices as ds}
						<li class="px-4 py-4 sm:px-6 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50">
							<div>
								<div class="flex items-center space-x-2">
									<p class="text-sm font-medium text-gray-900 dark:text-white truncate">{ds.name}</p>
									<span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full {ds.source === 'npm' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}">
										{ds.source}
									</span>
								</div>
								{#if ds.url}
									<p class="text-sm text-blue-600 dark:text-blue-400 truncate mt-1">{ds.url}</p>
								{/if}
								{#if ds.description}
									<p class="text-xs text-gray-500 dark:text-gray-400 mt-1">{ds.description}</p>
								{/if}
							</div>
							
							<div class="ml-4">
								<form method="POST" action="?/createService" use:enhance class="flex items-center space-x-2">
									<input type="hidden" name="name" value={ds.name}>
									<input type="hidden" name="url" value={ds.url || 'http://'}>
									<!-- Default to the first category for fast insertion -->
									<input type="hidden" name="categoryId" value={localCategories.length > 0 ? localCategories[0].id : ''}>
									<input type="hidden" name="icon" value={ds.name}>
									<button type="submit" class="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-green-600 hover:bg-green-700">
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

