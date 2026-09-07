<script lang="ts">
	import * as Card from "$lib/components/ui/card";
	import SettingsHeader from '$lib/components/ui/SettingsHeader.svelte';
	import { slide } from "svelte/transition";
	import { ArrowUp, Check, ExternalLink, Loader2, RefreshCw, ScrollText, ChevronDown, Copy } from "@lucide/svelte";
	import { marked } from "marked";
	import DOMPurify from "isomorphic-dompurify";
	import { Button } from "$lib/components/ui/button";

	let {
		versionInfo,
		isCheckingVersion,
		checkVersion
	} = $props<{
		versionInfo: any;
		isCheckingVersion: boolean;
		checkVersion: (force?: boolean) => void;
	}>();

	let showChangelog = $state(false);
	let copiedChangelog = $state(false);

	function copyChangelog() {
		if (!versionInfo.releaseNotes) return;
		navigator.clipboard.writeText(versionInfo.releaseNotes);
		copiedChangelog = true;
		setTimeout(() => copiedChangelog = false, 2000);
	}
</script>

<Card.Root>
	<SettingsHeader 
		title="SISTEMA" 
		description="INFORMAZIONI DI VERSIONE"
	>
		{#snippet icon()}
			<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
		{/snippet}
	</SettingsHeader>
	<Card.Content class="p-6">
		<div class="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between py-3">
			<div class="space-y-1">
				<div class="flex items-center space-x-2">
					<span class="text-sm font-bold uppercase tracking-wider text-muted-foreground">Versione Attuale:</span>
					<span class="text-base font-bold text-foreground">v{versionInfo.currentVersion || '...'}</span>
				</div>
				{#if versionInfo.latestVersion && versionInfo.latestVersion !== versionInfo.currentVersion}
					<div class="flex items-center space-x-2 text-red-500 dark:text-red-400">
						<ArrowUp class="w-4 h-4 animate-bounce" strokeWidth={1.5} />
						<span class="text-sm font-bold uppercase tracking-wider">Nuova versione disponibile: v{versionInfo.latestVersion}</span>
					</div>
				{:else if versionInfo.latestVersion === versionInfo.currentVersion}
					<div class="flex items-center space-x-2 text-emerald-600 dark:text-emerald-500">
						<Check class="w-4 h-4" strokeWidth={2} />
						<span class="text-xs font-bold uppercase tracking-wider">Il sistema è aggiornato</span>
					</div>
				{/if}
			</div>

			<div class="flex flex-row gap-3 w-full md:w-auto">
				{#if versionInfo.latestVersion && versionInfo.latestVersion !== versionInfo.currentVersion && versionInfo.url}
					<Button 
						variant="default"
						size="icon"
						onclick={() => showChangelog = !showChangelog}
						title={showChangelog ? 'Nascondi Changelog' : 'Vedi Changelog'}
					>
						<div class="relative flex items-center justify-center w-full h-full">
							<ScrollText class="w-6 h-6" />
							<ChevronDown class="w-3 h-3 absolute -bottom-1 -right-1 transition-transform duration-300 {showChangelog ? 'rotate-180' : ''}" strokeWidth={3} />
						</div>
					</Button>
				{/if}
				<Button 
					variant="outline"
					size="icon"
					onclick={() => checkVersion(true)}
					disabled={isCheckingVersion}
					title="Controlla Aggiornamenti"
				>
					{#if isCheckingVersion}
						<Loader2 class="animate-spin h-6 w-6" strokeWidth={2} />
					{:else}
						<RefreshCw class="h-6 w-6" strokeWidth={1.5} />
					{/if}
				</Button>
			</div>
		</div>
		
		{#if showChangelog && versionInfo.releaseNotes && versionInfo.latestVersion !== versionInfo.currentVersion}
		<div transition:slide class="mt-4 p-5 border border-border bg-muted/30 rounded-xl">
			<div class="flex items-center justify-between mb-4">
				<h4 class="text-sm font-bold uppercase tracking-wider text-foreground">Note di Rilascio v{versionInfo.latestVersion}</h4>
				<div class="flex items-center gap-2">
					<Button variant="outline" size="icon" onclick={() => copyChangelog()} title="Copia Changelog">
						{#if copiedChangelog}
							<Check class="w-4 h-4 text-emerald-500" strokeWidth={2} />
						{:else}
							<Copy class="w-4 h-4" strokeWidth={1.5} />
						{/if}
					</Button>
					<Button variant="outline" size="icon" href={versionInfo.url} target="_blank" rel="noopener noreferrer" title="Apri su GitHub">
						<img src="https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/svg/github.svg" class="w-5 h-5 dark:invert opacity-80 hover:opacity-100 transition-opacity" alt="GitHub" />
					</Button>
				</div>
			</div>
			<div class="prose prose-sm dark:prose-invert max-w-none max-h-64 overflow-y-auto pr-2 custom-scrollbar">
				{@html DOMPurify.sanitize(marked.parse(versionInfo.releaseNotes) as string)}
			</div>
		</div>
		{/if}
	</Card.Content>
</Card.Root>

