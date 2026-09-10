<script lang="ts">
	import { appState } from '$lib/client/state.svelte';
	import { ArrowUpCircle, Box, GripHorizontal, Pencil, Upload, Trash2 } from "@lucide/svelte";
	import QBittorrentWidget from './widgets/QBittorrentWidget.svelte';
	import AdGuardWidget from './widgets/AdGuardWidget.svelte';
	import TextInput from './ui/TextInput.svelte';
	import UrlInput from './ui/UrlInput.svelte';
	import SelectInput from './ui/SelectInput.svelte';
	import ToggleInput from './ui/ToggleInput.svelte';
	import ServiceIcon from './ui/ServiceIcon.svelte';
	import ServiceForm from './ServiceForm.svelte';
	import { clickOutside } from '$lib/actions/clickOutside';
	import { Button } from "$lib/components/ui/button";
		let { service, categories = [], isExpanded = false, showDescription = true, iconStyle = 'rounded-xl', onExpandToggle } = $props<{
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
		};
		categories?: { id: number; name: string }[];
		isExpanded?: boolean;
		showDescription?: boolean;
		iconStyle?: string;
		onExpandToggle?: (expanded: boolean) => void;
	}>();
	
	import { usePing } from '$lib/queries/usePing';
	const pingQuery = usePing(() => service.url, () => service.pingEnabled);
	let liveStatus = $derived(pingQuery.data ? { isOnline: pingQuery.data.status === 'online', latencyMs: pingQuery.data.responseTimeMs } : null);
	let editService = $state({
		id: 0,
		name: '',
		url: '',
		icon: '',
		description: '',
		categoryId: null as number | null,
		pingEnabled: false,
		widgetType: '',
		dockerImage: '',
		size: '1x1'
	});
	
	let showDeleteConfirm = $state(false);
	let isSaving = $state(false);

	let dockerVersionInfo = $state<{ version: string; updateAvailable: boolean; updateUrl?: string } | null>(null);

	let isAnimating = $state(false);
	let animationTimeout: ReturnType<typeof setTimeout> | undefined = undefined;

	import { onMount, untrack } from 'svelte';
	import { invalidateAll } from '$app/navigation';

	$effect(() => {
		// Track isExpanded properly
		const currentExpanded = isExpanded;
		
		untrack(() => {
			isAnimating = true;
			if (animationTimeout) clearTimeout(animationTimeout);
			animationTimeout = setTimeout(() => {
				isAnimating = false;
			}, 500);
		});

		return () => {
			if (animationTimeout) clearTimeout(animationTimeout);
		};
	});
	
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
		editService = {
			id: service.id,
			name: service.name,
			url: service.url,
			icon: service.icon || '',
			description: service.description || '',
			categoryId: service.categoryId || null,
			pingEnabled: service.pingEnabled ?? true,
			widgetType: service.widgetType || 'none',
			dockerImage: service.dockerImage || '',
			size: service.size || '1x1'
		};
		if (onExpandToggle) onExpandToggle(true);
	}

	async function deleteService() {
		isSaving = true;
		const formData = new FormData();
		formData.append('id', service.id.toString());
		try {
			await fetch('/admin?/deleteService', { method: 'POST', body: formData });
			window.location.reload();
		} catch (err) {
			console.error(err);
		} finally {
			isSaving = false;
		}
	}

	async function saveEdit(e: Event) {
		e.preventDefault();
		const form = e.currentTarget as HTMLFormElement;
		form.classList.remove('show-errors');
		if (!form.checkValidity()) {
			void form.offsetWidth;
			form.classList.add('show-errors');
			return;
		}
		isSaving = true;
		try {
			const res = await fetch('/api/services/quick-edit', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(editService)
			});
			if (res.ok) {
				Object.assign(service, editService);
				if (onExpandToggle) onExpandToggle(false);
				await invalidateAll();
			}
		} catch (err) {
			console.error(err);
		} finally {
			isSaving = false;
		}
	}

	// Calculate current visual status
	let status = $derived(
		!service.pingEnabled ? 'disabled' 
		: liveStatus === null ? 'checking' 
		: liveStatus.isOnline ? 'online' 
		: 'offline'
	);
	
	let tooltipText = $derived(
		status === 'online' ? `Online (${liveStatus?.latencyMs}ms)` 
		: status === 'offline' ? 'Offline'
		: 'Checking...'
	);

	let bgColor = $derived('');
	let borderColor = $derived('');
	let iconBgColor = $derived('');
	let currentSize = $derived(service.size || '1x1');

	let separateCells = $derived(
		service.widgetType === 'qbittorrent' ? (appState.settings?.qbit_separate_cells === 'true' || appState.settings?.qbit_separate_cells === true)
		: service.widgetType === 'adguard' ? (appState.settings?.adguard_separate_cells === 'true' || appState.settings?.adguard_separate_cells === true)
		: false
	);

	let requireAuth = $derived(
		service.widgetType === 'qbittorrent' ? (appState.settings?.qbit_require_auth === 'true' || appState.settings?.qbit_require_auth === true)
		: service.widgetType === 'adguard' ? (appState.settings?.adguard_require_auth === 'true' || appState.settings?.adguard_require_auth === true)
		: false
	);
