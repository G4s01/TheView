<script module lang="ts">
	// Caching globale (condiviso tra tutte le istanze) per ridurre le richieste duplicate
	const iconifyCache = new Map<string, {id: string, url: string}[]>();
	// Mappa delle richieste in corso per evitare chiamate simultanee identiche (Deduplication)
	const inFlightRequests = new Map<string, Promise<{id: string, url: string}[]>>();
</script>

<script lang="ts">
	import * as Command from "$lib/components/ui/command";
	import { Label } from "$lib/components/ui/label";
	import { Search, Check, Loader2 } from "@lucide/svelte";
	import { cn } from "$lib/utils";
	import { clickOutside } from '$lib/actions/clickOutside';
	import { onMount, tick, untrack } from "svelte";

	let { value = $bindable(""), name = "icon", class: className = "" } = $props<{ value?: string; name?: string; class?: string }>();

	let open = $state(false);
	let inputRef = $state<HTMLInputElement>(null!);
	let containerRef = $state<HTMLDivElement>(null!);
	let icons = $state<string[]>([]);
	let loading = $state(true);
	let isSelecting = $state(false);
	let previousValue = $state("");
	let inputId = $derived(name + "-" + Math.random().toString(36).substring(7));
	let iconifyIcons = $state<{id: string, url: string}[]>([]);
	let iconifyLoading = $state(false);

	$effect(() => {
		const searchTerm = value.trim();
		if (!open || isSelecting || searchTerm.length < 3 || searchTerm.startsWith('http') || searchTerm.startsWith('/')) {
			iconifyIcons = [];
			iconifyLoading = false;
			return;
		}
		
		if (iconifyCache.has(searchTerm)) {
			iconifyIcons = iconifyCache.get(searchTerm)!;
			iconifyLoading = false;
			return;
		}
		
		iconifyLoading = true;
		const controller = new AbortController();
		const timeoutId = setTimeout(async () => {
			if (iconifyCache.has(searchTerm)) {
				iconifyIcons = iconifyCache.get(searchTerm)!;
				iconifyLoading = false;
				return;
			}

			try {
				let fetchPromise = inFlightRequests.get(searchTerm);
				
				if (!fetchPromise) {
					fetchPromise = fetch(`https://api.iconify.design/search?query=${encodeURIComponent(searchTerm)}&limit=40`, {
						signal: controller.signal
					}).then(async (res) => {
						if (!res.ok) {
							if (res.status === 429 || res.status === 1015) {
								// Rate limit raggiunto, cache vuota temporanea per evitare spam
								console.warn("Iconify Rate Limit Reached");
								return [];
							}
							throw new Error("Failed to fetch");
						}
						const data = await res.json();
						const results = data.icons || [];
						const mapped = results.map((iconName: string) => {
							const [prefix, name] = iconName.split(':');
							return {
								id: iconName,
								url: `https://api.iconify.design/${prefix}/${name || ''}.svg`
							};
						});
						iconifyCache.set(searchTerm, mapped);
						return mapped;
					}).finally(() => {
						inFlightRequests.delete(searchTerm);
					});
					
					inFlightRequests.set(searchTerm, fetchPromise);
				}

				const mappedIcons = await fetchPromise;
				
				if (!controller.signal.aborted) {
					iconifyIcons = mappedIcons;
				}
			} catch (e: any) {
				if (e.name !== 'AbortError') {
					console.error("Failed to fetch from Iconify", e);
				}
			} finally {
				if (!controller.signal.aborted) {
					iconifyLoading = false;
				}
			}
		}, 600); // Aumentato il debounce a 600ms per mitigare il Rate Limit

		return () => {
			clearTimeout(timeoutId);
			controller.abort();
		};
	});

	onMount(async () => {
		try {
			const res = await fetch('/api/icons/list');
			const data = await res.json();
			icons = data.icons || [];
		} catch (e) {
			console.error(e);
		} finally {
			loading = false;
		}
	});

	function handleSelect(selectedValue: string) {
		isSelecting = true;
		value = selectedValue;
		previousValue = selectedValue;
		open = false;
		tick().then(() => {
			if (inputRef) inputRef.focus();
			// Reset isSelecting after focus event has time to fire
			setTimeout(() => {
				isSelecting = false;
			}, 10);
		});
	}
	
	let isCustomUrl = $derived(value.startsWith('http://') || value.startsWith('https://') || value.startsWith('/'));
	let filteredIcons = $derived(
		value
			? icons.filter(icon => icon.toLowerCase().includes(value.toLowerCase())).slice(0, 50)
			: icons.slice(0, 50)
	);

	function onFocus() {
		if (!isSelecting) {
			open = true;
			previousValue = value;
			value = "";
		}
	}

	function onInput() {
		open = true;
	}

	function onFocusOut(event: FocusEvent) {
		if (open && containerRef && !containerRef.contains(event.relatedTarget as Node)) {
			setTimeout(() => {
				if (open) {
					open = false;
					value = previousValue;
				}
			}, 150);
		}
	}
</script>

