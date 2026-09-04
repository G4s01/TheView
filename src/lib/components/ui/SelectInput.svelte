<script lang="ts">
	import { clickOutside } from '$lib/actions/clickOutside';
	import { scale } from 'svelte/transition';

	interface Option {
		value: string | number;
		label: string;
		class?: string;
	}

	interface Props {
		label: string;
		id?: string;
		name?: string;
		value?: string | number | null;
		options?: Option[];
		bgClass?: string;
		required?: boolean;
		class?: string;
		onchange?: (value: string | number) => void;
	}

	let { 
		label, 
		id = 'select-' + Math.random().toString(36).substring(2, 9), 
		name, 
		value = $bindable(), 
		options = [], 
		bgClass = 'bg-white dark:bg-gray-800', 
		required,
		class: className = '',
		onchange
	}: Props = $props();

	let isOpen = $state(false);

	let selectedLabel = $derived(options.find(o => String(o.value) === String(value))?.label || '-- Seleziona --');

	function handleSelect(val: string | number) {
		value = val;
		isOpen = false;
		if (onchange) onchange(val);
	}
	
	function onClickOutside() {
		isOpen = false;
	}
</script>

<div class="relative w-full h-[42px]" use:clickOutside={onClickOutside}>
	{#if name}
		<input type="hidden" {name} value={value ?? ''} {required} />
	{/if}
	
	<button 
		type="button"
		{id}
		class="flex items-center justify-between px-4 pb-2 pt-2.5 w-full h-full text-sm text-left text-gray-900 bg-transparent rounded-xl border border-gray-200 dark:text-white dark:border-gray-700 focus:outline-none focus:ring-1 focus:border-blue-600 peer transition-colors {className}"
		onclick={(e) => { e.preventDefault(); isOpen = !isOpen; }}
	>
		<span class="truncate {!value && !options.find(o=>o.value==='') ? 'text-gray-400' : ''}">{selectedLabel}</span>
		<svg class="h-4 w-4 text-gray-500 dark:text-gray-400 shrink-0 transition-transform duration-200 {isOpen ? 'rotate-180' : ''}" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
	</button>
	
	<label 
		for={id} 
		class="absolute text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-[21px] top-2.5 z-10 origin-[0] {bgClass} px-1.5 peer-focus:px-1.5 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-focus:top-2.5 peer-focus:-translate-y-[21px] start-3 pointer-events-none"
	>
		{label}
	</label>

	{#if isOpen}
		<div 
			class="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-lg shadow-gray-200/50 dark:shadow-black/50 overflow-hidden origin-top"
			transition:scale={{ duration: 150, start: 0.95 }}
		>
			<ul class="max-h-60 overflow-y-auto no-scrollbar py-1">
				{#each options as opt}
					<li>
						<button 
							type="button"
							class="w-full text-left px-4 py-2.5 text-sm hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors {String(value) === String(opt.value) ? 'bg-blue-50/50 dark:bg-gray-700/50 font-semibold text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-200'} {opt.class || ''}"
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
