<script lang="ts">
	import { clickOutside } from '$lib/actions/clickOutside';
	import { Label } from "$lib/components/ui/label";
	import { Search, ChevronDown, Check } from "@lucide/svelte";
	import { cn } from "$lib/utils";
	import { tick } from "svelte";
	import * as Command from "$lib/components/ui/command";

	let {
		value = $bindable(),
		options = [],
		label = '',
		placeholder = 'Cerca...',
		id = Math.random().toString(36).substring(7),
		class: className = '',
		name,
		required = false,
		onchange
	} = $props<{
		value?: string | number | null;
		options?: { value: string | number; label: string; class?: string }[];
		label?: string;
		placeholder?: string;
		id?: string;
		class?: string;
		name?: string;
		required?: boolean;
		onchange?: (val: string | number) => void;
	}>();

	let open = $state(false);
	let searchTerm = $state("");
	let inputRef: HTMLInputElement | null = null;
	let containerRef: HTMLDivElement | null = null;
	let isSelecting = false;
	
	let isSelected = $derived(value !== null && value !== undefined && value !== '');
	let selectedLabel = $derived(options.find((o: any) => String(o.value) === String(value))?.label || (value ? String(value) : ''));

	// In Svelte 5, updating searchTerm should filter options
	let filteredOptions = $derived(
		searchTerm
			? options.filter((opt: any) => opt.label.toLowerCase().includes(searchTerm.toLowerCase())).slice(0, 1000)
			: options.slice(0, 1000)
	);

	$effect(() => {
		if (open) {
			searchTerm = "";
		} else {
			searchTerm = selectedLabel;
		}
	});
	
	// Initial sync
	$effect(() => {
		if (!open && selectedLabel && searchTerm === "") {
			searchTerm = selectedLabel;
		}
	});

	function handleSelect(val: string | number) {
		isSelecting = true;
		value = val;
		open = false;
		if (onchange) onchange(val);
		tick().then(() => {
			if (inputRef) inputRef.focus();
			setTimeout(() => {
				isSelecting = false;
			}, 10);
		});
	}

	function onFocusOut(event: FocusEvent) {
		if (open && containerRef && !containerRef.contains(event.relatedTarget as Node)) {
			setTimeout(() => {
				if (open) {
					open = false;
				}
			}, 150);
		}
	}
</script>

<div class="relative w-full h-10 {className}" bind:this={containerRef} onfocusout={onFocusOut} use:clickOutside={() => { if (open) open = false; }}>
	{#if name}
		<!-- Visually hidden text input so HTML5 required validation works -->
		<input type="text" tabindex="-1" class="absolute opacity-0 pointer-events-none -z-10 w-full h-full inset-0" {name} {required} value={value == null ? '' : value} />
	{/if}

	<button 
		type="button"
		class={cn("absolute left-3 top-1/2 -translate-y-1/2 flex items-center justify-center transition-all duration-300 z-20 pointer-events-none text-muted-foreground")}
	>
		<Search class="w-4 h-4" />
	</button>
	
	<input
		type="text"
		id={id}
		bind:value={searchTerm}
		bind:this={inputRef}
		onfocus={() => { if (!isSelecting) open = true; }}
		oninput={() => open = true}
		{placeholder}
		class="peer h-10 w-full pl-9 pr-8 placeholder-transparent bg-transparent border-0 focus:ring-0 focus:outline-none z-10 relative shadow-none text-sm text-foreground truncate"
		autocomplete="off"
	/>

	<button 
		type="button"
		class="absolute right-0 top-0 h-full px-3 flex items-center justify-center transition-all z-20 text-muted-foreground hover:text-foreground"
		onclick={() => { open = !open; if (open) inputRef?.focus(); }}
	>
		<ChevronDown class="w-4 h-4 transition-transform duration-200 {open ? 'rotate-180' : ''}" />
	</button>

	{#if open}
		<div class="absolute top-[calc(100%+4px)] left-0 z-50 w-full bg-popover text-popover-foreground rounded-md border shadow-md outline-none">
			<Command.Root shouldFilter={false} class="max-h-75 overflow-hidden rounded-md">
				<Command.List class="max-h-60 overflow-y-auto">
					
					{#if filteredOptions.length === 0}
						{#if searchTerm}
							<Command.Item
								value={searchTerm}
								onSelect={() => handleSelect(searchTerm)}
								class="flex items-center gap-3 cursor-pointer text-primary"
							>
								<Check class="mr-2 size-4 shrink-0 opacity-0" />
								<span class="truncate">Usa "{searchTerm}"</span>
							</Command.Item>
						{:else}
							<div class="py-6 text-center text-sm">Nessun risultato.</div>
						{/if}
					{/if}
					<Command.Group>

						{#each filteredOptions as opt (opt.value)}
							<Command.Item
								value={opt.label}
								onSelect={() => handleSelect(opt.value)}
								class="flex items-center gap-3 cursor-pointer {String(value) === String(opt.value) ? 'bg-muted font-bold text-primary' : ''} {opt.class || ''}"
							>
								<Check class={cn("mr-2 size-4 shrink-0", String(value) === String(opt.value) ? "opacity-100" : "opacity-0")} />
								<span class="truncate">{opt.label}</span>
							</Command.Item>
						{/each}
					</Command.Group>
				</Command.List>
			</Command.Root>
		</div>
	{/if}

	<fieldset aria-hidden="true" class="absolute inset-0 m-0 p-0 px-2 border border-input rounded-md peer-focus:border-primary peer-focus:border-2 peer-focus:[&>legend]:max-w-full peer-not-placeholder-shown:[&>legend]:max-w-full transition-colors pointer-events-none z-0">
		<legend class="invisible px-1.5 text-[10px] font-bold uppercase tracking-wider h-0 overflow-hidden whitespace-nowrap max-w-0 transition-all duration-200">
			{#if label}{label} {#if required}*{/if}{/if}
		</legend>
	</fieldset>

	{#if label}
		<Label 
			for={id} 
			class="absolute px-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground transition-all duration-200 peer-placeholder-shown:top-2.5 peer-placeholder-shown:left-9 peer-placeholder-shown:text-sm peer-placeholder-shown:font-normal peer-placeholder-shown:normal-case peer-focus:-top-2.5 peer-focus:left-2 peer-focus:text-[10px] peer-focus:font-bold peer-focus:uppercase peer-focus:text-primary pointer-events-none peer-not-placeholder-shown:-top-2.5 peer-not-placeholder-shown:left-2 z-20 bg-transparent"
		>
			{label} {#if required}<span class="text-destructive">*</span>{/if}
		</Label>
	{/if}
</div>
