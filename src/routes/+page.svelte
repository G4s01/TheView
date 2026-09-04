<script lang="ts">
	import ServiceCard from '$lib/components/ServiceCard.svelte';
	import QuickEditModal from '$lib/components/QuickEditModal.svelte';
	import { onMount, onDestroy } from 'svelte';
	import { appState } from '$lib/client/state.svelte';
	import { dndzone } from 'svelte-dnd-action';
	import { flip } from 'svelte/animate';
	
	let { data } = $props();
	
	// Create local mutable state for drag and drop
	let localGroups = $state<Record<string, any[]>>({});
	
	$effect(() => {
		// Sync local state when data changes from server (e.g., after quick edit)
		if (data.groupedServices) {
			localGroups = JSON.parse(JSON.stringify(data.groupedServices));
		}
	});
	
	let statuses = $state<Record<number, { isOnline: boolean; latencyMs?: number }>>({});
	let interval: ReturnType<typeof setInterval>;
	
	// Quick Edit state
	let showQuickEdit = $state(false);
	let editingService = $state<any>(null);
	
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
	
	const flipDurationMs = 200;
	
	function handleDndConsider(e: CustomEvent, categoryName: string) {
		localGroups[categoryName] = e.detail.items;
	}
	
	async function handleDndFinalize(e: CustomEvent, categoryName: string) {
		localGroups[categoryName] = e.detail.items;
		
		if (appState.isEditMode) {
			// Save new order to DB
			const orderedIds = localGroups[categoryName].map((s: any) => s.id);
			const cat = data.categories.find((c: any) => c.name === categoryName);
			
			fetch('/api/services/reorder', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ orderedIds, categoryId: cat?.id })
			}).catch(console.error);
		}
	}
	
	function openQuickEdit(service: any) {
		editingService = service;
		showQuickEdit = true;
	}
</script>

<svelte:head>
	<title>TheView - Homelab Portal</title>
</svelte:head>

<div class="space-y-6">
	{#each Object.entries(localGroups) as [categoryName, services]}
		{#if services.length > 0 || appState.isEditMode}
		<section id="{categoryName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}" class="scroll-mt-24">
			<h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
				<span class="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 text-xs font-medium mr-2 px-2.5 py-0.5 rounded">
					{services.length}
				</span>
				{#if appState.isEditMode}
					<input 
						type="text" 
						value={categoryName} 
						class="bg-transparent border-b border-dashed border-gray-400 focus:border-blue-500 focus:outline-none w-auto" 
						title="Modifica Nome Categoria"
						onchange={async (e) => {
							const target = e.target as HTMLInputElement;
							if (target.value === categoryName || !target.value.trim()) return;
							const cat = data.categories.find(c => c.name === categoryName);
							if (cat) {
								try {
									await fetch('/api/categories/edit', { method: 'POST', body: JSON.stringify({ id: cat.id, name: target.value.trim() }) });
									window.location.reload();
								} catch (err) {}
							}
						}} 
					/>
				{:else}
					{categoryName}
				{/if}
			</h2>
			
			<div 
				class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 min-h-[100px]"
				use:dndzone={{items: services, flipDurationMs, dragDisabled: !appState.isEditMode}}
				onconsider={(e) => handleDndConsider(e, categoryName)}
				onfinalize={(e) => handleDndFinalize(e, categoryName)}
			>
				{#each services as service (service.id)}
					<div animate:flip={{duration: flipDurationMs}}>
						<ServiceCard {service} liveStatus={statuses[service.id]} onEdit={() => openQuickEdit(service)} />
					</div>
				{/each}
			</div>
		</section>
		{/if}
	{/each}
	
	{#if Object.keys(localGroups).length === 0}
		<div class="text-center py-20 bg-white dark:bg-gray-800 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
			<h3 class="mt-2 text-sm font-semibold text-gray-900 dark:text-white">No services found</h3>
			<p class="mt-1 text-sm text-gray-500 dark:text-gray-400">Get started by adding a new service in the admin panel.</p>
		</div>
	{/if}
</div>

<QuickEditModal 
	show={showQuickEdit} 
	service={editingService} 
	onClose={() => { showQuickEdit = false; editingService = null; }} 
	onSuccess={() => { 
		showQuickEdit = false; 
		editingService = null; 
		window.location.reload(); 
	}} 
/>
