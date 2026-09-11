<script lang="ts">
	import ServiceCard from '$lib/components/ServiceCard.svelte';
	import { appState } from '$lib/client/state.svelte';
	import { dndzone } from 'svelte-dnd-action';
	import { flip } from 'svelte/animate';
	import { untrack } from 'svelte';
	import { goto, invalidateAll } from '$app/navigation';
	import { navigating } from '$app/stores';
	import { Plus } from '@lucide/svelte';

	let { data } = $props();

	let isLoading = $derived($navigating && $navigating.from?.url.pathname !== $navigating.to?.url.pathname);

	// Server-synced state (no spacers, used in view mode)
	let localGroups = $state<Record<string, any[]>>({});
	// Edit-mode state (with spacers for dnd vertical reordering)
	let dndGroups = $state<Record<string, any[]>>({});

	let editingServiceId = $state<number | null>(null);
	const flipDurationMs = 200;
	const SPACER_COUNT = 5;

	function isSpacer(item: any): boolean {
		return item?._isSpacer === true;
	}

	function createSpacers(catKey: string): any[] {
		return Array.from({ length: SPACER_COUNT }, () => ({
			id: `__spacer_${catKey}_${Math.random().toString(36).substring(2, 11)}`,
			_isSpacer: true,
			size: '1x1'
		}));
	}

	function realItemCount(items: any[]): number {
		return items.filter(i => !isSpacer(i)).length;
	}

	let totalRealServices = $derived(
		Object.values(data.groupedServices).reduce((sum, items) => sum + items.length, 0)
	);

	let enableCategories = $derived(data.settings?.enableCategories !== false);

	function getBentoClass(service: any, isEditing: boolean) {
		const baseSize = service.size || '1x1';
		if (!isEditing) return `bento-${baseSize}`;
		
		const [wStr, hStr] = baseSize.split('x');
		const expandedW = Math.max(2, parseInt(wStr) || 1);
		const expandedH = Math.max(2, parseInt(hStr) || 1);
		
		return `bento-${expandedW}x${expandedH}`;
	}

	// Sync from server data
	$effect.pre(() => {
		if (data.groupedServices) {
			if (enableCategories) {
				localGroups = JSON.parse(JSON.stringify(data.groupedServices));
			} else {
				// Flatten into a single group under Phantom Category, preserving their objects and filtering out spacers
				const allServices = Object.values(data.groupedServices)
					.flat()
					.filter(s => s && !s._isSpacer);
				// Sort alphabetically
				allServices.sort((a: any, b: any) => (a?.name || "").localeCompare(b?.name || ""));
				localGroups = { 'CATEGORIA FANTASMA': allServices };
			}
		}
	});

	async function addSpacer(categoryName: string) {
		let catId = -1;
		if (categoryName !== 'CATEGORIA FANTASMA') {
			const cat = data.categories.find((c: any) => c.name === categoryName);
			if (!cat) return;
			catId = cat.id;
		}
		
		const res = await fetch('/api/services/spacer', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ categoryId: catId })
		});
		if (res.ok) {
			const { service } = await res.json();
			service.category = categoryName;
			
			const items = dndGroups[categoryName] || [];
			// Find the index of the last real item (not a trailing spacer)
			let lastReal = -1;
			for (let i = items.length - 1; i >= 0; i--) {
				if (!isSpacer(items[i])) {
					lastReal = i;
					break;
				}
			}
			items.splice(lastReal + 1, 0, service);
			dndGroups[categoryName] = [...items];
		}
	}

	async function deleteSpacer(id: number, categoryName: string) {
		const res = await fetch('/api/services/spacer', {
			method: 'DELETE',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ id })
		});
		if (res.ok) {
			dndGroups[categoryName] = dndGroups[categoryName].filter(s => s.id !== id);
		}
	}

	function trimTrailingSpacers(items: any[]) {
		let lastRealIndex = -1;
		for (let i = items.length - 1; i >= 0; i--) {
			if (!isSpacer(items[i])) {
				lastRealIndex = i;
				break;
			}
		}
		return items.slice(0, lastRealIndex + 1);
	}

	// Manage spacers on edit mode transitions
	let wasEditMode = false;
	$effect.pre(() => {
		const isEdit = appState.isEditMode;
		if (isEdit && !wasEditMode) {
			// Entering edit mode: populate dndGroups from localGroups + spacers
			const result: Record<string, any[]> = {};
			const groups = untrack(() => localGroups);
			for (const [cat, items] of Object.entries(groups)) {
				result[cat] = [...JSON.parse(JSON.stringify(items)), ...createSpacers(cat)];
			}
			dndGroups = result;
		} else if (!isEdit && wasEditMode) {
			// Exiting edit mode: sync reordered items back to localGroups (keep internal spacers)
			const result: Record<string, any[]> = {};
			const groups = untrack(() => dndGroups);
			for (const [cat, items] of Object.entries(groups)) {
				result[cat] = trimTrailingSpacers(items);
			}
			localGroups = result;
			dndGroups = {};
		}
		wasEditMode = isEdit;
	});

	function handleDndConsider(e: CustomEvent, categoryName: string) {
		dndGroups[categoryName] = e.detail.items;
	}

	async function handleDndFinalize(e: CustomEvent, categoryName: string) {
		dndGroups[categoryName] = e.detail.items;

		if (appState.isEditMode) {
			// Save items and positions (including internal spacers)
			const trimmedItems = trimTrailingSpacers(dndGroups[categoryName]);
			const itemsWithPositions = trimmedItems.map((item, index) => ({
				id: isSpacer(item) ? null : item.id,
				position: index
			})).filter(item => item.id !== null);
			const cat = data.categories.find((c: any) => c.name === categoryName);

			fetch('/api/services/reorder', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ itemsWithPositions, categoryId: cat?.id })
			}).catch(console.error);
		}
	}
