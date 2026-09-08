<script lang="ts">
	import { ChevronDown } from "@lucide/svelte";
	import { clickOutside } from '$lib/actions/clickOutside';
	import { scale } from 'svelte/transition';
	import { Label } from "$lib/components/ui/label";

	let {
		value = $bindable(),
		options = [],
		label = '',
		id = Math.random().toString(36).substring(7),
		class: className = '',
		name,
		required = false,
		onchange
	} = $props<{
		value?: string | number | null;
		options?: { value: string | number; label: string; class?: string }[];
		label?: string;
		id?: string;
		class?: string;
		name?: string;
		required?: boolean;
		onchange?: (val: string | number) => void;
	}>();

	let isOpen = $state(false);
	
	let isSelected = $derived(value !== null && value !== undefined && value !== '');
	let selectedLabel = $derived(options.find((o: any) => String(o.value) === String(value))?.label || '');

	function handleSelect(val: string | number) {
		value = val;
		isOpen = false;
		if (onchange) onchange(val);
	}
	
	function onClickOutside() {
		isOpen = false;
	}

	let inputEl = $state<HTMLInputElement | null>(null);
	$effect(() => {
		if (inputEl) {
			inputEl.value = value == null || value === '' ? '' : String(value);
		}
	});
</script>

<div class="relative w-full h-10 {className}" use:clickOutside={onClickOutside}>
	{#if name}
		<!-- Visually hidden text input so HTML5 required validation works -->
		<input bind:this={inputEl} type="text" tabindex="-1" class="absolute opacity-0 pointer-events-none -z-10 w-full h-full inset-0" {name} {required} />
	{/if}
	
	<button 
		type="button"
		{id}
		class="peer flex items-center justify-between px-3 py-2 w-full h-full text-sm text-left text-foreground bg-transparent border-0 focus:outline-none focus:ring-0 focus:border-0 z-10 relative shadow-none"
		onclick={(e) => { e.preventDefault(); isOpen = !isOpen; }}
	>
		<span class="truncate {(!isSelected && !isOpen) ? 'opacity-0' : 'opacity-100'}">{selectedLabel}</span>
		<ChevronDown class="h-4 w-4 text-muted-foreground shrink-0 transition-transform duration-200 {isOpen ? 'rotate-180' : ''}" strokeWidth={1.5} />
	</button>
	
	<fieldset aria-hidden="true" class="absolute inset-0 m-0 p-0 px-2 border border-input rounded-md transition-colors pointer-events-none z-0 {isOpen ? 'border-primary border-2 [&>legend]:max-w-full' : (isSelected ? '[&>legend]:max-w-full' : '')}">
		<legend class="invisible px-1.5 text-[10px] font-bold uppercase tracking-wider h-0 overflow-hidden whitespace-nowrap max-w-0 transition-all duration-200">
			{#if label}{label} {#if required}*{/if}{/if}
		</legend>
	</fieldset>

	{#if label}
		<Label 
			for={id} 
			class="absolute left-2 px-1 text-[10px] font-bold uppercase tracking-wider transition-all duration-200 pointer-events-none z-20 bg-transparent {(isSelected || isOpen) ? '-top-2.5' : 'top-2.5 text-sm font-normal normal-case tracking-normal max-w-[calc(100%-2rem)] truncate'} {isOpen ? 'text-primary' : 'text-muted-foreground'}"
		>
			{label} {#if required}<span class="text-destructive">*</span>{/if}
		</Label>
	{/if}

	{#if isOpen}
		<div 
			class="absolute z-50 w-full mt-1 bg-popover border border-border rounded-xl shadow-lg overflow-hidden origin-top"
			transition:scale={{ duration: 150, start: 0.95 }}
		>
			<ul class="max-h-60 overflow-y-auto no-scrollbar py-1">
				{#each options as opt}
					<li>
						<button 
							type="button"
							class="w-full text-left px-4 py-2.5 text-sm hover:bg-muted transition-colors {String(value) === String(opt.value) ? 'bg-muted font-semibold text-primary' : 'text-foreground'} {opt.class || ''}"
							onclick={(e) => { e.preventDefault(); handleSelect(opt.value); }}
						>
							{opt.label}
						</button>
					</li>
				{/each}
			</ul>
		</div>
	{/if}
</div>
