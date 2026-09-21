<script lang="ts">
	import { appState } from '$lib/client/state.svelte';
	import { Pencil, Trash2 } from "@lucide/svelte";
	import { Button } from "$lib/components/ui/button";
	import ServiceIcon from './ui/ServiceIcon.svelte';
	import { usePing } from '$lib/queries/usePing';
	import { onMount, untrack } from 'svelte';
	import { invalidateAll } from '$app/navigation';
	
	import CardLink from './card/CardLink.svelte';
	import CardWidget from './card/CardWidget.svelte';
	import { WIDGET_REGISTRY, getWidgetRequireAuthKey } from '$lib/config/widgetRegistry';

	let { service, showDescription = true, iconStyle = 'rounded-xl' } = $props<{
		service: {
			id: number;
			name: string;
			description: string | null;
			url: string;
			icon: string | null;
			pingEnabled: boolean;
			widgetType: string | null;
			categoryId?: number;
			dockerImage?: string | null;
			iconDetails?: { type: 'custom' | 'brand' | 'lucide', value: string } | null;
			size?: string;
			isWidget?: boolean;
			w?: number;
			h?: number;
			requireAuth?: boolean;
		};
		showDescription?: boolean;
		iconStyle?: string;
	}>();
	
	const pingQuery = usePing(() => service.url, () => service.pingEnabled);
	let liveStatus = $derived(pingQuery.data ? { isOnline: pingQuery.data.status === 'online', latencyMs: pingQuery.data.responseTimeMs } : null);
	
	let dockerVersionInfo = $state<{ version: string; updateAvailable: boolean; updateUrl?: string } | null>(null);
	
	onMount(() => {
		if (service.dockerImage) {
			fetch(`/api/docker/version?image=${encodeURIComponent(service.dockerImage)}`)
				.then(res => res.json())
				.then(data => {
					if (!data.error) {
						dockerVersionInfo = { version: data.version, updateAvailable: data.updateAvailable, updateUrl: data.updateUrl };
					}
				})
				.catch(e => console.error(e));
		}
	});

	function startEdit() {
		appState.editingServiceId = service.id;
		appState.editingService = {
			id: service.id,
			name: service.name,
			url: service.url,
			icon: service.icon || '',
			description: service.description || '',
			categoryId: service.categoryId || null,
			pingEnabled: service.pingEnabled ?? true,
			widgetType: service.widgetType || 'none',
			dockerImage: service.dockerImage || '',
			size: service.size || '1x1',
			isWidget: service.isWidget === true
		};
	}

	async function deleteService() {
		const formData = new FormData();
		formData.append('id', service.id.toString());
		try {
			await fetch('/admin?/deleteService', { method: 'POST', body: formData });
			await invalidateAll();
		} catch (err) {
			console.error(err);
		}
	}

	let status = $derived<'online' | 'disabled' | 'checking' | 'offline'>(
		!service.pingEnabled ? 'disabled' 
		: liveStatus === null ? 'checking' 
		: liveStatus.isOnline ? 'online' 
		: 'offline'
	);
	
	let latencyMs = $derived(liveStatus?.latencyMs ?? null);

	let bgColor = $derived('');
	let borderColor = $derived('');
	let iconBgColor = $derived('');
	let nodeW = $derived(service.w ?? 2);
	let nodeH = $derived(service.h ?? 2);
	let currentSize = $derived(`gs-${nodeW}x${nodeH}`);
	let isWide = $derived(nodeW > nodeH);
	let isTall = $derived(nodeH > nodeW);
	let isSquare = $derived(nodeW === nodeH);
	// True when width != height, meaning we need separate grid cells

	let isWidgetLayout = $derived(nodeW !== nodeH || (nodeW >= 4 && nodeH >= 4));

	let requireAuth = $derived.by(() => {
		const authKey = getWidgetRequireAuthKey(service.widgetType);
		if (authKey && appState.settings) {
			return appState.settings[authKey] === 'true' || appState.settings[authKey] === true;
		}
		return service.requireAuth === true;
	});

	let showWidget = $derived(
		service.widgetType && service.widgetType !== 'none' && service.widgetType !== 'spacer' &&
		WIDGET_REGISTRY.some(w => w.id === service.widgetType) &&
		(!requireAuth || appState.isAdmin)
	);

	let separateCells = $derived(
		service.widgetType && service.widgetType !== 'none' && service.widgetType !== 'spacer' &&
		WIDGET_REGISTRY.some(w => w.id === service.widgetType)
	);
