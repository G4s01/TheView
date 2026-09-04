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

	import { appState } from '$lib/client/state.svelte';
</script>

<svelte:head>
	<title>Admin - TheView</title>
</svelte:head>

<div class="max-w-7xl mx-auto space-y-6">


	{#if form?.error}
		<div class="p-4 rounded-md bg-red-50 text-red-700 dark:bg-red-900/50 dark:text-red-200">
			{form.error}
		</div>
	{/if}

	{#if appState.adminTab === 'services'}
		<div class="animate-in fade-in slide-in-from-bottom-2 duration-300">
			<AdminServices {services} {localCategories} />
		</div>
	{:else if appState.adminTab === 'categories'}
		<div class="animate-in fade-in slide-in-from-bottom-2 duration-300">
			<AdminCategories bind:localCategories {services} />
		</div>
	{:else if appState.adminTab === 'discovery'}
		<div class="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
			<AdminDiscovery bind:localCategories />
		</div>
	{:else if appState.adminTab === 'settings'}
		<div class="animate-in fade-in slide-in-from-bottom-2 duration-300">
			<AdminSettings />
		</div>
	{/if}
</div>
