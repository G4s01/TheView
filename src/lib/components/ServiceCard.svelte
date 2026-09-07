<script lang="ts">
	import { appState } from '$lib/client/state.svelte';
	import { ArrowUpCircle, Box, GripHorizontal, Pencil, Upload, Trash2 } from "@lucide/svelte";
	import QBittorrentWidget from './widgets/QBittorrentWidget.svelte';
	import TextInput from './ui/TextInput.svelte';
	import UrlInput from './ui/UrlInput.svelte';
	import SelectInput from './ui/SelectInput.svelte';
	import ToggleInput from './ui/ToggleInput.svelte';
	import { slide, fade } from 'svelte/transition';
	import ServiceForm from './ServiceForm.svelte';
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
		dockerImage: ''
	});
	
	let showDeleteConfirm = $state(false);
	let isSaving = $state(false);

	let dockerVersionInfo = $state<{ version: string; updateAvailable: boolean; updateUrl?: string } | null>(null);

	import { onMount } from 'svelte';
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
			widgetType: service.widgetType || '',
			dockerImage: service.dockerImage || ''
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
			window.location.reload();
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
</script>

<div class="relative h-full group">
	{#if appState.isEditMode && !isExpanded}
		<div class="absolute top-2 right-2 flex space-x-1.5 z-20">
			<button onclick={(e) => { e.preventDefault(); e.stopPropagation(); startEdit(); }} class="p-1.5 bg-card/90 rounded-xl border border-border hover:bg-muted shadow-sm transition-colors text-muted-foreground" title="Impostazioni Servizio">
				<Pencil class="w-4 h-4" strokeWidth={1.5} />
			</button>
			<div class="p-1.5 bg-card/90 rounded-xl border border-border hover:bg-muted shadow-sm transition-colors text-muted-foreground cursor-move" title="Trascina per spostare">
				<GripHorizontal class="w-4 h-4 pointer-events-none" strokeWidth={1.5} />
			</div>
		</div>
	{/if}

<!-- svelte-ignore a11y_no_static_element_interactions a11y_click_events_have_key_events -->
<svelte:element
	this={appState.isEditMode ? 'div' : 'a'}
	href={appState.isEditMode ? undefined : service.url} 
	target={appState.isEditMode ? undefined : '_blank'} 
	rel={appState.isEditMode ? undefined : "noopener noreferrer"}
	class="flex flex-col relative bg-card text-card-foreground rounded-xl border border-border p-4 shadow-sm hover:shadow-md transition-colors duration-200 h-full"
	style="background-color: {bgColor}; border-color: {borderColor};"
	onclick={(e: Event) => { if (appState.isEditMode) e.preventDefault(); }}
>
	{#if !isExpanded}
		<div class="flex items-start justify-between">
			<!-- Icon -->
			<div class="relative">
				<div 
					class="h-10 w-10 {iconStyle} flex items-center justify-center shadow-sm"
					style="background-color: {iconBgColor || '#4B5563'}"
				>
					{#if service.iconDetails}
						{#if service.iconDetails.type === 'custom' || service.iconDetails.type === 'brand'}
							<img src={service.iconDetails.value} alt={service.name} class="h-6 w-6 object-contain {iconStyle === 'rounded-full' ? 'rounded-full' : (iconStyle === 'rounded-xl' ? 'rounded' : 'rounded-none')}" />
						{:else}
							<Box class="h-6 w-6 text-white" strokeWidth={1.5} />
						{/if}
					{:else}
						<Box class="h-6 w-6 text-white" strokeWidth={1.5} />
					{/if}
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

			<!-- Status Indicator (top right) -->
			{#if service.pingEnabled && !appState.isEditMode}
				<div class="flex items-center space-x-1.5" title={tooltipText}>
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
		</div>

		<div class="mt-4 flex-1 pb-4">
			<h3 class="text-base font-semibold text-foreground truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
				{service.name}
			</h3>
			
			<div transition:slide|local={{ duration: 250 }}>
				{#if showDescription}
				<p class="mt-1 text-sm text-muted-foreground line-clamp-2 min-h-10">
					{service.description || service.url}
				</p>
				{/if}
				
				{#if service.widgetType === 'qbittorrent'}
					<div class="mt-2" role="presentation" onclick={(e) => e.preventDefault()} onkeydown={(e) => e.stopPropagation()}>
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
				{#if service.iconDetails}
					{#if service.iconDetails.type === 'custom' || service.iconDetails.type === 'brand'}
						<img src={service.iconDetails.value} alt={service.name} class="h-6 w-6 object-contain {iconStyle === 'rounded-full' ? 'rounded-full' : (iconStyle === 'rounded-xl' ? 'rounded' : 'rounded-none')}" />
					{:else}
						<Box class="h-6 w-6 text-white" strokeWidth={1.5} />
					{/if}
				{:else}
					<Box class="h-6 w-6 text-white" strokeWidth={1.5} />
				{/if}
			</div>
		{/snippet}

		<div class="w-full h-full" transition:fade|local={{ duration: 200 }} role="presentation" onclick={(e) => e.stopPropagation()}>
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
