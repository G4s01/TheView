import os

os.makedirs("src/lib/components/ui", exist_ok=True)

text_input = """<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';

	interface Props extends HTMLInputAttributes {
		label: string;
		id?: string;
		value?: string | null;
        bgClass?: string;
	}

	let { label, id = crypto.randomUUID(), value = $bindable(''), bgClass = 'bg-white dark:bg-gray-800', ...rest }: Props = $props();
</script>

<div class="relative w-full h-[42px]">
	<input 
		{id} 
		bind:value 
		{...rest} 
		placeholder=" " 
		class="block px-4 pb-2 pt-2.5 w-full h-full text-sm text-gray-900 bg-transparent rounded-xl border border-gray-200 appearance-none dark:text-white dark:border-gray-700 dark:focus:border-blue-500 focus:outline-none focus:ring-1 focus:border-blue-600 peer transition-colors {rest.class || ''}" 
	/>
	<label 
		for={id} 
		class="absolute text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-[21px] top-2.5 z-10 origin-[0] {bgClass} px-1.5 peer-focus:px-1.5 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2.5 peer-focus:-translate-y-[21px] start-3 pointer-events-none"
	>
		{label}
	</label>
</div>
"""
with open("src/lib/components/ui/TextInput.svelte", "w") as f:
    f.write(text_input)

select_input = """<script lang="ts">
	import type { HTMLSelectAttributes } from 'svelte/elements';

	interface Props extends HTMLSelectAttributes {
		label: string;
		id?: string;
		value?: string | null;
        bgClass?: string;
		children?: import('svelte').Snippet;
	}

	let { label, id = crypto.randomUUID(), value = $bindable(''), bgClass = 'bg-white dark:bg-gray-800', children, ...rest }: Props = $props();
</script>

<div class="relative w-full h-[42px]">
	<select 
		{id} 
		bind:value 
		{...rest} 
		class="block px-4 pb-2 pt-2.5 w-full h-full text-sm text-gray-900 bg-transparent rounded-xl border border-gray-200 appearance-none dark:text-white dark:border-gray-700 dark:focus:border-blue-500 focus:outline-none focus:ring-1 focus:border-blue-600 peer transition-colors {rest.class || ''}" 
	>
		{@render children?.()}
	</select>
	<label 
		for={id} 
		class="absolute text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-[21px] top-2.5 z-10 origin-[0] {bgClass} px-1.5 peer-focus:px-1.5 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-focus:top-2.5 peer-focus:-translate-y-[21px] start-3 pointer-events-none"
	>
		{label}
	</label>
    <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500 dark:text-gray-400">
        <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
    </div>
</div>
"""
with open("src/lib/components/ui/SelectInput.svelte", "w") as f:
    f.write(select_input)


toggle_input = """<script lang="ts">
	interface Props {
		label: string;
		checked: boolean;
		activeText?: string;
		inactiveText?: string;
		name?: string;
	}

	let { label, checked = $bindable(false), activeText = 'Attivo', inactiveText = 'Spento', name }: Props = $props();
</script>

<div class="relative w-full h-[42px]">
    <button type="button" onclick={() => checked = !checked} class="w-full flex items-center justify-between px-4 pb-2 pt-2.5 bg-transparent border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-1 focus:border-blue-600 focus:ring-blue-600 h-full transition-colors">
        <span class="text-sm font-medium {checked ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}">
            {checked ? activeText : inactiveText}
        </span>
        <label class="relative inline-flex items-center pointer-events-none">
            <input type="checkbox" {name} bind:checked class="sr-only peer">
            <div class="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
        </label>
    </button>
    <label class="absolute text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 transform -translate-y-[21px] top-2.5 z-10 origin-[0] bg-white dark:bg-gray-800 px-1.5 start-3 pointer-events-none">
        {label}
    </label>
</div>
"""
with open("src/lib/components/ui/ToggleInput.svelte", "w") as f:
    f.write(toggle_input)