</script>

<div class="relative h-full w-full group" use:clickOutside={{ enabled: isExpanded, handler: () => { if (isExpanded && onExpandToggle) onExpandToggle(false); } }}>
	{#if appState.isEditMode && !isExpanded && (!separateCells || (currentSize !== '2x1' && currentSize !== '2x2'))}
		<div class="absolute top-2 right-2 flex space-x-1.5 z-20">
			<Button variant="outline" size="icon" onclick={(e) => { e.preventDefault(); e.stopPropagation(); startEdit(); }} class="bg-card/90 text-muted-foreground" title="Impostazioni Servizio">
				<Pencil strokeWidth={1.5} />
			</Button>
			<div class="inline-flex items-center justify-center rounded-md text-sm font-medium border border-input bg-card/90 hover:bg-muted shadow-sm h-8 w-8 cursor-move text-muted-foreground" title="Trascina per spostare">
				<GripHorizontal class="pointer-events-none" strokeWidth={1.5} />
			</div>
		</div>
	{/if}

<!-- svelte-ignore a11y_no_static_element_interactions a11y_click_events_have_key_events -->
<svelte:element
	this={appState.isEditMode ? 'div' : 'a'}
	href={appState.isEditMode ? undefined : service.url} 
	target={appState.isEditMode ? undefined : '_blank'} 
	rel={appState.isEditMode ? undefined : "noopener noreferrer"}
	class="relative {
		separateCells && !isExpanded && (currentSize === '2x1' || currentSize === '2x2')
		? 'bg-transparent border-none shadow-none grid gap-1.5 grid-cols-2 ' + (currentSize === '2x2' ? 'grid-rows-2' : '')
		: 'bg-card text-card-foreground rounded-xl border border-border p-4 shadow-sm hover:shadow-md'
	} transition-all duration-500 ease-in-out w-full h-full {isExpanded && !isAnimating ? 'overflow-visible' : 'overflow-hidden'} {
		!isExpanded 
		? (separateCells && (currentSize === '2x1' || currentSize === '2x2') ? '' 
			: (currentSize === '2x1' ? 'flex flex-row items-center gap-4' 
			: (currentSize === '2x2' || currentSize === '1x2' ? 'flex flex-col items-center justify-between text-center' 
			: 'flex flex-col justify-between'))) 
		: 'flex flex-col'
	}"
	style="background-color: {bgColor}; border-color: {borderColor};"
	onclick={(e: Event) => { if (appState.isEditMode) e.preventDefault(); }}
