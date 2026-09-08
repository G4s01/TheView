<script lang="ts">
	import { appState } from '$lib/client/state.svelte';
	import { ArrowUpCircle, Box, GripHorizontal, Pencil, Upload, Trash2 } from "@lucide/svelte";
	import QBittorrentWidget from './widgets/QBittorrentWidget.svelte';
	import TextInput from './ui/TextInput.svelte';
	import UrlInput from './ui/UrlInput.svelte';
	import SelectInput from './ui/SelectInput.svelte';
	import ToggleInput from './ui/ToggleInput.svelte';
	import ServiceIcon from './ui/ServiceIcon.svelte';
	import ServiceForm from './ServiceForm.svelte';
	import { clickOutside } from '$lib/actions/clickOutside';
	import { Button } from "$lib/components/ui/button";
		let { service, liveStatus = null, categories = [], isExpanded = false, showDescription = true, iconStyle = 'rounded-xl', onExpandToggle } = $props<{
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
		liveStatus?: { isOnline: boolean; latencyMs?: number } | null;
		categories?: { id: number; name: string }[];
		isExpanded?: boolean;
		showDescription?: boolean;
		iconStyle?: string;
		onExpandToggle?: (expanded: boolean) => void;
	}>();
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
			}, 300);
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
</script>

<div class="relative h-full w-full group" use:clickOutside={{ enabled: isExpanded, handler: () => { if (isExpanded && onExpandToggle) onExpandToggle(false); } }}>
	{#if appState.isEditMode && !isExpanded}
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
	class="relative bg-card text-card-foreground rounded-xl border border-border p-4 shadow-sm hover:shadow-md transition-all duration-300 ease-in-out w-full h-full {isExpanded && !isAnimating ? 'overflow-visible' : 'overflow-hidden'} {
		!isExpanded 
		? (currentSize === '2x1' ? 'flex flex-row items-center gap-4' 
			: (currentSize === '2x2' || currentSize === '1x2' ? 'flex flex-col items-center justify-center text-center' 
			: 'flex flex-col justify-between')) 
		: 'flex flex-col'
	}"
	style="background-color: {bgColor}; border-color: {borderColor};"
	onclick={(e: Event) => { if (appState.isEditMode) e.preventDefault(); }}
>
	{#if !isExpanded}
		<!-- Status Indicator (top right) now absolute to free up flow layout -->
		{#if service.pingEnabled && !appState.isEditMode}
			<div class="absolute top-4 right-4 flex items-center space-x-1.5 z-10" title={tooltipText}>
				<span class="relative flex h-2.5 w-2.5">
					{#if status === 'checking'}
						<span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
						<span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-yellow-500"></span>
					{:else if status === 'online'}
						<span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
					{:else}
						<span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
					{/if}
				</span>
			</div>
		{/if}

		<!-- Icon -->
		<div class="relative shrink-0 {currentSize === '1x1' ? 'w-full flex items-start' : ''}">
			<div 
				class="{(currentSize !== '1x1') ? 'h-14 w-14' : 'h-10 w-10'} {iconStyle} flex items-center justify-center shadow-sm"
				style="background-color: {iconBgColor || '#4B5563'}"
			>
				<ServiceIcon {iconStyle} name={service.name} icon={service.icon} size={(currentSize !== '1x1') ? 'lg' : 'md'} />
			</div>

			{#if dockerVersionInfo && dockerVersionInfo.updateAvailable && !appState.isEditMode}
				<!-- svelte-ignore a11y_click_events_have_key_events -->
				<!-- svelte-ignore a11y_no_static_element_interactions -->
				<div 
					class="absolute -top-1.5 -right-1.5 flex items-center justify-center z-20 cursor-pointer text-red-500 hover:text-red-600 transition-colors bg-card rounded-full shadow-sm" 
					title="Aggiornamento disponibile online! Clicca per vedere la release."
					onclick={(e) => {
						e.preventDefault();
						e.stopPropagation();
						if (dockerVersionInfo?.updateUrl) {
							window.open(dockerVersionInfo.updateUrl, '_blank');
						}
					}}
				>
					<span class="absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-40 animate-ping"></span>
					<ArrowUpCircle class="w-4 h-4 animate-pulse relative" />
				</div>
			{/if}
		</div>

		<div class="min-w-0 flex flex-col {currentSize === '1x1' ? 'text-left' : (currentSize === '2x1' ? 'flex-1 text-left' : 'mt-4 items-center text-center')}">
			<h3 class="{(currentSize !== '1x1') ? 'text-xl font-bold' : 'text-base font-semibold'} text-foreground truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors w-full">
				{service.name}
			</h3>
			
			<div class="w-full">
				{#if showDescription && service.description}
				<p class="mt-1 {(currentSize !== '1x1') ? 'text-base' : 'text-sm'} text-muted-foreground line-clamp-2">
					{service.description}
				</p>
				{/if}
				
				{#if service.widgetType === 'qbittorrent'}
					<div class="mt-2 w-full text-left" role="presentation" onclick={(e) => e.preventDefault()} onkeydown={(e) => e.stopPropagation()}>
						<QBittorrentWidget />
					</div>
				{/if}
			</div>
		</div>
	{:else}
		{#snippet iconSlot()}
			<div 
				class="h-10 w-10 {iconStyle} flex items-center justify-center shadow-sm"
				style="background-color: {iconBgColor || '#4B5563'}"
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
