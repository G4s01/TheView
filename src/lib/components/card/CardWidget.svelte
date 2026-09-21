<script lang="ts">
	import CardLink from './CardLink.svelte';
	import QBittorrentWidget from '../widgets/QBittorrentWidget.svelte';
	import AdGuardWidget from '../widgets/AdGuardWidget.svelte';
	import BeszelWidget from '../widgets/BeszelWidget.svelte';
	import WgEasyWidget from '../widgets/WgEasyWidget.svelte';
	import DuplicatiWidget from '../widgets/DuplicatiWidget.svelte';
	import DockerWidget from '../widgets/DockerWidget.svelte';
	import DockhandWidget from '../widgets/DockhandWidget.svelte';
	import FilebrowserWidget from '../widgets/FilebrowserWidget.svelte';
	import ClockWidget from '../widgets/ClockWidget.svelte';
	import WeatherWidget from '../widgets/WeatherWidget.svelte';
	import { appState } from '$lib/client/state.svelte';
	import { Pencil, GripHorizontal } from "@lucide/svelte";
	import { Button } from "$lib/components/ui/button";

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
		separateCells,
		startEdit
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
		separateCells: boolean;
		startEdit: () => void;
	}>();


	let nodeW = $derived(parseInt(currentSize.split('x')[0].replace('gs-', '')) || 2);
	let nodeH = $derived(parseInt(currentSize.split('x')[1]) || 2);
	let isWide = $derived(nodeW > nodeH);
	let isWidgetLayout = $derived(nodeW !== nodeH || (nodeW >= 4 && nodeH >= 4));
	let isStandalone = $derived(service.isWidget === true);
