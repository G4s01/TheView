<script lang="ts">
	import { clickOutside } from '$lib/actions/clickOutside';
	import { Label } from "$lib/components/ui/label";
	import { Search, Loader2 } from "@lucide/svelte";
	import { cn } from "$lib/utils";
	import { onMount } from "svelte";

	let {
		value = $bindable(),
		label = '',
		placeholder = 'Es. Roma, Milano, Arcugnano...',
		id = Math.random().toString(36).substring(7),
		class: className = '',
	} = $props<{
		value?: string | null;
		label?: string;
		placeholder?: string;
		id?: string;
		class?: string;
	}>();

	let open = $state(false);
	let searchTerm = $state("");
	let isSearching = $state(false);
	let results = $state<any[]>([]);
	let containerRef: HTMLDivElement | null = null;
	let inputRef: HTMLInputElement | null = null;
	let searchTimeout: any;

	onMount(() => {
		if (value && typeof value === 'string') {
			const parts = value.split(',');
			if (parts.length >= 3) {
				searchTerm = parts.slice(2).join(',').trim();
			}
		}
	});

	async function performSearch(query: string) {
		if (!query || query.length < 2) {
			results = [];
			isSearching = false;
			return;
		}
		
		isSearching = true;
		try {
			const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=6&language=it&format=json`);
			if (res.ok) {
				const data = await res.json();
				results = data.results || [];
			} else {
				results = [];
			}
		} catch (e) {
			results = [];
		} finally {
			isSearching = false;
		}
	}

	function onInput() {
		open = true;
		clearTimeout(searchTimeout);
		isSearching = true;
		searchTimeout = setTimeout(() => {
			performSearch(searchTerm);
		}, 400);
	}

	function selectResult(res: any) {
		const name = res.admin1 && res.admin1 !== res.name ? `${res.name}, ${res.admin1}` : res.name;
		value = `${res.latitude},${res.longitude},${name}`;
		searchTerm = name;
		open = false;
	}

</script>

<div class="relative w-full h-10 {className} z-50" bind:this={containerRef} use:clickOutside={() => { if (open) open = false; }}>
	
	<button 
		type="button"
		class="absolute left-3 top-1/2 -translate-y-1/2 flex items-center justify-center transition-all duration-300 z-20 pointer-events-none text-muted-foreground"
	>
		{#if isSearching}
			<Loader2 class="w-4 h-4 animate-spin text-primary" />
		{:else}
			<Search class="w-4 h-4" />
		{/if}
	</button>
	
	<input
		type="text"
		{id}
		bind:value={searchTerm}
		bind:this={inputRef}
		onfocus={() => { if (searchTerm.length > 0) open = true; }}
		oninput={onInput}
		{placeholder}
		class="peer h-10 w-full pl-9 pr-3 placeholder-transparent bg-transparent border-0 focus:ring-0 focus:outline-none z-10 relative shadow-none text-sm text-foreground truncate"
		autocomplete="off"
	/>

	{#if open && searchTerm.length > 0}
		<div class="absolute top-[calc(100%+4px)] left-0 w-full bg-popover text-popover-foreground rounded-md border shadow-lg outline-none overflow-hidden max-h-72 overflow-y-auto">
			{#if isSearching && results.length === 0}
				<div class="p-4 text-center text-xs text-muted-foreground">Ricerca in corso...</div>
			{:else if !isSearching && results.length === 0}
				<div class="p-4 text-center text-xs text-muted-foreground">Nessuna località trovata per "{searchTerm}".</div>
			{:else}
				<div class="flex flex-col py-1">
					{#each results as res}
						<button 
							type="button" 
							class="w-full text-left px-3 py-2 text-sm hover:bg-muted focus:bg-muted transition-colors flex flex-col items-start justify-center gap-0.5"
							onclick={() => selectResult(res)}
						>
							<span class="font-bold">{res.name}</span>
							<span class="text-[10px] text-muted-foreground">
								{#if res.admin1}{res.admin1},{/if} {res.country}
							</span>
						</button>
					{/each}
				</div>
			{/if}
		</div>
	{/if}

	<fieldset aria-hidden="true" class="absolute inset-0 m-0 p-0 px-2 border border-input rounded-md peer-focus:border-primary peer-focus:border-2 peer-focus:[&>legend]:max-w-full peer-not-placeholder-shown:[&>legend]:max-w-full transition-colors pointer-events-none z-0">
		<legend class="invisible px-1.5 text-[10px] font-bold uppercase tracking-wider h-0 overflow-hidden whitespace-nowrap max-w-0 transition-all duration-200">
			{#if label}{label}{/if}
		</legend>
	</fieldset>

	{#if label}
		<Label 
			for={id} 
			class="absolute px-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground transition-all duration-200 peer-placeholder-shown:top-2.5 peer-placeholder-shown:left-9 peer-placeholder-shown:text-sm peer-placeholder-shown:font-normal peer-placeholder-shown:normal-case peer-focus:-top-2.5 peer-focus:left-2 peer-focus:text-[10px] peer-focus:font-bold peer-focus:uppercase peer-focus:text-primary pointer-events-none peer-not-placeholder-shown:-top-2.5 peer-not-placeholder-shown:left-2 z-20 bg-transparent"
		>
			{label}
		</Label>
	{/if}
</div>
