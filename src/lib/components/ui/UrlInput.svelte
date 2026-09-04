<script lang="ts">
    import type { HTMLInputAttributes } from 'svelte/elements';
    import { clickOutside } from '$lib/actions/clickOutside';
    import { scale } from 'svelte/transition';

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
    let isProtocolOpen = $state(false);

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
    <div class="relative h-full w-[85px] shrink-0" use:clickOutside={() => isProtocolOpen = false}>
        <button 
            type="button"
            class="flex items-center justify-between h-full w-full bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 border-r-0 rounded-l-xl pl-3 pr-2 text-xs font-bold text-gray-600 dark:text-gray-300 focus:outline-none focus:ring-1 focus:border-blue-600 transition-colors"
            onclick={(e) => { e.preventDefault(); isProtocolOpen = !isProtocolOpen; }}
        >
            <span>{protocol}</span>
            <svg class="h-4 w-4 text-gray-500 transition-transform duration-200 {isProtocolOpen ? 'rotate-180' : ''}" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
        </button>
        
        {#if isProtocolOpen}
            <div 
                class="absolute z-50 w-[100px] mt-1 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-lg shadow-gray-200/50 dark:shadow-black/50 overflow-hidden origin-top-left"
                transition:scale={{ duration: 150, start: 0.95 }}
            >
                <ul class="py-1">
                    <li>
                        <button type="button" class="w-full text-left px-4 py-2.5 text-xs hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors {protocol === 'http://' ? 'bg-blue-50/50 dark:bg-gray-700/50 font-semibold text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-200'}" onclick={() => { protocol = 'http://'; isProtocolOpen = false; }}>http://</button>
                    </li>
                    <li>
                        <button type="button" class="w-full text-left px-4 py-2.5 text-xs hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors {protocol === 'https://' ? 'bg-blue-50/50 dark:bg-gray-700/50 font-semibold text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-200'}" onclick={() => { protocol = 'https://'; isProtocolOpen = false; }}>https://</button>
                    </li>
                </ul>
            </div>
        {/if}
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
