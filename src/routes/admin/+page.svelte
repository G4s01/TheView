<script lang="ts">
	import AdminServices from './components/AdminServices.svelte';
	import AdminDiscovery from './components/AdminDiscovery.svelte';
	import AdminSettings from './components/AdminSettings.svelte';
	import AdminWidgets from './components/AdminWidgets.svelte';
	import { untrack } from 'svelte';

	let { data, form } = $props();
	
	let services = $derived(data.services);
	let localCategories = $state<any[]>(untrack(() => data.categories ? JSON.parse(JSON.stringify(data.categories)) : []));
	
	$effect(() => {
		if (data.categories) {
			// Update if data changes (e.g. navigation), but don't react to localCategories changes (like drag and drop)
			const serialized = JSON.stringify(data.categories);
			untrack(() => {
				if (JSON.stringify(localCategories) !== serialized) {
					localCategories = JSON.parse(serialized);
				}
			});
		}
	});

	let isLoading = $derived($navigating && $navigating.from?.url.pathname !== $navigating.to?.url.pathname);

	import { appState } from '$lib/client/state.svelte';
	import { page, navigating } from '$app/stores';
	let currentTab = $derived($page.url.searchParams.get('tab') || 'services');

	$effect(() => {
		if (currentTab !== appState.adminTab) {
			appState.adminTab = currentTab;
		}
	});
</script>

<svelte:head>
	<title>Admin - TheView</title>
</svelte:head>

<div class="max-w-7xl mx-auto space-y-6">


	{#if form?.error}
		<div class="p-4 rounded-md bg-destructive/10 text-destructive border border-destructive/20">
			{form.error}
		</div>
	{/if}

	
	{#if isLoading}
		<div class="space-y-4 animate-pulse">
			<div class="h-12 bg-muted/50 rounded-xl w-1/4"></div>
			<div class="h-100 bg-muted/20 rounded-xl w-full"></div>
		</div>
	{:else if currentTab === 'services'}

		<div class="animate-in fade-in slide-in-from-bottom-2 duration-300">
			<AdminServices {services} bind:localCategories />
		</div>
	{:else if currentTab === 'discovery'}
		<div class="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
			<AdminDiscovery bind:localCategories />
		</div>
	{:else if currentTab === 'widgets'}
		<div class="animate-in fade-in slide-in-from-bottom-2 duration-300">
			<AdminWidgets />
		</div>
	{:else if currentTab === 'settings'}
		<div class="animate-in fade-in slide-in-from-bottom-2 duration-300">
			<AdminSettings />
		</div>
	{/if}
</div>