>
	{#if !isExpanded}
		{#if separateCells && (currentSize === '2x1' || currentSize === '2x2')}
				<div class="bg-card text-card-foreground rounded-xl rounded-r-none border border-border border-r-0 p-4 shadow-sm hover:shadow-md transition-all duration-500 relative flex flex-col justify-center items-center text-center {currentSize === '2x2' ? 'col-span-1 row-span-2' : 'col-span-1'}">
					{#if appState.isEditMode}
						<div class="absolute top-2 right-2 flex gap-1 z-20">
							<Button variant="outline" size="icon" class="h-8 w-8 bg-card/90 hover:bg-muted shadow-sm" onclick={(e) => { e.preventDefault(); e.stopPropagation(); startEdit(); }}>
								<Pencil strokeWidth={1.5} />
							</Button>
							<div class="inline-flex items-center justify-center rounded-md text-sm font-medium border border-input bg-card/90 hover:bg-muted shadow-sm h-8 w-8 cursor-move text-muted-foreground" title="Trascina per spostare">
								<GripHorizontal class="pointer-events-none" strokeWidth={1.5} />
							</div>
						</div>
					{/if}
					{#if service.pingEnabled && !appState.isEditMode}
						<div class="absolute top-4 right-4 flex items-center space-x-1.5 z-10" title={tooltipText}>
							<span class="relative flex h-2.5 w-2.5">
								{#if status === 'checking'}
									<span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-muted-foreground opacity-75"></span>
									<span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-muted-foreground"></span>
								{:else if status === 'online'}
									<span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary"></span>
								{:else}
									<span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-destructive"></span>
								{/if}
							</span>
						</div>
					{/if}
					<div class="relative flex items-center justify-center w-full flex-1 min-h-0">
						<div 
							class="h-full w-full aspect-square max-h-20 max-w-20 min-h-10 min-w-10 {iconStyle} flex items-center justify-center shadow-sm"
							style="background-color: {iconBgColor || 'hsl(var(--muted-foreground))'}"
						>
							<ServiceIcon {iconStyle} name={service.name} icon={service.icon} size="md" class="w-3/5! h-3/5!" />
						</div>
					</div>
					<div class="min-w-0 flex flex-col text-center mt-2 w-full items-center justify-center">
						<h3 class="text-base font-semibold text-foreground truncate group-hover:text-primary transition-colors w-full">{service.name}</h3>
						{#if showDescription && service.description}
							<p class="mt-1 text-sm text-muted-foreground line-clamp-2">{service.description}</p>
						{/if}
					</div>
				</div>
			
			{#if !requireAuth || appState.isAdmin}
				<div class="bg-card border border-border p-4 rounded-xl rounded-l-none shadow-sm hover:shadow-md transition-all duration-500 flex flex-col h-full w-full overflow-hidden {currentSize === '2x2' ? 'col-span-1 row-span-2' : 'col-span-1'}">
					{#if service.widgetType === 'qbittorrent'}
						<div class="w-full h-full flex flex-col min-h-0" role="presentation" onclick={(e) => e.preventDefault()} onkeydown={(e) => e.stopPropagation()}>
							<QBittorrentWidget size={currentSize} />
						</div>
					{:else if service.widgetType === 'adguard'}
						<div class="w-full h-full flex flex-col min-h-0" role="presentation" onclick={(e) => e.preventDefault()} onkeydown={(e) => e.stopPropagation()}>
							<AdGuardWidget size={currentSize} />
						</div>
					{/if}
				</div>
			{/if}
		{:else}
		<!-- Status Indicator (top right) now absolute to free up flow layout -->
		{#if service.pingEnabled && !appState.isEditMode}
			<div class="absolute top-4 right-4 flex items-center space-x-1.5 z-10" title={tooltipText}>
				<span class="relative flex h-2.5 w-2.5">
					{#if status === 'checking'}
						<span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-muted-foreground opacity-75"></span>
						<span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-muted-foreground"></span>
					{:else if status === 'online'}
						<span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary"></span>
					{:else}
						<span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-destructive"></span>
					{/if}
				</span>
			</div>
		{/if}

			<!-- Icon -->
			<div class="relative flex items-center justify-center {currentSize === '1x1' ? 'w-full flex-1 min-h-0' : 'shrink-0'}">
				<div 
					class="relative {(currentSize !== '1x1') ? 'h-14 w-14' : 'h-full w-full aspect-square max-h-20 max-w-20 min-h-10 min-w-10'} {iconStyle} flex items-center justify-center shadow-sm"
					style="background-color: {iconBgColor || 'hsl(var(--muted-foreground))'}"
				>
					<ServiceIcon {iconStyle} name={service.name} icon={service.icon} size={(currentSize !== '1x1') ? 'lg' : 'md'} class={currentSize === '1x1' ? 'w-3/5! h-3/5!' : ''} />
					{#if dockerVersionInfo && dockerVersionInfo.updateAvailable && !appState.isEditMode}
						<!-- svelte-ignore a11y_click_events_have_key_events -->
						<!-- svelte-ignore a11y_no_static_element_interactions -->
						<div 
							class="absolute -top-1.5 -right-1.5 flex items-center justify-center z-20 cursor-pointer text-destructive hover:text-destructive/80 transition-colors bg-card rounded-full shadow-sm" 
							title="Aggiornamento disponibile online! Clicca per vedere la release."
							onclick={(e) => {
								e.preventDefault();
								e.stopPropagation();
								if (dockerVersionInfo?.updateUrl) {
									window.open(dockerVersionInfo.updateUrl, '_blank');
								}
							}}
						>
							<span class="absolute inline-flex h-full w-full rounded-full bg-destructive opacity-40 animate-ping"></span>
							<ArrowUpCircle class="w-4 h-4 animate-pulse relative" />
						</div>
					{/if}
				</div>
			</div>
	
			<div class="min-w-0 flex flex-col flex-1 min-h-0 w-full {currentSize === '1x1' ? 'items-center text-center justify-center mt-2' : (currentSize === '2x1' ? 'text-left' : 'mt-2 sm:mt-4 items-center text-center')}">
				<h3 class="{(currentSize !== '1x1') ? 'text-xl font-bold' : 'text-base font-semibold'} text-foreground truncate group-hover:text-primary transition-colors w-full">
				{service.name}
			</h3>
			
			<div class="w-full flex flex-col flex-1 min-h-0">
				{#if showDescription && service.description}
				<p class="mt-1 {(currentSize !== '1x1') ? 'text-base' : 'text-sm'} text-muted-foreground line-clamp-2">
					{service.description}
				</p>
				{/if}
				
				{#if (!requireAuth || appState.isAdmin) && service.widgetType === 'qbittorrent'}
					<div class="mt-3 pt-3 border-t border-border w-full text-left flex-1 min-h-0 flex flex-col" role="presentation" onclick={(e) => e.preventDefault()} onkeydown={(e) => e.stopPropagation()}>
						<QBittorrentWidget size={currentSize} />
					</div>
				{:else if (!requireAuth || appState.isAdmin) && service.widgetType === 'adguard'}
					<div class="mt-3 pt-3 border-t border-border w-full text-left flex-1 min-h-0 flex flex-col" role="presentation" onclick={(e) => e.preventDefault()} onkeydown={(e) => e.stopPropagation()}>
						<AdGuardWidget size={currentSize} />
					</div>
				{/if}
			</div>
		</div>
		{/if}
	{:else}
		{#snippet iconSlot()}
			<div 
				class="h-10 w-10 {iconStyle} flex items-center justify-center shadow-sm"
				style="background-color: {iconBgColor || 'hsl(var(--muted-foreground))'}"
			>
				<ServiceIcon {iconStyle} name={service.name} icon={service.icon} />
			</div>
		{/snippet}

		<div class="w-full h-full flex flex-col" role="presentation" onclick={(e) => e.stopPropagation()}>
			<ServiceForm 
				mode="edit" 
				bind:service={editService} 
				{categories} 
				{isSaving}
				{iconSlot}
				onSubmit={saveEdit} 
				onCancel={() => { if (onExpandToggle) onExpandToggle(false); showDeleteConfirm = false; }} 
				onDelete={deleteService} 
			/>
		</div>
	{/if}
</svelte:element>
</div>
