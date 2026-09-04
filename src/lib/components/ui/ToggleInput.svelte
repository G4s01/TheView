<script lang="ts">
	interface Props {
		label?: string;
		checked?: boolean | null;
		activeText?: string;
		inactiveText?: string;
		name?: string;
		value?: string;
	}

	let { label = '', checked = $bindable(), activeText = 'ON', inactiveText = 'OFF', name, value }: Props = $props();
</script>

<div class="relative w-full h-[42px]">
    <button type="button" onclick={() => checked = !checked} class="w-full flex items-center justify-between px-4 pb-2 pt-2.5 bg-transparent border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-1 focus:border-blue-600 focus:ring-blue-600 h-full transition-colors">
        <span class="text-sm font-bold flex items-center gap-2 {checked ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-500 dark:text-gray-400'}">
			{#if checked}
				<span class="relative flex h-2.5 w-2.5">
				  <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
				  <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
				</span>
			{:else}
				<span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-gray-400 dark:bg-gray-500"></span>
			{/if}
            {checked ? activeText : inactiveText}
        </span>
        <label class="relative inline-flex items-center pointer-events-none">
            <input type="checkbox" {name} {value} bind:checked class="sr-only peer">
            <div class="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
        </label>
    </button>
    {#if label}
    <span class="absolute text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 transform -translate-y-[21px] top-2.5 z-10 origin-[0] bg-white dark:bg-gray-800 px-1.5 start-3 pointer-events-none">
        {label}
    </span>
    {/if}
</div>
