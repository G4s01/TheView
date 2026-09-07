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
	import { onMount } from 'svelte';
	import { ArrowUpCircle, Box, GripHorizontal, Plus, AlertTriangle, Upload, Check, Trash2, X } from "@lucide/svelte";
	import ServiceForm from '$lib/components/ServiceForm.svelte';
	import ConfirmDeleteButton from '$lib/components/ui/ConfirmDeleteButton.svelte';
	import ServiceIcon from '$lib/components/ui/ServiceIcon.svelte';

	let { services, localCategories = $bindable() } = $props();

	let updateStatuses = $state<Record<number, { updateAvailable: boolean, updateUrl?: string }>>({});

	onMount(() => {
		services.forEach((s: any) => {
			if (s.dockerImage) {
				fetch(`/api/docker/version?image=${encodeURIComponent(s.dockerImage)}`)
					.then(r => r.json())
					.then(d => {
						if (d.updateAvailable) {
							updateStatuses[s.id] = { updateAvailable: d.updateAvailable, updateUrl: d.updateUrl };
						}
					})
					.catch(() => {});
			}
		});
	});

	let editingServiceId = $state<number | null>(null);
	let deletingServiceId = $state<number | null>(null);
	
	let newService = $state({
		name: '',
		url: '',
		icon: '',
		description: '',
		categoryId: '',
		pingEnabled: true,
		widgetType: '',
		dockerImage: ''
	});
	
	let groupedServices = $state<Record<number, any[]>>({});
	
	// Create an untracked local copy to prevent infinite loops during drag
	let isDragging = $state(false);

	let isAddServiceExpanded = $state(false);
	let isCreatingCategory = $state(false);
	let newCategoryName = $state("");
	let newServiceCategoryId = $state("");
	let newPingEnabled = $state(true);

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
	<div class="bg-card text-card-foreground shadow-md rounded-2xl border border-border">
		<button 
			onclick={() => isAddServiceExpanded = !isAddServiceExpanded}
			class="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-muted transition-colors"
		>
			<div class="flex items-center space-x-3">
				<div class="p-1.5 bg-primary/20 text-primary rounded-lg">
					<Plus class="h-5 w-5" strokeWidth={1.5} />
				</div>
				<h3 class="text-sm font-bold text-foreground uppercase tracking-wider">Aggiungi Servizio</h3>
			</div>
		</button>
		
		{#if isAddServiceExpanded}
		<div transition:slide|local class="px-5 pb-6 border-t border-border pt-5">
			<ServiceForm 
				mode="add" 
				bind:service={newService} 
				bind:categories={localCategories} 
				action="?/createService" 
				useEnhance={true} 
			/>
		</div>
		{/if}
	</div>
	
	<!-- Services Grouped by Categories List -->
	<div class="space-y-6">
		{#each localCategories as category}
			{@const catId = category.id}
			{@const categoryName = category.name}
			{#if groupedServices[catId]}
			
			<div class="bg-card text-card-foreground shadow-md rounded-2xl border border-border">
				<div class="px-5 py-3 border-b border-border bg-muted/50 flex justify-between items-center">
					<h4 class="text-sm font-bold text-muted-foreground uppercase tracking-wider">{categoryName}</h4>
					<span class="text-xs font-bold text-muted-foreground bg-muted px-2 py-1 rounded-lg">{groupedServices[catId].length}</span>
				</div>
				
				<ul 
					class="divide-y divide-border min-h-15"
					use:dndzone={{items: groupedServices[catId], flipDurationMs, dropTargetStyle: { outline: '2px dashed hsl(var(--primary))', backgroundColor: 'hsl(var(--primary) / 0.05)' }}}
					onconsider={(e) => handleDndConsider(e, catId)}
					onfinalize={(e) => handleDndFinalize(e, catId)}
				>
					{#if groupedServices[catId].length === 0}
						<li class="px-5 py-8 text-center text-sm font-medium text-muted-foreground uppercase tracking-wider opacity-70">
							Trascina qui un servizio
						</li>
					{/if}
					
					{#each groupedServices[catId] as service, i (service.id)}
						<li animate:flip={{duration: flipDurationMs}} class="px-5 py-4 hover:bg-accent hover:text-accent-foreground transition-colors bg-card text-card-foreground cursor-move">
								<div class="flex items-center justify-between w-full">
									<div class="flex items-center">
										<GripHorizontal class="h-5 w-5 text-muted-foreground mr-3 hidden sm:block cursor-grab" strokeWidth={1.5} />
										<ServiceIcon icon={service.iconDetails?.value || service.icon} name={service.name} size="lg" iconStyle="rounded-xl" class="mr-3 shadow-sm border border-border" />
										<div>
											<p class="text-sm font-bold text-foreground uppercase tracking-wider">{service.name}</p>
											<p class="text-xs text-muted-foreground font-medium truncate w-48 sm:w-64 md:w-auto">{service.url}</p>
										</div>
									</div>
									<div class="flex items-center space-x-2">
										{#if updateStatuses[service.id]?.updateAvailable}
											<a href={updateStatuses[service.id].updateUrl} target="_blank" rel="noopener noreferrer" class="p-2 text-destructive hover:text-destructive/80 transition-colors relative" title="Aggiornamento Disponibile!">
												<span class="absolute inline-flex h-full w-full rounded-full bg-destructive opacity-40 animate-ping"></span>
												<ArrowUpCircle class="w-5 h-5 animate-pulse relative" />
											</a>
										{/if}
										<ConfirmDeleteButton 
											class="w-9 h-9"
											onConfirm={async () => {
												const formData = new FormData();
												formData.append('id', service.id.toString());
												await fetch('?/deleteService', { method: 'POST', body: formData });
												window.location.reload();
											}} 
										/>
										<button type="button" onclick={() => editingServiceId = editingServiceId === service.id ? null : service.id} class="p-2 text-primary hover:text-primary/80 transition-colors bg-primary/10 hover:bg-primary/20 rounded-lg shadow-sm" title={editingServiceId === service.id ? "Chiudi Modifica" : "Modifica Servizio"}>
											{#if editingServiceId === service.id}
												<X class="w-5 h-5" strokeWidth={2} />
											{:else}
												<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
											{/if}
										</button>
									</div>
								</div>
								
								{#if editingServiceId === service.id}
									<div transition:slide class="w-full mt-4 relative cursor-default" onclick={(e) => e.stopPropagation()} role="presentation">
										<div class="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-primary to-accent rounded-t-xl z-10"></div>
										<div class="p-5 bg-card text-card-foreground border border-border rounded-xl shadow-md">
											<ServiceForm 
												mode="edit" 
												bind:service={groupedServices[catId][i]} 
												bind:categories={localCategories} 
												action="?/updateService" 
												useEnhance={true} 
												hideDelete={true}
												hideCancel={true}
												enhanceFn={() => {
													return async ({ update }: any) => {
														editingServiceId = null;
														await update();
													};
												}}
											/>
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
