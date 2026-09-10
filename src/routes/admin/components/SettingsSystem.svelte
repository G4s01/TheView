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
					<div class="flex items-center space-x-2 text-destructive">
						<ArrowUp class="w-4 h-4 animate-bounce" strokeWidth={1.5} />
						<span class="text-sm font-bold uppercase tracking-wider">Nuova versione disponibile: v{versionInfo.latestVersion}</span>
					</div>
				{:else if versionInfo.latestVersion === versionInfo.currentVersion}
					<div class="flex items-center space-x-2 text-primary">
						<Check class="w-4 h-4" strokeWidth={2} />
						<span class="text-xs font-bold uppercase tracking-wider">Il sistema è aggiornato</span>
					</div>
				{/if}
			</div>

			<div class="flex flex-row gap-3 w-full md:w-auto">
				{#if versionInfo.latestVersion && versionInfo.url}
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
		
		{#if showChangelog && versionInfo.releaseNotes}
		<div transition:slide class="mt-4 p-5 border border-border bg-muted/30 rounded-xl">
			<div class="flex items-center justify-between mb-4">
				<h4 class="text-sm font-bold uppercase tracking-wider text-foreground">Note di Rilascio v{versionInfo.latestVersion}</h4>
				<div class="flex items-center gap-2">
					<Button variant="outline" size="icon" onclick={() => copyChangelog()} title="Copia Changelog">
						{#if copiedChangelog}
							<Check class="w-4 h-4 text-primary" strokeWidth={2} />
						{:else}
							<Copy class="w-4 h-4" strokeWidth={1.5} />
						{/if}
					</Button>
					<Button variant="outline" size="icon" href={versionInfo.url} target="_blank" rel="noopener noreferrer" title="Apri su GitHub">
						<ExternalLink class="size-4" strokeWidth={1.5} />
					</Button>
				</div>
			</div>
			<div class="changelog-content max-h-64 overflow-y-auto pr-2 custom-scrollbar text-sm text-foreground">
				{@html DOMPurify.sanitize(marked.parse(versionInfo.releaseNotes) as string)}
			</div>
		</div>
		{/if}
	</Card.Content>
</Card.Root>

<style>
	/* Changelog markdown content — use semantic colors for dark theme compatibility */
	.changelog-content :global(h1),
	.changelog-content :global(h2),
	.changelog-content :global(h3),
	.changelog-content :global(h4) {
		color: hsl(var(--foreground));
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		margin-top: 1rem;
		margin-bottom: 0.5rem;
	}

	.changelog-content :global(p) {
		color: hsl(var(--foreground));
		margin-bottom: 0.5rem;
	}

	.changelog-content :global(a) {
		color: hsl(var(--primary));
		text-decoration: underline;
	}

	.changelog-content :global(ul),
	.changelog-content :global(ol) {
		color: hsl(var(--foreground));
		padding-left: 1.25rem;
		margin-bottom: 0.5rem;
	}

	.changelog-content :global(li) {
		margin-bottom: 0.25rem;
	}

	.changelog-content :global(code) {
		color: hsl(var(--primary));
		background: hsl(var(--muted));
		padding: 0.125rem 0.375rem;
		border-radius: 0.25rem;
		font-size: 0.8em;
	}

	.changelog-content :global(strong) {
		color: hsl(var(--foreground));
		font-weight: 700;
	}

	.changelog-content :global(hr) {
		border-color: hsl(var(--border));
		margin: 0.75rem 0;
	}
</style>
