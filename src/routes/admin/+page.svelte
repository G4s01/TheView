<script lang="ts">
	import AdminServices from './components/AdminServices.svelte';
	import AdminCategories from './components/AdminCategories.svelte';
	import AdminDiscovery from './components/AdminDiscovery.svelte';
	import AdminSettings from './components/AdminSettings.svelte';

	let { data, form } = $props();
	
	let services = $derived(data.services);
	let localCategories = $state<any[]>([]);
	
	$effect(() => {
		if (data.categories) {
			localCategories = JSON.parse(JSON.stringify(data.categories));
		}
	});

	let activeTab = $state('services');
</script>

<svelte:head>
	<title>Admin - TheView</title>
</svelte:head>

<div class="max-w-7xl mx-auto space-y-6">
	<div>
		<h2 class="text-2xl font-bold text-gray-900 dark:text-white uppercase tracking-wider">Admin Panel</h2>
		<p class="mt-1 text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wider">Manage your homelab services and categories.</p>
	</div>

	<div class="border-b border-gray-200 dark:border-gray-700">
		<nav class="-mb-px flex space-x-8">
			<button
				onclick={() => activeTab = 'services'}
				class="whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm uppercase tracking-wider transition-colors {activeTab === 'services' ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'}"
			>
				Servizi
			</button>
			<button
				onclick={() => activeTab = 'categories'}
				class="whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm uppercase tracking-wider transition-colors {activeTab === 'categories' ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'}"
			>
				Categorie
			</button>
			<button
				onclick={() => activeTab = 'discovery'}
				class="whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm uppercase tracking-wider transition-colors {activeTab === 'discovery' ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'}"
			>
				Discovery
			</button>
			<button
				onclick={() => activeTab = 'settings'}
				class="whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm uppercase tracking-wider transition-colors {activeTab === 'settings' ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'}"
			>
				Impostazioni
			</button>
		</nav>
	</div>

	{#if form?.error}
		<div class="p-4 rounded-md bg-red-50 text-red-700 dark:bg-red-900/50 dark:text-red-200">
			{form.error}
		</div>
	{/if}

	{#if activeTab === 'services'}
		<div class="animate-in fade-in slide-in-from-bottom-2 duration-300">
			<AdminServices {services} {localCategories} />
		</div>
	{:else if activeTab === 'categories'}
		<div class="animate-in fade-in slide-in-from-bottom-2 duration-300">
			<AdminCategories bind:localCategories />
		</div>
	{:else if activeTab === 'discovery'}
		<div class="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
			<AdminDiscovery bind:localCategories />
		</div>
	{:else if activeTab === 'settings'}
		<div class="animate-in fade-in slide-in-from-bottom-2 duration-300">
			<AdminSettings />
		</div>
	{/if}
</div>
