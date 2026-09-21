<script lang="ts">
	import { appState } from '$lib/client/state.svelte';
	import { ArrowUpCircle } from "@lucide/svelte";
	import ServiceIcon from '$lib/components/ui/ServiceIcon.svelte';
	import StatusIndicator from './StatusIndicator.svelte';

	let { 
		service, 
		status, 
		latencyMs, 
		iconStyle, 
		currentSize, 
		showDescriptionDesktop,
		showDescriptionMobile, 
		dockerVersionInfo,
		iconBgColor = 'hsl(var(--muted-foreground))',
		centerText = false,
		hidePing = false,
		children
	} = $props<{
		service: any;
		status: 'online' | 'offline' | 'checking' | 'disabled';
		latencyMs?: number | null;
		iconStyle: string;
		currentSize: string;
		showDescriptionDesktop: boolean;
		showDescriptionMobile: boolean;
		dockerVersionInfo: any;
		iconBgColor?: string;
		centerText?: boolean;
		hidePing?: boolean;
		children?: import('svelte').Snippet;
	}>();

	let nodeW = $derived(parseInt(currentSize.split('x')[0].replace('gs-', '')) || 2);
	let nodeH = $derived(parseInt(currentSize.split('x')[1]) || 2);
	let isTall = $derived(nodeH >= nodeW || centerText);
	let isWide = $derived(nodeW > nodeH && !centerText);
	let isBaseSize = $derived(nodeW === 2 && nodeH === 2);
</script>

<!-- Status Indicator (top right) now absolute to free up flow layout -->
<StatusIndicator 
	{status} 
	{latencyMs}
	visible={service.pingEnabled && !appState.isEditMode && !hidePing}
/>

{#if dockerVersionInfo && dockerVersionInfo.updateAvailable && !appState.isEditMode}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div 
		class="absolute top-2 left-2 flex items-center justify-center z-20 cursor-pointer text-destructive hover:text-destructive/80 transition-colors bg-card rounded-full shadow-sm" 
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
		<ArrowUpCircle class="size-4 animate-pulse relative" />
	</div>
{/if}

<!-- Icon -->
<div class="relative flex items-center justify-center shrink-0">
	<div 
		class="relative {isTall ? 'size-16 sm:size-20' : (isWide ? 'size-16 sm:size-20' : 'size-14')} {iconStyle} flex items-center justify-center shadow-sm"
		style="background-color: {iconBgColor}"
	>
		<ServiceIcon {iconStyle} name={service.name} icon={service.icon} size="lg" class="w-3/5! h-3/5!" />
	</div>
</div>

<div class="flex-1 min-w-0 flex flex-col {isTall ? 'items-center text-center justify-center mt-3' : (isWide && !centerText ? 'text-left ml-4' : 'mt-3 items-center text-center')}">
	<h3 class="{!isBaseSize ? 'text-xl font-bold' : 'text-base font-semibold'} text-foreground truncate group-hover:text-primary transition-colors w-full">
		{service.name}
	</h3>

	<div class="w-full flex flex-col shrink-0 min-h-0">
		{#if service.description && (showDescriptionDesktop || showDescriptionMobile)}
		<p class="mt-1 {!isBaseSize ? 'text-base' : 'text-sm'} text-muted-foreground line-clamp-2
			{showDescriptionDesktop && showDescriptionMobile ? '' : 
			(showDescriptionDesktop ? 'hidden md:block' : 
			(showDescriptionMobile ? 'block md:hidden' : 'hidden'))}">
			{service.description}
		</p>
		{/if}
		{@render children?.()}
	</div>
</div>
