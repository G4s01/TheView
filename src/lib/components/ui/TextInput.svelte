<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';

	interface Props extends HTMLInputAttributes {
		label: string;
		id?: string;
		value?: string | null;
        bgClass?: string;
        children?: import('svelte').Snippet;
	}

	let { label, id = 'input-' + Math.random().toString(36).substring(2, 9), value = $bindable(), bgClass = 'bg-white dark:bg-gray-800', children, ...rest }: Props = $props();
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
	{@render children?.()}
</div>
