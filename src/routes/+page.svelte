<script lang="ts">
	import 'gridstack/dist/gridstack.min.css';
	import type { GridStack } from 'gridstack';
	import ServiceCard from '$lib/components/ServiceCard.svelte';
	import { appState } from '$lib/client/state.svelte';
	import { mount, unmount, untrack, onDestroy, getAllContexts } from 'svelte';
	import { navigating } from '$app/stores';
	import { slide } from 'svelte/transition';
	import { invalidateAll } from '$app/navigation';
	import { Plus, X, Trash, EyeOff, Eye, Pencil, Layers, PlusSquare, Undo2, SquareDashed, LayoutGrid, Search, ChevronUp, ChevronDown, LayoutDashboard, CloudSun } from '@lucide/svelte';
	import ConfirmDeleteButton from '$lib/components/ui/ConfirmDeleteButton.svelte';
	import ServiceIcon from '$lib/components/ui/ServiceIcon.svelte';
	import { enhance } from '$app/forms';

	import * as Dialog from '$lib/components/ui/dialog/index';
	import AdminDiscovery from './admin/components/AdminDiscovery.svelte';
	import ServiceForm from '$lib/components/ServiceForm.svelte';
	import EditServiceSheet from '$lib/components/EditServiceSheet.svelte';

	import BackButton from '$lib/components/ui/BackButton.svelte';
	import GridContainer from '$lib/components/ui/GridContainer.svelte';

	let { data } = $props();
	
	let isLoading = $derived($navigating && $navigating.from?.url.pathname !== $navigating.to?.url.pathname);
	
	let allContexts = getAllContexts();
	
	let gridsData = $derived(data.grids || []);
	
	let editModeSidebarPosition = $derived(data.settings?.editModeSidebarPosition || 'right');
	let grids = new Map<string, GridStack>();
	let undoStack = $state<Array<{ grid: string, state: any[] }>>([]);
	
	async function performUndo() {
		const last = undoStack.pop();
		if (!last) return;
		
		const gridIdStr = last.grid;
		const gridId = gridIdStr === 'Inbox' ? null : parseInt(gridIdStr);
		const grid = grids.get(last.grid);

		const itemsWithPositions = last.state.map((n: any) => ({
			id: parseInt(n.id as string),
			x: n.x,
			y: n.y,
			w: n.w,
			h: n.h,
		})).filter((n: any) => !isNaN(n.id));

		if (grid) {
			// Restore positions visually
			for (const savedNode of last.state) {
				const existing = grid.engine.nodes.find(n => n.id === savedNode.id);
				if (existing && existing.el) {
					grid.update(existing.el, { x: savedNode.x, y: savedNode.y, w: savedNode.w, h: savedNode.h });
				}
			}
		}

		try {
			await fetch('/api/services/reorder', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ itemsWithPositions, gridId })
			});
		} catch (e) {}
	}
	let mountedWidgets = new Map<number, any>();
	let mountedServices = new Map<number, any>();
	let isDiscoveryModalOpen = $state(false);
	let isWidgetModalOpen = $state(false);
	let hasAddedServices = $state(false);
	let isAddManualExpanded = $state(false);

	let _wasModalOpen = false;
	$effect(() => {
		if (isWidgetModalOpen) {
			setTimeout(() => {
				import('gridstack').then((module) => {
					const GridStackClass = module.GridStack || module.default?.GridStack || module.default;
					GridStackClass.setupDragIn('.drag-in-widget', { scroll: false, appendTo: 'body', helper: 'clone' });
				});
			}, 100);
		}
	});
	$effect(() => {
		if (isDiscoveryModalOpen) {
			_wasModalOpen = true;
		} else if (_wasModalOpen) {
			_wasModalOpen = false;
	$effect(() => {
		if (isWidgetModalOpen) {
			setTimeout(() => {
				import('gridstack').then((module) => {
					const GridStackClass = module.GridStack || module.default?.GridStack || module.default;
					GridStackClass.setupDragIn('.drag-in-widget', { scroll: false, appendTo: 'body', helper: 'clone' });
				});
			}, 100);
		}
	});
			if (hasAddedServices) {
				window.location.reload();
			}
		}
	});

	let newServiceModal = $state({ name: '', url: '', icon: '', description: '', categoryId: null, pingEnabled: true, widgetType: '', dockerImage: '' });
	let localGroups = $state<Record<string, any[]>>({});

	onDestroy(() => {
		for (const instance of mountedWidgets.values()) {
			unmount(instance);
		}
		mountedWidgets.clear();
		for (const grid of grids.values()) {
			grid.destroy(false);
		}
		grids.clear();
	});

	let totalRealServices = $derived(
		Object.values(data.groupedServices || {}).reduce((sum, items) => sum + items.length, 0)
	);

	$effect(() => {
		const groupedServices = data.groupedServices;
        if (!groupedServices) return;

        let nextGroups: Record<string, any[]> = {};
        const cloned = structuredClone(groupedServices);
        for (const gridName in cloned) {
            nextGroups[gridName] = cloned[gridName].filter((s: any) => !s._isSpacer);
        }
        localGroups = nextGroups;
	});

	$effect(() => {
		const isEdit = appState.isEditMode;
        for (const grid of grids.values()) {
            grid.setStatic(!isEdit);
        }
	});

	async function createGrid() {
		try {
			await fetch('/api/grids/create', { method: 'POST', body: JSON.stringify({ name: 'Nuova Griglia' }) });
			await invalidateAll();
		} catch (err) {}
	}

	async function deleteGrid(id: number) {
		
		try {
			await fetch('/api/grids/delete', { method: 'POST', body: JSON.stringify({ id }) });
			await invalidateAll();
		} catch (err) {}
	}

	async function toggleGridTitle(id: number, current: boolean) {
		try {
			await fetch('/api/grids/edit', { method: 'POST', body: JSON.stringify({ id, show_header: !current }) });
			await invalidateAll();
		} catch (err) {}
	}

	function initGrid(node: HTMLElement, { gridName, services }: { gridName: string, services: any[] }) {
		let grid: GridStack | null = null;
		
		import('gridstack').then((module) => {
			const GridStackClass = module.GridStack || module.default?.GridStack || module.default;
			
			grid = GridStackClass.init({
				cellHeight: '68px',
				column: 10,
				animate: true,
				staticGrid: !appState.isEditMode,
				resizable: { handles: 'e, se, s, sw, w' },
				margin: '0.5rem',
				float: gridName !== 'Inbox', // L'inbox si auto-compatta verso l'alto
				acceptWidgets: true
			}, node);
			
			GridStackClass.setupDragIn('.drag-in-spacer', { scroll: false, appendTo: 'body', helper: 'clone' });
			GridStackClass.setupDragIn('.drag-in-widget', { scroll: false, appendTo: 'body', helper: 'clone' });

			grids.set(gridName, grid as GridStack);

			function saveGridState() {
				const allNodes = grid!.engine.nodes;
				
				const gridIdStr = gridName;
				const gridId = gridIdStr === 'Inbox' ? null : parseInt(gridIdStr);

				const itemsWithPositions = allNodes.map((n) => ({
					id: parseInt(n.id as string),
					x: n.x,
					y: n.y,
					w: n.w,
					h: n.h,
				}));

				fetch('/api/services/reorder', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ itemsWithPositions, gridId })
				}).catch(console.error);
				
				const catItems = localGroups[gridName];
				if (catItems) {
					itemsWithPositions.forEach(updates => {
						const s = catItems.find(x => x.id === updates.id);
						if (s) {
							s.x = updates.x; s.y = updates.y; s.w = updates.w; s.h = updates.h;
						}
					});
				}
			}

			grid!.on('added', async (event: Event, items: any[]) => {
				for (const item of items) {
					if (item.el && (item.el.dataset.type === 'spacer' || item.el.dataset.type === 'widget')) {
						const isWidget = item.el.dataset.type === 'widget';
						const gridIdStr = gridName;
						const gridId = gridIdStr === 'Inbox' ? null : parseInt(gridIdStr);
						try {
							grid!.removeWidget(item.el, true, false);
							if (isWidget) {
								const widgetType = item.el.dataset.widgetType;
								const widgetName = item.el.dataset.widgetName;
								const widgetIcon = item.el.dataset.widgetIcon;
								
								await fetch('/api/services/create', { 
									method: 'POST', 
									body: JSON.stringify({ 
										gridId,
										name: widgetName,
										widgetType: widgetType,
										icon: widgetIcon,
										pingEnabled: false
									})
								});
							} else {
								await fetch('/api/services/spacer', { method: 'POST', body: JSON.stringify({ gridId: gridId }) });
							}
							await invalidateAll();
						} catch (err) {}
					} else if (item.id) {
						if (appState.isEditMode) {
							const serviceId = parseInt(item.id as string);
							let s: any = null;
							for (const group of Object.values(localGroups)) {
								s = group.find(x => x.id === serviceId);
								if (s) break;
							}
							if (s) {
								for (const group of Object.values(localGroups)) {
									const idx = group.findIndex(x => x.id === serviceId);
									if (idx !== -1) group.splice(idx, 1);
								}
								if (!localGroups[gridName]) localGroups[gridName] = [];
								localGroups[gridName].push(s);
							}
							saveGridState();
						}
					}
				}
			});

			grid!.on('removed', (event: Event, items: any[]) => {
				if (appState.isEditMode) saveGridState();
			});

			grid!.on('change', (event: Event, items: any[]) => {
				if (!items || !appState.isEditMode) return;
				saveGridState();
			});

			grid!.on('resizestop', (event: Event, el: HTMLElement) => {
				if (appState.isEditMode) saveGridState();
			});

			
			grid!.on('dragstart', () => {
				if (appState.isEditMode) undoStack.push({ grid: gridName, state: grid!.save() as any[] });
			});
			grid!.on('resizestart', () => {
				if (appState.isEditMode) undoStack.push({ grid: gridName, state: grid!.save() as any[] });
			});

			grid!.on('dragstop', () => {
				if (appState.isEditMode) saveGridState();
			});

			renderWidgets(grid!, services);
		});

		return {
				update({ services: newServices }: { gridName: string, services: any[] }) {
					if (!grid) return;
					
					const existingNodes = grid.engine.nodes.map(n => n.id?.toString());
					existingNodes.forEach(nodeId => {
						if (!newServices.find(s => s.id.toString() === nodeId)) {
							const el = grid!.engine.nodes.find(n => n.id?.toString() === nodeId)?.el;
							if (el) grid!.removeWidget(el, true);
						}
					});

					const uniqueServices = Array.from(new Map(newServices.map(s => [s.id, s])).values());
					uniqueServices.forEach((service) => {
						const nodeExists = grid!.engine.nodes.find(n => n.id?.toString() === service.id.toString());
						if (!nodeExists) {
							addWidgetToGrid(grid!, service);
						} else {
							const existingState = mountedServices.get(service.id);
							if (existingState) {
								Object.assign(existingState, service);
							}
						}
					});
				},
				destroy() {
					if (grid) {
						const nodes = grid.engine.nodes;
						nodes.forEach(n => {
							if (n.id) {
								const id = parseInt(n.id.toString());
								const instance = mountedWidgets.get(id);
								if (instance) {
									unmount(instance);
									mountedWidgets.delete(id);
									mountedServices.delete(id);
								}
							}
						});
						grid.removeAll();
						grid.destroy(false);
						grids.delete(gridName);
					}
				}
			};
	}

	function addWidgetToGrid(grid: GridStack, service: any) {
		let w = service.w || 2;
		let h = service.h || 2;
		
		// Legacy size string conversion se serve (se w, h non validi o lasciati a default ma size è presente)
		if (service.size && typeof service.size === 'string' && service.size.startsWith('gs-')) {
			const dims = service.size.slice(3).split('x');
			if (service.w === 2 && service.h === 2) { 
				w = parseInt(dims[0]) || 2;
				h = parseInt(dims[1]) || 2;
			}
		}

		let minW = 2, minH = 1;
		if (service.widgetType === 'spacer') {
			minW = 1; minH = 1;
		} else if (service.widgetType === 'qbittorrent' || service.widgetType === 'adguard') {
			minW = 3; minH = 2;
		} else if (service.widgetType === 'beszel' || service.widgetType === 'wgeasy') {
			minW = 3; minH = 2;
		} else if (service.widgetType === 'duplicati' || service.widgetType === 'docker' || service.widgetType === 'dockhand') {
			minW = 2; minH = 2;
		}
		
		// Assicurati che le dimensioni attuali non violino i nuovi vincoli
		w = Math.max(w, minW);
		h = Math.max(h, minH);
		
		const autoPos = service.x === undefined || service.x === null || service.category === 'Inbox';
		
		const widgetEl = grid.addWidget({
			id: service.id.toString(),
			w, h,
			x: service.x, y: service.y,
			minW, minH,
			autoPosition: autoPos
		});

		if (!widgetEl) return;
		
		// @ts-ignore
		if (widgetEl.gridstackNode) widgetEl.gridstackNode.id = service.id.toString();
		const contentEl = widgetEl.querySelector('.grid-stack-item-content');
		if (contentEl) {
			let stateService = $state(service);
			mountedServices.set(service.id, stateService);

			const instance = mount(ServiceCard, {
				target: contentEl as HTMLElement,
				context: allContexts,
				props: { 
					get service() { return mountedServices.get(service.id); },
					showDescription: data.showServiceDescriptions,
					iconStyle: data.iconStyle
				}
			});
			mountedWidgets.set(service.id, instance);
		}
	}

	function renderWidgets(grid: GridStack, services: any[]) {
		const uniqueServices = Array.from(new Map(services.map(s => [s.id, s])).values());
		
		// Sort items by Y then X to prevent insertion collisions pushing items around
		uniqueServices.sort((a, b) => {
			const ay = a.y || 0, by = b.y || 0;
			if (ay !== by) return ay - by;
			return (a.x || 0) - (b.x || 0);
		});
		
		grid.batchUpdate();
		uniqueServices.forEach((service) => {
			addWidgetToGrid(grid, service);
		});
		grid.batchUpdate(false);
	}
