<script lang="ts">
    import type { HTMLInputAttributes } from 'svelte/elements';

    interface Props extends HTMLInputAttributes {
        label: string;
        id?: string;
        value?: string | null;
        bgClass?: string;
        name?: string;
    }

    let { label, id = 'input-' + Math.random().toString(36).substring(2, 9), value = $bindable(), bgClass = 'bg-white dark:bg-gray-800', name, ...rest }: Props = $props();

    let protocol = $state('http://');
    let domain = $state('');

    // Watch for external value changes (e.g. from DB)
    $effect(() => {
        if (value && typeof value === 'string') {
            if (value.startsWith('http://') && domain !== value.substring(7)) {
                protocol = 'http://';
                domain = value.substring(7);
            } else if (value.startsWith('https://') && domain !== value.substring(8)) {
                protocol = 'https://';
                domain = value.substring(8);
            } else if (!value.startsWith('http://') && !value.startsWith('https://') && domain !== value) {
                domain = value;
            }
        }
    });

    // Update bound value when internal state changes
    $effect(() => {
        if (domain) {
            value = protocol + domain;
        } else {
            value = '';
        }
    });

    function handleDomainInput(e: Event) {
        let val = (e.target as HTMLInputElement).value;
        if (val.startsWith('http://')) {
            protocol = 'http://';
            domain = val.substring(7);
        } else if (val.startsWith('https://')) {
            protocol = 'https://';
            domain = val.substring(8);
        } else {
            domain = val;
        }
    }
</script>

<div class="relative w-full h-[42px] flex">
    <div class="relative h-full w-[85px] shrink-0">
        <select bind:value={protocol} class="h-full w-full bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 border-r-0 rounded-l-xl pl-3 pr-6 text-xs font-bold text-gray-600 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 cursor-pointer appearance-none transition-colors">
            <option value="http://">http://</option>
            <option value="https://">https://</option>
        </select>
        <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2 text-gray-500">
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
        </div>
    </div>
    
    <div class="relative flex-1 h-full min-w-0">
        <input 
            {id} 
            value={domain}
            oninput={handleDomainInput}
            {...rest} 
            placeholder=" " 
            class="block px-4 pb-2 pt-2.5 w-full h-full text-sm text-gray-900 bg-transparent rounded-r-xl border border-gray-200 appearance-none dark:text-white dark:border-gray-700 dark:focus:border-blue-500 focus:outline-none focus:ring-1 focus:border-blue-600 peer transition-colors {rest.class || ''}" 
        />
        <label 
            for={id} 
            class="absolute text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-[21px] top-2.5 z-10 origin-[0] {bgClass} px-1.5 peer-focus:px-1.5 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2.5 peer-focus:-translate-y-[21px] start-2 pointer-events-none whitespace-nowrap"
        >
            {label}
        </label>
    </div>
    {#if name}
        <input type="hidden" {name} value={value || ''} />
    {/if}
</div>
