<script lang="ts">
	import type { HTMLSelectAttributes } from 'svelte/elements';

	interface Props extends HTMLSelectAttributes {
		label: string;
		id?: string;
		value?: string | null;
        bgClass?: string;
		children?: import('svelte').Snippet;
	}

	let { label, id = 'input-' + Math.random().toString(36).substring(2, 9), value = $bindable(), bgClass = 'bg-white dark:bg-gray-800', children, ...rest }: Props = $props();
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
