<script lang="ts">
	import ServiceCard from '$lib/components/ServiceCard.svelte';
	import { onMount, onDestroy } from 'svelte';
	
	let { data } = $props();
	let groupedServices = $derived(data.groupedServices);
	
	let statuses = $state<Record<number, { isOnline: boolean; latencyMs?: number }>>({});
	let interval: ReturnType<typeof setInterval>;
	
	async function fetchStatus() {
		try {
			const res = await fetch('/api/status');
			if (res.ok) {
				statuses = await res.json();
			}
		} catch (e) {
			console.error('Failed to fetch status', e);
		}
	}

	onMount(() => {
		fetchStatus();
		interval = setInterval(fetchStatus, 10000); // 10s polling
	});
	
	onDestroy(() => {
		if (interval) clearInterval(interval);
	});
</script>

<svelte:head>
	<title>TheView - Homelab Portal</title>
</svelte:head>

<div class="space-y-6">
	{#each Object.entries(groupedServices) as [categoryName, services]}
		<section id="{categoryName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}">
			<h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
				<span class="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 text-xs font-medium mr-2 px-2.5 py-0.5 rounded">
					{services.length}
				</span>
				{categoryName}
			</h2>
			
			<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
				{#each services as service}
					<ServiceCard {service} liveStatus={statuses[service.id]} />
				{/each}
			</div>
		</section>
	{/each}
	
	{#if Object.keys(groupedServices).length === 0}
		<div class="text-center py-20 bg-white dark:bg-gray-800 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
			<h3 class="mt-2 text-sm font-semibold text-gray-900 dark:text-white">No services found</h3>
			<p class="mt-1 text-sm text-gray-500 dark:text-gray-400">Get started by adding a new service in the admin panel.</p>
		</div>
	{/if}
</div>