</script>


	<svelte:window onkeydown={(e) => {
		if (appState.isEditMode && e.key === 'z' && (e.ctrlKey || e.metaKey)) {
			e.preventDefault();
			performUndo();
		}
	}} />

<svelte:head>
	<title>TheView - Homelab Portal</title>
</svelte:head>

{#if isLoading}
	<div class="flex flex-col gap-8 w-full animate-pulse mt-4">
		<div class="flex flex-col gap-4">
			<div class="h-6 w-32 bg-muted/50 rounded"></div>
			<div class="flex flex-wrap gap-4 w-full">
				<div class="h-36 w-64 bg-muted/20 rounded-xl border border-border/10"></div>
				<div class="h-36 w-64 bg-muted/20 rounded-xl border border-border/10"></div>
				<div class="h-36 w-64 bg-muted/20 rounded-xl border border-border/10"></div>
				<div class="h-36 w-64 bg-muted/20 rounded-xl border border-border/10"></div>
			</div>
		</div>
	</div>
{:else}
<div class="flex flex-col md:flex-row gap-6 relative items-start w-full">
	<div class="flex-1 w-full flex flex-col gap-6 min-w-0">

{#if isDiscoveryModalOpen}
	<div transition:slide class="w-full bg-card rounded-2xl border-2 border-primary/20 p-6 shadow-lg mb-6 flex flex-col gap-6 relative overflow-hidden">
		<!-- Decorazione sfondo -->
		<div class="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10 -translate-y-1/2 translate-x-1/3"></div>

		<div class="flex items-center justify-between border-b border-border/50 pb-4">
			<div class="flex items-center gap-3">
				<div class="p-2 bg-primary/20 text-primary rounded-xl">
					<Layers class="size-6" />
				</div>
				<div>
					<h2 class="text-xl font-bold uppercase tracking-wider text-foreground">Aggiunta Servizio</h2>
					<p class="text-xs text-muted-foreground mt-0.5">Aggiungi manualmente o scansiona automaticamente la rete tramite Docker.</p>
				</div>
			</div>
			<button onclick={() => isDiscoveryModalOpen = false} class="p-2 text-muted-foreground hover:bg-muted hover:text-foreground rounded-xl transition-colors ring-1 ring-border shadow-sm">
				<X class="size-5" />
			</button>
		</div>
		
		<div class="flex flex-col gap-8 z-10">
			<!-- Manual Add Accordion -->
			<div class="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
				<button 
					onclick={() => isAddManualExpanded = !isAddManualExpanded} 
					class="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
				>
					<div class="flex items-center gap-3 font-bold uppercase tracking-wider text-sm text-primary">
						<Plus class="size-5" />
						Aggiunta Manuale
					</div>
					{#if isAddManualExpanded}
						<ChevronUp class="size-5 text-muted-foreground" />
					{:else}
						<ChevronDown class="size-5 text-muted-foreground" />
					{/if}
				</button>
				{#if isAddManualExpanded}
					<div transition:slide class="p-6 border-t border-border bg-muted/5">
						<ServiceForm 
							mode="add" 
							bind:service={newServiceModal} 
							action="/admin?/createService" 
							useEnhance={true} 
							enhanceFn={() => {
								return async ({ result }: any) => {
									if (result.type === 'success' || result.type === 'redirect') {
										hasAddedServices = true;
										isDiscoveryModalOpen = false;
									}
								};
							}} 
						/>
					</div>
				{/if}
			</div>

			<!-- Docker Discovery SECOND -->
			<div>
				<h3 class="text-sm font-bold uppercase tracking-wider text-primary mb-4 flex items-center gap-2"><Search class="size-4"/> Scansione Automatica Docker</h3>
				<div class="bg-background rounded-xl border border-border shadow-inner">
					<AdminDiscovery mode="dashboard" onServiceAdded={() => hasAddedServices = true} />
				</div>
			</div>
		</div>
	</div>
{/if}

{#if isWidgetModalOpen}
	<div transition:slide class="w-full bg-card rounded-2xl border-2 border-primary/20 p-6 shadow-lg mb-6 flex flex-col gap-6 relative overflow-hidden">
		<!-- Decorazione sfondo -->
		<div class="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10 -translate-y-1/2 translate-x-1/3"></div>

		<div class="flex items-center justify-between border-b border-border/50 pb-4">
			<div class="flex items-center gap-3">
				<div class="p-2 bg-primary/20 text-primary rounded-xl">
					<CloudSun class="size-6" />
				</div>
				<div>
					<h2 class="text-xl font-bold uppercase tracking-wider text-foreground">Aggiunta Rapida Widget</h2>
					<p class="text-xs text-muted-foreground mt-0.5">Trascina un widget nella griglia per aggiungerlo immediatamente.</p>
				</div>
			</div>
			<button onclick={() => isWidgetModalOpen = false} class="p-2 text-muted-foreground hover:bg-muted hover:text-foreground rounded-xl transition-colors ring-1 ring-border shadow-sm">
				<X class="size-5" />
			</button>
		</div>
		
		<div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 z-10">
			{#each [
				{ name: 'Orologio', type: 'clock', icon: 'lucide:clock', w: 2, h: 2 },
				{ name: 'Meteo', type: 'weather', icon: 'lucide:cloud-sun', w: 2, h: 2 },
				{ name: 'qBittorrent', type: 'qbittorrent', icon: 'qbittorrent', w: 3, h: 2 },
				{ name: 'AdGuard Home', type: 'adguard', icon: 'adguard-home', w: 3, h: 2 },
				{ name: 'Beszel', type: 'beszel', icon: 'https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/svg/beszel.svg', w: 3, h: 2 },
				{ name: 'Wg-easy', type: 'wgeasy', icon: 'https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/svg/wireguard.svg', w: 3, h: 2 },
				{ name: 'Duplicati', type: 'duplicati', icon: 'https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/svg/duplicati.svg', w: 2, h: 2 },
				{ name: 'Filebrowser', type: 'filebrowser', icon: 'https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/svg/filebrowser.svg', w: 2, h: 2 },
				{ name: 'Docker', type: 'docker', icon: 'https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/svg/docker.svg', w: 2, h: 2 },
				{ name: 'Dockhand', type: 'dockhand', icon: 'dockhand', w: 2, h: 2 },
			] as widget}
				<div class="drag-in-widget grid-stack-item cursor-grab active:cursor-grabbing flex flex-col items-center justify-center gap-3 p-4 bg-background rounded-xl border border-border shadow-sm hover:bg-primary/10 hover:border-primary/50 transition-colors group text-primary" data-type="widget" data-widget-type={widget.type} data-widget-name={widget.name} data-widget-icon={widget.icon} {...{'gs-w': widget.w.toString(), 'gs-h': widget.h.toString(), 'gs-min-w': widget.w.toString(), 'gs-min-h': widget.h.toString()}} title="Trascina nella griglia per aggiungerlo">
					<div class="grid-stack-item-content pointer-events-none flex flex-col items-center justify-center static! bg-transparent border-none shadow-none inset-0 w-full h-full gap-2">
						<ServiceIcon icon={widget.icon} name={widget.name} size="lg" class="shadow-sm border border-border bg-card group-hover:scale-110 transition-transform" />
						<span class="text-xs font-semibold text-foreground uppercase tracking-wider text-center">{widget.name}</span>
					</div>
				</div>
			{/each}
		</div>
	</div>
{/if}


	{#each Object.entries(localGroups) as [gridId, services] (gridId)}
		{@const gridObj = gridId === 'Inbox' ? null : gridsData.find((g:any) => g.id.toString() === gridId)}
		{@const gridName = gridId === 'Inbox' ? 'Inbox' : (gridObj ? gridObj.name : 'Unknown')}
		{#if services.length > 0 || (appState.isEditMode && gridName !== 'Inbox' && gridObj)}
		<section id="{gridName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}" class="scroll-mt-24">
			{#if gridName === 'Inbox' && !appState.isEditMode}
				<!-- Nascondi Inbox in View Mode -->
			{:else}
				<GridContainer>
					{#snippet header()}
						{#if appState.isEditMode && gridName !== 'Inbox' && gridObj}
							<div class="flex items-center justify-between bg-muted/30 p-2 rounded-lg border border-border/50 transition-colors hover:bg-muted/50">
								<div class="flex items-center gap-3">
									<input 
										type="text" 
										value={gridName} 
										class="bg-transparent text-lg font-bold uppercase tracking-wider text-foreground focus:border-primary focus:outline-none w-auto border-b border-dashed border-muted-foreground" 
										title="Rinomina Griglia"
										onchange={async (e) => {
											const target = e.target as HTMLInputElement;
											if (target.value === gridName || !target.value.trim()) return;
											try {
												await fetch('/api/grids/edit', { method: 'POST', body: JSON.stringify({ id: gridObj.id, name: target.value.trim() }) });
											} catch (err) {}
										}} 
									/>
									{#if data.showCategoryCounts}
										<span class="bg-primary/20 text-primary text-xs font-medium px-2.5 py-0.5 rounded">
											{services.length}
										</span>
									{/if}
								</div>
								<div class="flex items-center gap-2">
									<button onclick={() => toggleGridTitle(gridObj.id, gridObj.show_header)} class="p-2 text-muted-foreground hover:text-foreground transition-colors bg-card rounded-md shadow-sm border border-border" title={gridObj.show_header ? "Nascondi Titolo in Dashboard" : "Mostra Titolo in Dashboard"}>
										{#if gridObj.show_header}
											<Eye class="size-4" />
										{:else}
											<EyeOff class="size-4 text-destructive" />
										{/if}
									</button>
									<ConfirmDeleteButton onConfirm={() => deleteGrid(gridObj.id)} class="size-8 bg-card text-destructive hover:bg-destructive/10 border border-border rounded-md shadow-sm" />
								</div>
							</div>
						{:else}
							{#if gridName === 'Inbox'}
								{#if appState.isEditMode}
									<h2 class="text-lg font-bold uppercase tracking-wider text-destructive flex items-center gap-2 bg-destructive/10 p-2 rounded-lg w-max border border-destructive/20">
										INBOX (Servizi da smistare)
										<span class="bg-destructive/20 text-destructive text-xs font-bold px-2 py-0.5 rounded-full">{services.length}</span>
									</h2>
								{/if}
							{:else if gridObj?.show_header !== false || appState.isEditMode}
								<h2 class="text-lg font-bold uppercase tracking-wider text-foreground flex items-center">
									{#if data.showCategoryCounts}
									<span class="bg-primary/20 text-primary text-xs font-medium mr-2 px-2.5 py-0.5 rounded">
										{services.length}
									</span>
									{/if}
									{gridName}
								</h2>
							{/if}
						{/if}
					{/snippet}

					<div 
						class="grid-stack {appState.isEditMode ? 'min-h-[25vh] p-3 rounded-xl border-2 border-dashed border-border/40 bg-muted/5 shadow-inner' : ''}"
						use:initGrid={{ gridName: gridId, services }}
					>
						<!-- Gridstack injects items here dynamically -->
					</div>
				</GridContainer>
			{/if}
		</section>
		{/if}
	{/each}
	</div>




	{#if appState.isEditMode}
		<aside class="fixed top-1/2 -translate-y-1/2 {editModeSidebarPosition === 'left' ? 'left-4' : 'right-4'} z-50 flex flex-col gap-2 w-16">
			<div class="bg-card py-4 rounded-xl border border-border shadow-2xl flex flex-col items-center gap-5">
                
                <button onclick={() => isDiscoveryModalOpen = !isDiscoveryModalOpen} class="w-12 h-12 flex items-center justify-center rounded-xl {isDiscoveryModalOpen ? 'bg-primary/20 ring-2 ring-primary/50' : 'hover:bg-primary/10'} text-primary transition-colors relative group" title={isDiscoveryModalOpen ? "Chiudi Aggiunta Servizio" : "Aggiungi Servizio"}>
					<div class="relative flex items-center justify-center">
						<Search class="size-6 group-hover:scale-110 transition-transform" />
						<div class="absolute -bottom-2 -right-2 bg-primary text-primary-foreground rounded-full shadow-sm ring-2 ring-card p-0.5">
							{#if isDiscoveryModalOpen}
								<X class="size-2.5" strokeWidth={4} />
							{:else}
								<Plus class="size-2.5" strokeWidth={4} />
							{/if}
						</div>
					</div>
				</button>
				
				<button onclick={() => isWidgetModalOpen = !isWidgetModalOpen} class="w-12 h-12 flex items-center justify-center rounded-xl {isWidgetModalOpen ? 'bg-primary/20 ring-2 ring-primary/50' : 'hover:bg-primary/10'} text-primary transition-colors relative group" title={isWidgetModalOpen ? "Chiudi Aggiunta Widget" : "Aggiungi Widget"}>
					<div class="relative flex items-center justify-center">
						<CloudSun class="size-6 group-hover:scale-110 transition-transform" />
						<div class="absolute -bottom-2 -right-2 bg-primary text-primary-foreground rounded-full shadow-sm ring-2 ring-card p-0.5">
							{#if isWidgetModalOpen}
								<X class="size-2.5" strokeWidth={4} />
							{:else}
								<Plus class="size-2.5" strokeWidth={4} />
							{/if}
						</div>
					</div>
				</button>

				<button onclick={createGrid} class="w-12 h-12 flex items-center justify-center rounded-xl hover:bg-primary/10 text-primary transition-colors relative group" title="Nuova Griglia">
					<div class="relative flex items-center justify-center">
						<LayoutGrid class="size-6 group-hover:scale-110 transition-transform" />
						<div class="absolute -bottom-2 -right-2 bg-primary text-primary-foreground rounded-full shadow-sm ring-2 ring-card p-0.5">
							<Plus class="size-2.5" strokeWidth={4} />
						</div>
					</div>
				</button>

				<button onclick={performUndo} disabled={undoStack.length === 0} class="w-12 h-12 flex items-center justify-center rounded-xl {undoStack.length > 0 ? 'hover:bg-primary/10 text-primary cursor-pointer' : 'opacity-50 cursor-not-allowed'} transition-colors group" title="Annulla Modifica (Ctrl+Z)">
					<Undo2 class="size-6 {undoStack.length > 0 ? 'group-hover:-rotate-12 transition-transform' : ''}" />
				</button>

				<div class="w-8 h-px bg-border/50"></div>

				<div class="drag-in-spacer grid-stack-item cursor-grab active:cursor-grabbing w-12 h-12 rounded-xl border-2 border-dashed border-primary/50 bg-primary/10 flex items-center justify-center transition-colors hover:bg-primary/20 hover:border-primary text-primary" {...{'gs-w':"2", 'gs-h':"2", 'gs-min-w':"2", 'gs-min-h':"2"}} data-type="spacer" title="Trascina in griglia per creare una Blank Card">
					<div class="grid-stack-item-content pointer-events-none flex items-center justify-center static! bg-transparent border-none shadow-none inset-0 w-full h-full">
						<SquareDashed class="size-6" />
					</div>
				</div>
			</div>
		</aside>
	{/if}

</div>

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
{/if}

<EditServiceSheet />

<style>
	:global(.grid-stack-item-content) {
		overflow: visible !important;
		display: flex;
		flex-direction: column;
	}
</style>