</script>

<svelte:head>
	<title>TheView - Homelab Portal</title>
</svelte:head>

{#if isLoading}
	<div class="flex flex-col gap-8 w-full animate-pulse mt-4">
		<div class="space-y-4">
			<div class="h-6 w-32 bg-muted/50 rounded"></div>
			<div class="flex flex-wrap gap-4 w-full">
				<div class="h-36 w-64 bg-muted/20 rounded-xl border border-border/10"></div>
				<div class="h-36 w-64 bg-muted/20 rounded-xl border border-border/10"></div>
				<div class="h-36 w-64 bg-muted/20 rounded-xl border border-border/10"></div>
				<div class="h-36 w-64 bg-muted/20 rounded-xl border border-border/10"></div>
			</div>
		</div>
		<div class="space-y-4 pt-4">
			<div class="h-6 w-40 bg-muted/50 rounded"></div>
			<div class="flex flex-wrap gap-4 w-full">
				<div class="h-36 w-64 bg-muted/20 rounded-xl border border-border/10"></div>
				<div class="h-36 w-64 bg-muted/20 rounded-xl border border-border/10"></div>
				<div class="h-36 w-64 bg-muted/20 rounded-xl border border-border/10"></div>
			</div>
		</div>
	</div>
{:else}
<div class="space-y-6">
	{#each Object.entries(appState.isEditMode ? dndGroups : localGroups) as [categoryName, services]}
		{#if realItemCount(services) > 0 || (appState.isEditMode && categoryName !== 'CATEGORIA FANTASMA')}
		<section id="{categoryName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}" class="scroll-mt-24">
			{#if enableCategories}
				<h2 class="text-lg font-bold uppercase tracking-wider text-foreground mb-3 flex items-center">
					{#if data.showCategoryCounts}
					<span class="bg-primary/20 text-primary text-xs font-medium mr-2 px-2.5 py-0.5 rounded">
						{realItemCount(services)}
					</span>
					{/if}
					{#if appState.isEditMode}
						<input 
							type="text" 
							value={categoryName} 
							class="bg-transparent border-b border-dashed border-muted-foreground focus:border-primary focus:outline-none w-auto" 
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
			{/if}

			<div 
				class="bento-grid flex flex-wrap gap-4 content-start {appState.isEditMode ? 'min-h-[40vh] p-3 rounded-xl border-2 border-dashed border-border/30 bg-muted/5' : ''}"
				use:dndzone={{items: services, flipDurationMs, dropTargetStyle: {}, type: 'grid', dragDisabled: !appState.isEditMode || editingServiceId !== null}}
				onconsider={(e) => handleDndConsider(e, categoryName)}
				onfinalize={(e) => handleDndFinalize(e, categoryName)}
			>
				{#each services as service, i (service.id)}
					<div
						animate:flip={{duration: flipDurationMs}}
						class="bento-cell transition-all duration-300 {isSpacer(service) ? 'bento-spacer' : ''} {!isSpacer(service) && (editingServiceId === service.id ? 'overflow-visible w-full! z-50' : 'overflow-hidden')} {!isSpacer(service) ? getBentoClass(service, editingServiceId === service.id) : ''}"
					>
						{#if isSpacer(service)}
							<div class="w-full h-full rounded-xl flex items-center justify-center {appState.isEditMode ? 'border-2 border-dashed border-border/20 bg-muted/5 opacity-40 hover:opacity-100 transition-opacity' : 'bg-transparent'}">
								{#if appState.isEditMode}
									<button type="button" class="p-2 rounded-full bg-primary/20 text-primary hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer" aria-label="Aggiungi Spacer" onclick={() => addSpacer(categoryName)} onpointerdown={(e) => e.stopPropagation()}>
										<Plus size={24} />
									</button>
								{/if}
							</div>
						{:else}
							<ServiceCard 
								bind:service={services[i]} 
								categories={data.categories || []} 
								isExpanded={editingServiceId === service.id} 
								onExpandToggle={(val) => editingServiceId = val ? service.id : null} 
								showDescription={data.showServiceDescriptions} 
								iconStyle={data.iconStyle} 
								onDeleteSpacer={() => deleteSpacer(service.id, categoryName)}
							/>
						{/if}
					</div>
				{/each}
			</div>
		</section>
		{/if}
	{/each}

	{#if totalRealServices === 0}
		<div class="flex flex-col items-center justify-center py-24 gap-6">
			<div class="text-center">
				<h3 class="text-lg font-bold uppercase tracking-wider text-foreground">Nessun servizio configurato</h3>
				<p class="mt-2 text-sm text-muted-foreground">Inizia aggiungendo i tuoi servizi dal pannello di amministrazione.</p>
			</div>
			{#if appState.isAdmin}
				<a
					href="/admin?tab={appState.adminTab || 'services'}"
					class="inline-flex items-center gap-3 px-8 py-4 text-base font-bold uppercase tracking-wider text-primary-foreground bg-primary hover:bg-primary/90 rounded-xl shadow-lg transition-all hover:scale-105 active:scale-95"
				>
					Accedi e imposta i tuoi servizi
				</a>
			{:else}
				<button
					type="button"
					onclick={() => {
						appState.loginRedirectUrl = '/admin?tab=discovery';
						appState.showLoginModal = true;
					}}
					class="inline-flex items-center gap-3 px-8 py-4 text-base font-bold uppercase tracking-wider text-primary-foreground bg-primary hover:bg-primary/90 rounded-xl shadow-lg transition-all hover:scale-105 active:scale-95 cursor-pointer"
				>
					Accedi e imposta i tuoi servizi
				</button>
			{/if}
		</div>
	{/if}
</div>
{/if}

<style>
	/* CSS Variables for layout */
	.bento-grid {
		--cols: 1;
		--gap: 1rem;
		display: grid;
		grid-auto-flow: row dense;
		grid-template-columns: repeat(var(--cols), minmax(0, 1fr));
		grid-auto-rows: minmax(136px, auto);
	}

	@media (min-width: 640px) {
		.bento-grid { --cols: 2; }
	}
	@media (min-width: 1024px) {
		.bento-grid { --cols: 3; }
	}
	@media (min-width: 1280px) {
		.bento-grid { --cols: 4; }
	}
	@media (min-width: 1536px) {
		.bento-grid { --cols: 5; }
	}

	/* Base cell */
	.bento-cell {
		grid-column: span 1;
		grid-row: span 1;
		height: 100%;
		width: 100%;
	}

	/* Spacer cells */
	.bento-cell.bento-spacer {
		grid-column: span 1;
		grid-row: span 1;
	}

	/* Column spans */
	.bento-cell.bento-2x1, .bento-cell.bento-2x2 { grid-column: span 2; }
	.bento-cell.bento-3x1, .bento-cell.bento-3x2 { grid-column: span 3; }
	.bento-cell.bento-4x1, .bento-cell.bento-4x2 { grid-column: span 4; }

	/* Row spans */
	.bento-cell.bento-1x2, .bento-cell.bento-2x2,
	.bento-cell.bento-3x2, .bento-cell.bento-4x2 {
		grid-row: span 2;
	}

	/* Mobile: everything becomes full width */
	@media (max-width: 639px) {
		.bento-cell.bento-2x1, .bento-cell.bento-2x2,
		.bento-cell.bento-3x1, .bento-cell.bento-3x2,
		.bento-cell.bento-4x1, .bento-cell.bento-4x2 {
			grid-column: span 1;
		}
	}

	/* Tablet: Max 2 cols */
	@media (min-width: 640px) and (max-width: 1023px) {
		.bento-cell.bento-2x1, .bento-cell.bento-2x2,
		.bento-cell.bento-3x1, .bento-cell.bento-3x2,
		.bento-cell.bento-4x1, .bento-cell.bento-4x2 {
			grid-column: span 2;
		}
	}
</style>
