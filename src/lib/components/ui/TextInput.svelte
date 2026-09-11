<script lang="ts">
	import { Label } from "$lib/components/ui/label";
	import type { Snippet } from "svelte";

	let {
		value = $bindable(),
		name = '',
		label = '',
		type = 'text',
		placeholder = ' ',
		required = false,
		pattern = undefined,
		disabled = false,
		onkeydown,
		autofocus = false,
		tabindex,
		id = Math.random().toString(36).substring(7),
		class: className = '',
		children
	} = $props<{
		value?: string;
		name?: string;
		label?: string;
		type?: 'text' | 'password' | 'email' | 'url' | 'number';
		placeholder?: string;
		required?: boolean;
		pattern?: string;
		disabled?: boolean;
		onkeydown?: (e: KeyboardEvent) => void;
		autofocus?: boolean;
		tabindex?: number;
		id?: string;
		class?: string;
		children?: Snippet;
	}>();

	function autofocusAction(node: HTMLInputElement) {
		if (autofocus) {
			// setTimeout helps ensure the element is focusable (e.g. within transitions)
			setTimeout(() => node.focus(), 50);
		}
	}
</script>

<div class="relative w-full h-10 {className}">
	<input
		{type}
		{id}
		{name}
		bind:value
		{onkeydown}
		{tabindex}
		use:autofocusAction
		placeholder=" " 
		{required}
		{pattern}
		{disabled}
		class="peer h-10 w-full placeholder-transparent bg-transparent border-0 focus:ring-0 focus:outline-none px-3 z-10 relative shadow-none text-sm text-foreground"
	/>
	
	<fieldset aria-hidden="true" class="absolute inset-0 m-0 p-0 px-2 border border-input rounded-md peer-focus:border-primary peer-focus:border-2 peer-focus:[&>legend]:max-w-full peer-not-placeholder-shown:[&>legend]:max-w-full transition-colors pointer-events-none z-0">
		<legend class="invisible px-1.5 text-[10px] font-bold uppercase tracking-wider h-0 overflow-hidden whitespace-nowrap max-w-0 transition-all duration-200">
			{#if label}{label} {#if required}*{/if}{/if}
		</legend>
	</fieldset>

	{#if label}
		<Label 
			for={id} 
			class="absolute left-2 px-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground transition-all duration-200 peer-placeholder-shown:top-2.5 peer-placeholder-shown:text-sm peer-placeholder-shown:font-normal peer-placeholder-shown:normal-case peer-focus:-top-2.5 peer-focus:text-[10px] peer-focus:font-bold peer-focus:uppercase peer-focus:text-primary pointer-events-none peer-not-placeholder-shown:-top-2.5 z-20 bg-transparent"
		>
			{label} {#if required}<span class="text-destructive">*</span>{/if}
		</Label>
	{/if}
	
	{#if children}
		{@render children()}
	{/if}
</div>