</script>
{#if isStandalone}
	<div class="bg-card text-card-foreground border border-border p-4 rounded-xl shadow-sm hover:shadow-md transition-all duration-500 flex flex-col h-full w-full overflow-hidden {appState.isEditMode ? 'pointer-events-none' : ''}">
		{#if appState.isEditMode}
			<div class="absolute top-2 right-2 flex gap-1 z-20 pointer-events-auto">
				<Button variant="outline" size="icon" class="h-8 w-8 bg-card/90 hover:bg-muted shadow-sm" onclick={(e) => { e.preventDefault(); e.stopPropagation(); startEdit(); }}>
					<Pencil strokeWidth={1.5} />
				</Button>
				<div class="inline-flex items-center justify-center rounded-md text-sm font-medium border border-input bg-card/90 hover:bg-muted shadow-sm h-8 w-8 cursor-move text-muted-foreground" title="Trascina per spostare">
					<GripHorizontal class="pointer-events-none" strokeWidth={1.5} />
				</div>
			</div>
		{/if}
		{#if service.widgetType === 'qbittorrent'}
			<div class="w-full h-full flex flex-col min-h-0" role="presentation" onkeydown={(e) => e.stopPropagation()}>
				<QBittorrentWidget size={currentSize} />
			</div>
		{:else if service.widgetType === 'adguard'}
			<div class="w-full h-full flex flex-col min-h-0" role="presentation" onkeydown={(e) => e.stopPropagation()}>
				<AdGuardWidget size={currentSize} />
			</div>
		{:else if service.widgetType === 'beszel'}
			<div class="w-full h-full flex flex-col min-h-0" role="presentation" onkeydown={(e) => e.stopPropagation()}>
				<BeszelWidget size={currentSize} />
			</div>
		{:else if service.widgetType === 'wgeasy'}
			<div class="w-full h-full flex flex-col min-h-0" role="presentation" onkeydown={(e) => e.stopPropagation()}>
				<WgEasyWidget size={currentSize} />
			</div>
		{:else if service.widgetType === 'duplicati'}
			<div class="w-full h-full flex flex-col min-h-0" role="presentation" onkeydown={(e) => e.stopPropagation()}>
				<DuplicatiWidget size={currentSize} />
			</div>
		{:else if service.widgetType === 'docker'}
			<div class="w-full h-full flex flex-col min-h-0" role="presentation" onkeydown={(e) => e.stopPropagation()}>
				<DockerWidget size={currentSize} />
			</div>
		{:else if service.widgetType === 'dockhand'}
			<div class="w-full h-full flex flex-col min-h-0" role="presentation" onkeydown={(e) => e.stopPropagation()}>
				<DockhandWidget size={currentSize} />
			</div>
		{:else if service.widgetType === 'filebrowser'}
			<div class="w-full h-full flex flex-col min-h-0" role="presentation" onkeydown={(e) => e.stopPropagation()}>
				<FilebrowserWidget size={currentSize} />
			</div>
		{:else if service.widgetType === 'clock'}
			<div class="w-full h-full flex flex-col min-h-0" role="presentation" onkeydown={(e) => e.stopPropagation()}>
				<ClockWidget />
			</div>
		{:else if service.widgetType === 'weather'}
			<div class="w-full h-full flex flex-col min-h-0" role="presentation" onkeydown={(e) => e.stopPropagation()}>
				<WeatherWidget nodeW={nodeW} nodeH={nodeH} />
			</div>
		{/if}
	</div>
{:else if separateCells && isWidgetLayout}
	<svelte:element this={appState.isEditMode ? 'div' : 'a'} href={appState.isEditMode ? undefined : service.url} target={appState.isEditMode ? undefined : '_blank'} rel={appState.isEditMode ? undefined : "noopener noreferrer"} class="bg-card text-card-foreground rounded-xl {isWide ? 'rounded-r-none border-r-0' : 'rounded-b-none border-b-0'} border border-border p-4 shadow-sm hover:shadow-md transition-all duration-500 relative flex flex-col justify-center items-center text-center col-span-1 row-span-1">
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
		
		<CardLink {service} {status} {latencyMs} {iconStyle} {currentSize} {showDescriptionDesktop} {showDescriptionMobile} {dockerVersionInfo} {iconBgColor} centerText={true} />
	</svelte:element>

	<div class="bg-card border border-border p-4 rounded-xl {isWide ? 'rounded-l-none' : 'rounded-t-none'} shadow-sm hover:shadow-md transition-all duration-500 flex flex-col h-full w-full overflow-hidden col-span-1 row-span-1 {appState.isEditMode ? 'pointer-events-none' : ''}">
		{#if service.widgetType === 'qbittorrent'}
			<div class="w-full h-full flex flex-col min-h-0" role="presentation" onkeydown={(e) => e.stopPropagation()}>
				<QBittorrentWidget size={currentSize} />
			</div>
		{:else if service.widgetType === 'adguard'}
			<div class="w-full h-full flex flex-col min-h-0" role="presentation" onkeydown={(e) => e.stopPropagation()}>
				<AdGuardWidget size={currentSize} />
			</div>
		{:else if service.widgetType === 'beszel'}
			<div class="w-full h-full flex flex-col min-h-0" role="presentation" onkeydown={(e) => e.stopPropagation()}>
				<BeszelWidget size={currentSize} />
			</div>
		{:else if service.widgetType === 'wgeasy'}
			<div class="w-full h-full flex flex-col min-h-0" role="presentation" onkeydown={(e) => e.stopPropagation()}>
				<WgEasyWidget size={currentSize} />
			</div>
		{:else if service.widgetType === 'duplicati'}
			<div class="w-full h-full flex flex-col min-h-0" role="presentation" onkeydown={(e) => e.stopPropagation()}>
				<DuplicatiWidget size={currentSize} />
			</div>
		{:else if service.widgetType === 'docker'}
			<div class="w-full h-full flex flex-col min-h-0" role="presentation" onkeydown={(e) => e.stopPropagation()}>
				<DockerWidget size={currentSize} />
			</div>
		{:else if service.widgetType === 'dockhand'}
			<div class="w-full h-full flex flex-col min-h-0" role="presentation" onkeydown={(e) => e.stopPropagation()}>
				<DockhandWidget size={currentSize} />
			</div>
		{:else if service.widgetType === 'filebrowser'}
			<div class="w-full h-full flex flex-col min-h-0" role="presentation" onkeydown={(e) => e.stopPropagation()}>
				<FilebrowserWidget size={currentSize} />
			</div>
		{:else if service.widgetType === 'clock'}
			<div class="w-full h-full flex flex-col min-h-0" role="presentation" onkeydown={(e) => e.stopPropagation()}>
				<ClockWidget />
			</div>
		{:else if service.widgetType === 'weather'}
			<div class="w-full h-full flex flex-col min-h-0" role="presentation" onkeydown={(e) => e.stopPropagation()}>
				<WeatherWidget nodeW={nodeW} nodeH={nodeH} />
			</div>
		{/if}
	</div>
{:else}
	<CardLink {service} {status} {latencyMs} {iconStyle} {currentSize} {showDescriptionDesktop} {showDescriptionMobile} {dockerVersionInfo} {iconBgColor} centerText={true} hidePing={service.widgetType === 'dockhand' || service.widgetType === 'docker'}>
		{#if service.widgetType === 'qbittorrent'}
			<div class="mt-3 pt-3 border-t border-border w-full text-left flex-1 min-h-0 flex flex-col" role="presentation" onclick={(e) => e.preventDefault()} onkeydown={(e) => e.stopPropagation()}>
				<QBittorrentWidget size={currentSize} />
			</div>
		{:else if service.widgetType === 'adguard'}
			<div class="mt-3 pt-3 border-t border-border w-full text-left flex-1 min-h-0 flex flex-col" role="presentation" onclick={(e) => e.preventDefault()} onkeydown={(e) => e.stopPropagation()}>
				<AdGuardWidget size={currentSize} />
			</div>
		{:else if service.widgetType === 'beszel'}
			<div class="mt-3 pt-3 border-t border-border w-full text-left flex-1 min-h-0 flex flex-col" role="presentation" onclick={(e) => e.preventDefault()} onkeydown={(e) => e.stopPropagation()}>
				<BeszelWidget size={currentSize} />
			</div>
		{:else if service.widgetType === 'wgeasy'}
			<div class="mt-3 pt-3 border-t border-border w-full text-left flex-1 min-h-0 flex flex-col" role="presentation" onclick={(e) => e.preventDefault()} onkeydown={(e) => e.stopPropagation()}>
				<WgEasyWidget size={currentSize} />
			</div>
		{:else if service.widgetType === 'duplicati'}
			<div class="mt-3 pt-3 border-t border-border w-full text-left flex-1 min-h-0 flex flex-col" role="presentation" onclick={(e) => e.preventDefault()} onkeydown={(e) => e.stopPropagation()}>
				<DuplicatiWidget size={currentSize} />
			</div>
		{:else if service.widgetType === 'docker'}
			<div class="mt-3 pt-3 border-t border-border w-full text-left flex-1 min-h-0 flex flex-col" role="presentation" onclick={(e) => e.preventDefault()} onkeydown={(e) => e.stopPropagation()}>
				<DockerWidget size={currentSize} />
			</div>
		{:else if service.widgetType === 'dockhand'}
			<div class="mt-3 pt-3 border-t border-border w-full text-left flex-1 min-h-0 flex flex-col" role="presentation" onclick={(e) => e.preventDefault()} onkeydown={(e) => e.stopPropagation()}>
				<DockhandWidget size={currentSize} />
			</div>
		{:else if service.widgetType === 'filebrowser'}
			<div class="mt-3 pt-3 border-t border-border w-full text-left flex-1 min-h-0 flex flex-col" role="presentation" onclick={(e) => e.preventDefault()} onkeydown={(e) => e.stopPropagation()}>
				<FilebrowserWidget size={currentSize} />
			</div>
		{:else if service.widgetType === 'clock'}
			<div class="mt-3 pt-3 border-t border-border w-full text-left flex-1 min-h-0 flex flex-col" role="presentation" onclick={(e) => e.preventDefault()} onkeydown={(e) => e.stopPropagation()}>
				<ClockWidget />
			</div>
		{:else if service.widgetType === 'weather'}
			<div class="mt-3 pt-3 border-t border-border w-full text-left flex-1 min-h-0 flex flex-col" role="presentation" onclick={(e) => e.preventDefault()} onkeydown={(e) => e.stopPropagation()}>
				<WeatherWidget nodeW={nodeW} nodeH={nodeH} />
			</div>
		{/if}
	</CardLink>
{/if}