<div class="relative w-full h-10 {className}" bind:this={containerRef} onfocusout={onFocusOut} use:clickOutside={() => { if (open) { open = false; value = previousValue; } }}>
	<button 
		type="button"
		class={cn("absolute left-3 top-1/2 -translate-y-1/2 flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 animate-pulse cursor-text z-20", open ? "text-primary scale-110" : "text-muted-foreground hover:text-primary")}
		onclick={() => inputRef?.focus()}
		aria-label="Cerca icona"
	>
		<Search class="w-4 h-4" />
	</button>
	
	<input
		type="text"
		{name}
		id={inputId}
		bind:value={value}
		bind:this={inputRef}
		onfocus={onFocus}
		oninput={onInput}
		placeholder=" "
		class="peer h-10 w-full pl-9 pr-3 placeholder-transparent bg-transparent border-0 focus:ring-0 focus:outline-none z-10 relative shadow-none text-sm text-foreground"
		autocomplete="off"
	/>

	{#if open}
		<div class="absolute top-[calc(100%+4px)] left-0 z-50 w-full bg-popover text-popover-foreground rounded-md border shadow-md outline-none">
			<Command.Root shouldFilter={false} class="max-h-75 overflow-hidden rounded-md">
				<Command.List class="max-h-75 overflow-y-auto">
					{#if loading}
						<div class="py-6 text-center text-sm flex items-center justify-center gap-2">
							<Loader2 class="h-4 w-4 animate-spin text-muted-foreground" />
							Caricamento icone...
						</div>
					{:else}
						<Command.Empty>
							{#if isCustomUrl}
								<button 
									type="button"
									class="w-full text-left px-2 py-1.5 text-sm rounded-sm hover:bg-accent hover:text-accent-foreground"
									onclick={() => handleSelect(value)}
								>
									Usa URL personalizzato: <span class="font-bold block truncate">{value}</span>
								</button>
							{:else if iconifyLoading}
								Ricerca in corso...
							{:else}
								Nessuna icona trovata.
							{/if}
						</Command.Empty>
						<Command.Group>
							{#if isCustomUrl}
								<Command.Item
									value={value}
									onSelect={() => handleSelect(value)}
									class="flex items-center gap-3 cursor-pointer border-b"
								>
									<Check class={cn("mr-2 h-4 w-4 shrink-0", "opacity-100")} />
									<span class="font-bold">Usa URL:</span> <span class="truncate">{value}</span>
								</Command.Item>
							{/if}
							{#each filteredIcons as icon}
								<Command.Item
									value={icon}
									onSelect={() => handleSelect(icon)}
									class="flex items-center gap-3 cursor-pointer"
								>
									<Check class={cn("mr-2 h-4 w-4 shrink-0", value === icon ? "opacity-100" : "opacity-0")} />
									<img src={`https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons@main/png/${icon}.png`} class="w-6 h-6 object-contain shrink-0 rounded" alt={icon} loading="lazy" />
									<span class="truncate">{icon}</span>
								</Command.Item>
							{/each}
						</Command.Group>
						{#if iconifyIcons.length > 0}
							<div class="h-px bg-border my-2"></div>
							<div class="text-xs font-semibold text-muted-foreground px-2 py-1 mb-1">Iconify</div>
							<Command.Group>
								{#each iconifyIcons as icon}
									<Command.Item
										value={icon.url}
										onSelect={() => handleSelect(icon.url)}
										class="flex items-center gap-3 cursor-pointer"
									>
										<Check class={cn("mr-2 h-4 w-4 shrink-0", value === icon.url ? "opacity-100" : "opacity-0")} />
										<img src={icon.url} class="w-6 h-6 object-contain shrink-0 rounded" alt={icon.id} loading="lazy" />
										<span class="truncate">{icon.id}</span>
									</Command.Item>
								{/each}
							</Command.Group>
						{/if}
						{#if iconifyLoading}
							<div class="py-2 text-center text-xs flex items-center justify-center gap-2">
								<Loader2 class="h-3 w-3 animate-spin text-muted-foreground" />
								Ricerca Iconify...
							</div>
						{/if}
					{/if}
				</Command.List>
			</Command.Root>
		</div>
	{/if}

	<fieldset aria-hidden="true" class="absolute inset-0 m-0 p-0 px-2 border border-input rounded-md peer-focus:border-primary peer-focus:border-2 peer-focus:[&>legend]:max-w-full peer-not-placeholder-shown:[&>legend]:max-w-full transition-colors pointer-events-none z-0">
		<legend class="invisible px-1.5 text-[10px] font-bold uppercase tracking-wider h-0 overflow-hidden whitespace-nowrap max-w-0 transition-all duration-200">
			ICONA: CERCA O ⤵URL
		</legend>
	</fieldset>

	<Label 
		for={inputId} 
		class="absolute px-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground transition-all duration-200 peer-placeholder-shown:top-2.5 peer-placeholder-shown:left-9 peer-placeholder-shown:text-sm peer-placeholder-shown:font-normal peer-placeholder-shown:normal-case peer-focus:-top-2.5 peer-focus:left-2 peer-focus:text-[10px] peer-focus:font-bold peer-focus:uppercase peer-focus:text-primary pointer-events-none peer-not-placeholder-shown:-top-2.5 peer-not-placeholder-shown:left-2 z-20 bg-transparent"
	>
		ICONA: CERCA O ⤵URL
	</Label>
</div>

