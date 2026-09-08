<script lang="ts">
	import { ChevronDown } from "@lucide/svelte";
    import type { HTMLInputAttributes } from 'svelte/elements';
    import { clickOutside } from '$lib/actions/clickOutside';
    import { scale } from 'svelte/transition';
	import { Label } from "$lib/components/ui/label";
	import * as Popover from "$lib/components/ui/popover";

    interface Props extends HTMLInputAttributes {
        label: string;
        id?: string;
        value?: string | null;
        name?: string;
    }

    let { label, id = 'input-' + Math.random().toString(36).substring(2, 9), value = $bindable(), name, ...rest }: Props = $props();

    let protocol = $state('http://');
    let domain = $state('');
    let isProtocolOpen = $state(false);

    function syncFromValue(v: string | null | undefined) {
        if (!v) {
            domain = '';
            return;
        }
        if (v.startsWith('https://')) {
            protocol = 'https://';
            domain = v.substring(8);
        } else if (v.startsWith('http://')) {
            protocol = 'http://';
            domain = v.substring(7);
        } else {
            domain = v;
        }
    }

    $effect(() => {
        const expected = domain ? protocol + domain : '';
        if (value !== expected && value !== undefined) {
            syncFromValue(value);
        }
    });

    function handleDomainInput(e: Event) {
        let val = (e.target as HTMLInputElement).value;
        if (val.startsWith('http://')) {
            protocol = 'http://';
            val = val.substring(7);
        } else if (val.startsWith('https://')) {
            protocol = 'https://';
            val = val.substring(8);
        }
        domain = val;
        value = domain ? protocol + domain : '';
    }
    
    function changeProtocol(p: string) {
        protocol = p;
        isProtocolOpen = false;
        if (domain) {
            value = protocol + domain;
        }
    }
</script>

<div class="relative w-full h-10 flex flex-row items-center group/url {rest.class || ''}">
    <div class="relative h-10 w-21.25 shrink-0">
        <Popover.Root bind:open={isProtocolOpen}>
            <Popover.Trigger
                class="flex items-center justify-between h-10 w-full bg-transparent border border-input border-r-0 rounded-l-md pl-3 pr-2 text-sm font-medium text-muted-foreground focus:outline-none transition-colors group-focus-within/url:border-primary group-focus-within/url:border-y-2 group-focus-within/url:border-l-2 group-focus-within/url:text-foreground uppercase tracking-wider"
            >
                <span>{protocol}</span>
                <ChevronDown class="h-4 w-4 text-muted-foreground transition-transform duration-200 {isProtocolOpen ? 'rotate-180' : ''}" strokeWidth={1.5} />
            </Popover.Trigger>
            <Popover.Content class="w-25 p-0" sideOffset={4}>
                <ul class="py-1">
                    <li>
                        <button type="button" class="w-full text-left px-4 py-2 text-sm uppercase tracking-wider hover:bg-muted transition-colors {protocol === 'http://' ? 'bg-muted font-bold text-primary' : 'text-foreground font-medium'}" onclick={() => changeProtocol('http://')}>http://</button>
                    </li>
                    <li>
                        <button type="button" class="w-full text-left px-4 py-2 text-sm uppercase tracking-wider hover:bg-muted transition-colors {protocol === 'https://' ? 'bg-muted font-bold text-primary' : 'text-foreground font-medium'}" onclick={() => changeProtocol('https://')}>https://</button>
                    </li>
                </ul>
            </Popover.Content>
        </Popover.Root>
    </div>
    
    <div class="relative flex-1 h-10 min-w-0">
        <input 
            {id} 
            value={domain}
            oninput={handleDomainInput}
            {...rest} 
            placeholder=" " 
            class="peer block px-3 py-2 w-full h-10 text-sm bg-transparent border-0 focus:outline-none focus:ring-0 transition-colors text-foreground placeholder-transparent z-10 relative" 
        />
		<fieldset aria-hidden="true" class="absolute inset-0 m-0 p-0 px-2 border border-input border-l-0 rounded-r-md peer-focus:border-primary peer-focus:border-y-2 peer-focus:border-r-2 peer-focus:[&>legend]:max-w-full peer-not-placeholder-shown:[&>legend]:max-w-full transition-colors pointer-events-none z-0">
			<legend class="invisible px-1.5 text-[10px] font-bold uppercase tracking-wider h-0 overflow-hidden whitespace-nowrap max-w-0 transition-all duration-200">
				{#if label}{label} {#if rest.required}*{/if}{/if}
			</legend>
		</fieldset>
        <Label 
            for={id} 
            class="absolute left-2 px-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground transition-all duration-200 peer-placeholder-shown:top-2.5 peer-placeholder-shown:text-sm peer-placeholder-shown:font-normal peer-placeholder-shown:normal-case peer-placeholder-shown:tracking-normal peer-focus:-top-2.5 peer-focus:text-[10px] peer-focus:font-bold peer-focus:uppercase peer-focus:tracking-wider peer-focus:text-primary whitespace-nowrap pointer-events-none z-20 bg-transparent peer-not-placeholder-shown:-top-2.5"
        >
            {label} {#if rest.required}<span class="text-destructive">*</span>{/if}
        </Label>
    </div>
    {#if name}
        <input type="hidden" {name} value={value || ''} />
    {/if}
</div>