</script>

<div class="relative h-full w-full group">
	{#if service.widgetType === 'spacer'}
		<div class="w-full h-full {appState.isEditMode ? 'border-2 border-dashed border-border/50 bg-muted/10 rounded-xl flex items-center justify-center relative' : 'bg-card border border-border rounded-xl shadow-sm'}">
			{#if appState.isEditMode}
				<span class="text-xs text-muted-foreground/50 font-bold uppercase tracking-wider select-none">BlankCard</span>
				<button 
					type="button" 
					class="absolute top-2 right-2 text-destructive/70 hover:text-destructive transition-colors p-1 bg-card/80 rounded-md shadow-sm" 
					onclick={(e) => { e.preventDefault(); e.stopPropagation(); deleteService(); }} 
					title="Elimina BlankCard"
				>
					<Trash2 class="size-4" />
				</button>
			{/if}
		</div>
	{:else if service.isWidget}
		<CardWidget {service} {status} {latencyMs} {iconStyle} {currentSize} {showDescription} {dockerVersionInfo} {iconBgColor} {separateCells} {startEdit} />
	{:else}
		{#if appState.isEditMode && (!separateCells || !isWidgetLayout)}
			<div class="absolute top-2 right-2 flex gap-1.5 z-20">
				<Button variant="outline" size="icon" onclick={(e) => { e.preventDefault(); e.stopPropagation(); startEdit(); }} class="bg-card/90 text-muted-foreground" title="Impostazioni Servizio">
					<Pencil strokeWidth={1.5} />
				</Button>
			</div>
		{/if}

	<!-- svelte-ignore a11y_no_static_element_interactions a11y_click_events_have_key_events -->
	<svelte:element
		this={appState.isEditMode || showWidget ? 'div' : 'a'}
		href={appState.isEditMode || showWidget ? undefined : service.url} 
		target={appState.isEditMode || showWidget ? undefined : '_blank'} 
		rel={appState.isEditMode || showWidget ? undefined : "noopener noreferrer"}
		class="relative {
			separateCells && isWidgetLayout
			? 'bg-transparent border-none shadow-none grid gap-1.5'
			: 'bg-card text-card-foreground rounded-xl border border-border p-4 shadow-sm hover:shadow-md'
		} transition-all duration-500 ease-in-out w-full h-full overflow-hidden {
			(separateCells && isWidgetLayout ? '' 
				: (isWide ? `flex flex-row items-center ${showWidget ? 'gap-4' : 'justify-center gap-6'}` 
				: (isTall ? `flex flex-col items-center text-center ${showWidget ? 'justify-between' : 'justify-center gap-4'}` 
				: 'flex flex-col justify-between'))) 
		}"
		style="background-color: {bgColor}; border-color: {borderColor}; {separateCells && isWidgetLayout ? (isWide ? `grid-template-columns: calc(${(2/nodeW)*100}% - 0.375rem) 1fr;` : `grid-template-rows: calc(${(2/nodeH)*100}% - 0.375rem) 1fr;`) : ''}"
		onclick={(e: Event) => { if (appState.isEditMode) e.preventDefault(); }}
	>
		{#if showWidget}
			<CardWidget {service} {status} {latencyMs} {iconStyle} {currentSize} {showDescription} {dockerVersionInfo} {iconBgColor} {separateCells} {startEdit} />
		{:else}
			<CardLink {service} {status} {latencyMs} {iconStyle} {currentSize} {showDescription} {dockerVersionInfo} {iconBgColor} />
		{/if}
	</svelte:element>
	{/if}
</div>
