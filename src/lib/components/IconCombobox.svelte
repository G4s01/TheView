<script module lang="ts">
	type CacheEntry = { icons: {id: string, url: string}[], hasMore: boolean };
	// Caching globale (condiviso tra tutte le istanze) per ridurre le richieste duplicate
	const iconifyCache = new Map<string, CacheEntry>();
	// Mappa delle richieste in corso per evitare chiamate simultanee identiche (Deduplication)
	const inFlightRequests = new Map<string, Promise<{icons: {id: string, url: string}[], total: number}>>();

	export function intersection(node: HTMLElement, callback: () => void) {
		const observer = new IntersectionObserver((entries) => {
			for (const entry of entries) {
				if (entry.isIntersecting) {
					callback();
				}
			}
		}, { root: null, rootMargin: "50px" });
		observer.observe(node);
		return {
			destroy() {
				observer.disconnect();
			}
		};
	}
</script>

<script lang="ts">
	import * as Command from "$lib/components/ui/command";
	import { Label } from "$lib/components/ui/label";
	import { Search, Check, Loader2 } from "@lucide/svelte";
	import { Skeleton } from "$lib/components/ui/skeleton";
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
	let iconifyHasMore = $state(false);
	let isFetchingMore = $state(false);
	let iconifyHasFetched = $state(false);
	let debouncedSearchTerm = $state("");

	let currentSearchController = new AbortController();

	let showIconifySection = $derived(
		debouncedSearchTerm.length >= 3 && 
		!debouncedSearchTerm.startsWith('http') && 
		!debouncedSearchTerm.startsWith('/') && 
		open && 
		!isSelecting
	);

	$effect(() => {
		const term = value.trim();
		const timeoutId = setTimeout(() => {
			untrack(() => {
				if (debouncedSearchTerm !== term) {
					debouncedSearchTerm = term;
					iconifyIcons = [];
					iconifyHasMore = false;
					iconifyHasFetched = false;
					iconifyLoading = false;
					isFetchingMore = false;
					currentSearchController.abort();
				}
			});
		}, 500);
		return () => clearTimeout(timeoutId);
	});

	async function performIconifySearch(searchTerm: string, offset: number, controller: AbortController) {
		const limit = 20;
		const reqKey = `${searchTerm}:${offset}`;
		let fetchPromise = inFlightRequests.get(reqKey);
		
		if (!fetchPromise) {
			fetchPromise = fetch(`https://api.iconify.design/search?query=${encodeURIComponent(searchTerm)}&limit=${limit}&start=${offset}`, {
				signal: controller.signal
			}).then(async (res) => {
				if (!res.ok) {
					if (res.status === 429 || res.status === 1015) {
						console.warn("Iconify Rate Limit Reached");
						return { icons: [], total: 0 };
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
				const total = data.total || 0;
				return { icons: mapped, total };
			}).finally(() => {
				inFlightRequests.delete(reqKey);
			});
			inFlightRequests.set(reqKey, fetchPromise);
		}

		return await fetchPromise;
	}

	async function loadInitialIconify() {
		const searchTerm = debouncedSearchTerm;
		if (!showIconifySection || iconifyHasFetched || iconifyLoading) return;

		iconifyHasFetched = true;

		if (iconifyCache.has(searchTerm)) {
			const cached = iconifyCache.get(searchTerm)!;
			iconifyIcons = cached.icons;
			iconifyHasMore = cached.hasMore;
			return;
		}

		iconifyLoading = true;
		currentSearchController = new AbortController();
		const controller = currentSearchController;

		try {
			const mappedIcons = await performIconifySearch(searchTerm, 0, controller);
			
			if (!controller.signal.aborted) {
				iconifyIcons = mappedIcons.icons;
				iconifyHasMore = mappedIcons.total > 0 && iconifyIcons.length < mappedIcons.total && mappedIcons.icons.length > 0;
				iconifyCache.set(searchTerm, { icons: iconifyIcons, hasMore: iconifyHasMore });
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
	}

	async function loadMore() {
		const searchTerm = debouncedSearchTerm;
		if (isFetchingMore || !iconifyHasMore || searchTerm.length < 3) return;
		
		isFetchingMore = true;
		try {
			const result = await performIconifySearch(searchTerm, iconifyIcons.length, currentSearchController);
			if (!currentSearchController.signal.aborted) {
				iconifyIcons = [...iconifyIcons, ...result.icons];
				iconifyHasMore = result.total > 0 && iconifyIcons.length < result.total && result.icons.length > 0;
				iconifyCache.set(searchTerm, { icons: iconifyIcons, hasMore: iconifyHasMore });
			}
		} catch (e: any) {
			if (e.name !== 'AbortError') console.error("Failed to load more from Iconify", e);
		} finally {
			if (!currentSearchController.signal.aborted) {
				isFetchingMore = false;
			}
		}
	}

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
						<div class="p-2 flex flex-col gap-1">
							{#each Array(5) as _}
								<div class="flex items-center gap-3 px-2 py-1.5">
									<Skeleton class="w-6 h-6 shrink-0 rounded" />
									<Skeleton class="h-4 w-32" />
								</div>
							{/each}
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
							{:else if !iconifyLoading}
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
							{#each filteredIcons as icon (icon)}
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
						{#if showIconifySection}
							{#key debouncedSearchTerm}
								<div use:intersection={loadInitialIconify}>
									<div class="h-px bg-border my-2"></div>
									<div class="text-xs font-semibold text-muted-foreground px-2 py-1 mb-1">Risultati da Iconify</div>
								</div>
							{/key}
							
							{#if iconifyIcons.length > 0}
								<Command.Group>
									{#each iconifyIcons as icon (icon.id)}
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
								<Command.Group>
									{#each Array(5) as _}
										<Command.Item disabled class="flex items-center gap-3">
											<Check class="mr-2 h-4 w-4 shrink-0 opacity-0" />
											<Skeleton class="w-6 h-6 shrink-0 rounded" />
											<Skeleton class="h-4 w-24" />
										</Command.Item>
									{/each}
								</Command.Group>
							{/if}

							{#if isFetchingMore}
								<Command.Group>
									{#each Array(3) as _}
										<Command.Item disabled class="flex items-center gap-3">
											<Check class="mr-2 h-4 w-4 shrink-0 opacity-0" />
											<Skeleton class="w-6 h-6 shrink-0 rounded" />
											<Skeleton class="h-4 w-24" />
										</Command.Item>
									{/each}
								</Command.Group>
							{/if}

							{#if iconifyHasMore && !iconifyLoading && iconifyIcons.length > 0}
								<div use:intersection={loadMore} class="h-1 w-full shrink-0 opacity-0 pointer-events-none"></div>
							{/if}
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

