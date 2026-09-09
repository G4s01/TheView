<script lang="ts">
	import ServiceCard from '$lib/components/ServiceCard.svelte';
	import { appState } from '$lib/client/state.svelte';
	import { dndzone } from 'svelte-dnd-action';
	import { flip } from 'svelte/animate';
	import { untrack } from 'svelte';

	let { data } = $props();

	// Server-synced state (no spacers, used in view mode)
	let localGroups = $state<Record<string, any[]>>({});
	// Edit-mode state (with spacers for dnd vertical reordering)
	let dndGroups = $state<Record<string, any[]>>({});

	let editingServiceId = $state<number | null>(null);
	const flipDurationMs = 200;
	const SPACER_COUNT = 10;

	function isSpacer(item: any): boolean {
		return item?._isSpacer === true;
	}

	function createSpacers(catKey: string): any[] {
		return Array.from({ length: SPACER_COUNT }, (_, i) => ({
			id: `__spacer_${catKey}_${i}`,
			_isSpacer: true,
			size: '1x1'
		}));
	}

	function realItemCount(items: any[]): number {
		return items.filter(i => !isSpacer(i)).length;
	}

	// Sync from server data
	$effect.pre(() => {
		if (data.groupedServices) {
			localGroups = JSON.parse(JSON.stringify(data.groupedServices));
		}
	});

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
			// Exiting edit mode: sync reordered items back to localGroups (without spacers)
			const result: Record<string, any[]> = {};
			const groups = untrack(() => dndGroups);
			for (const [cat, items] of Object.entries(groups)) {
				result[cat] = items.filter(i => !isSpacer(i));
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
			// Save only real items' order to DB
			const realItems = dndGroups[categoryName].filter((i: any) => !isSpacer(i));
			const orderedIds = realItems.map((s: any) => s.id);
			const cat = data.categories.find((c: any) => c.name === categoryName);

			fetch('/api/services/reorder', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ orderedIds, categoryId: cat?.id })
			}).catch(console.error);
		}
	}
</script>

<svelte:head>
	<title>TheView - Homelab Portal</title>
</svelte:head>

<div class="space-y-6">
	{#each Object.entries(appState.isEditMode ? dndGroups : localGroups) as [categoryName, services]}
		{#if realItemCount(services) > 0 || appState.isEditMode}
		<section id="{categoryName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}" class="scroll-mt-24">
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

			<div 
				class="bento-grid flex flex-wrap gap-4 content-start {appState.isEditMode ? 'min-h-[40vh] p-3 rounded-xl border-2 border-dashed border-border/30 bg-muted/5' : ''}"
				use:dndzone={{items: services, flipDurationMs, dropTargetStyle: {}, type: 'grid', dragDisabled: !appState.isEditMode || editingServiceId !== null}}
				onconsider={(e) => handleDndConsider(e, categoryName)}
				onfinalize={(e) => handleDndFinalize(e, categoryName)}
			>
				{#each services as service (service.id)}
					<div
						animate:flip={{duration: flipDurationMs}}
						class="bento-cell transition-all duration-300 {isSpacer(service) ? 'bento-spacer' : ''} {!isSpacer(service) && (editingServiceId === service.id ? 'overflow-visible !w-full' : 'overflow-hidden')} {!isSpacer(service) ? (service.size === '2x2' ? 'bento-2x2' : service.size === '2x1' ? 'bento-2x1' : service.size === '1x2' ? 'bento-1x2' : 'bento-1x1') : ''}"
					>
						{#if isSpacer(service)}
							<div class="w-full h-full rounded-xl border-2 border-dashed border-border/20 bg-muted/5 opacity-40"></div>
						{:else}
							<ServiceCard {service} categories={data.categories || []} isExpanded={editingServiceId === service.id} onExpandToggle={(val) => editingServiceId = val ? service.id : null} showDescription={data.showServiceDescriptions} iconStyle={data.iconStyle} />
						{/if}
					</div>
				{/each}
			</div>
		</section>
		{/if}
	{/each}

	{#if Object.keys(appState.isEditMode ? dndGroups : localGroups).length === 0}
		<div class="text-center py-20 bg-card rounded-xl border border-dashed border-border">
			<h3 class="mt-2 text-sm font-bold uppercase tracking-wider text-foreground">NESSUN SERVIZIO</h3>
			<p class="mt-1 text-sm text-muted-foreground">ACCEDI E VAI ALLE IMPOSTAZIONI</p>
		</div>
	{/if}
</div>

<style>
	/*
	 * Bento Grid with flexbox for dnd compatibility.
	 * CSS custom properties control responsive column count.
	 * Items have calculated widths to simulate grid columns,
	 * while flexbox wrapping allows svelte-dnd-action to
	 * freely position items vertically using spacers.
	 */
	.bento-grid {
		--cols: 1;
		--gap: 1rem;
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

	/* Base cell: 1 column wide */
	.bento-cell {
		width: calc((100% - (var(--cols) - 1) * var(--gap)) / var(--cols));
		min-height: 136px;
	}

	/* Spacer cells: same width, shorter height */
	.bento-cell.bento-spacer {
		min-height: 80px;
	}

	/* 2-wide items */
	.bento-cell.bento-2x1,
	.bento-cell.bento-2x2 {
		width: calc(((100% - (var(--cols) - 1) * var(--gap)) / var(--cols)) * 2 + var(--gap));
	}

	/* 2-tall items */
	.bento-cell.bento-1x2 {
		min-height: calc(136px * 2 + var(--gap));
	}

	.bento-cell.bento-2x2 {
		min-height: calc(136px * 2 + var(--gap));
	}

	/* Mobile: 2-wide items become full width */
	@media (max-width: 639px) {
		.bento-cell.bento-2x1,
		.bento-cell.bento-2x2 {
			width: 100%;
		}
	}

	/* Tablet: 2-wide items also full width (only 2 cols) */
	@media (min-width: 640px) and (max-width: 1023px) {
		.bento-cell.bento-2x1,
		.bento-cell.bento-2x2 {
			width: 100%;
		}
	}
</style>
