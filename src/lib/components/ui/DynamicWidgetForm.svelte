<script lang="ts">
	import TextInput from '$lib/components/ui/TextInput.svelte';
	import UrlInput from '$lib/components/ui/UrlInput.svelte';
	import ToggleInput from '$lib/components/ui/ToggleInput.svelte';
	import SearchableCombobox from '$lib/components/ui/SearchableCombobox.svelte';
	import LocationSearchInput from '$lib/components/ui/LocationSearchInput.svelte';
	import SelectInput from '$lib/components/ui/SelectInput.svelte';
	import { Eye, EyeOff, Pencil, Plus, X } from "@lucide/svelte";
	import SaveButton from "$lib/components/ui/SaveButton.svelte";
	import ConfirmDeleteButton from "$lib/components/ui/ConfirmDeleteButton.svelte";
	import BackButton from "$lib/components/ui/BackButton.svelte";
	import ServiceIcon from '$lib/components/ui/ServiceIcon.svelte';
	import { clickOutside } from '$lib/actions/clickOutside';
	import { page } from '$app/stores';
	import type { WidgetDef } from '$lib/config/widgetRegistry';

	let {
		widget,
		values = $bindable(),
		isExpanded = $bindable(false),
		onSave,
		isSaving,
		hideHeader = false,
		onDelete,
		onCancel
	} = $props<{
		widget: WidgetDef;
		values: Record<string, any>;
		isExpanded?: boolean;
		onSave: (values: Record<string, any>) => void;
		isSaving: boolean;
		hideHeader?: boolean;
		onDelete?: () => void;
		onCancel?: () => void;
	}>();

	let iconStyle = $derived($page.data.settings?.iconStyle || "rounded-xl");
	let showPassword = $state<Record<string, boolean>>({});

	$effect(() => {
		if (widget && widget.fields) {
			widget.fields.forEach((f: any) => {
				if (f.type === 'combobox' && f.options && f.options.length > 0 && !values[f.id]) {
					// Fallback specifici
					if (f.id === 'clock_timezone') {
						const defaultRome = f.options.find((o: any) => o.value === 'Europe/Rome');
						if (defaultRome) values[f.id] = defaultRome.value;
						else values[f.id] = f.options[0].value;
					} else if (f.id === 'weather_location') {
						values[f.id] = '41.90278,12.49637,Roma';
					} else {
						values[f.id] = f.options[0].value;
					}
				}
			});
		}
	});

	let componentId = $derived("widget-" + widget.id);

	function handleSave() {
		onSave(values);
	}
</script>

{#if !hideHeader}
<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<li id="{componentId}-row" class="px-6 py-5 hover:bg-muted/50 transition-colors flex flex-col gap-4 cursor-pointer {componentId}-row" onclick={() => isExpanded = !isExpanded}>
	<div class="flex items-center justify-between w-full">
		<div class="flex items-center gap-4 flex-1 min-w-0 mr-4">
			<div class="shrink-0">
				<ServiceIcon icon={widget.icon} name={widget.name} size="lg" {iconStyle} class="shadow-sm border border-border bg-card" />
			</div>
			<div class="flex flex-col sm:flex-row sm:items-center sm:gap-3 flex-1 min-w-0">
				<p class="text-sm font-semibold text-foreground uppercase tracking-wider truncate">{widget.name}</p>
				<p class="text-xs text-muted-foreground truncate">{widget.description}</p>
			</div>
		</div>
		
		<div>
			<button id="edit-{componentId}-btn" type="button" onclick={(e: Event) => { e.stopPropagation(); isExpanded = !isExpanded; }} class="inline-flex items-center justify-center size-10 border border-transparent rounded-full shadow-sm transition-all duration-300 {isExpanded ? 'bg-muted text-muted-foreground hover:bg-accent' : 'bg-primary text-primary-foreground hover:opacity-90'} focus:outline-none hover:scale-110 edit-{componentId}-btn">
				<div class="relative size-5">
					<Pencil class="absolute top-0 left-0 size-4 transition-all duration-300 {isExpanded ? 'opacity-60' : ''}" strokeWidth={2.5} />
					{#if isExpanded}
						<X class="absolute -bottom-1 -right-1 size-3.5 shadow-sm" strokeWidth={3} />
					{:else}
						<Plus class="absolute -bottom-1 -right-1 size-3.5 shadow-sm" strokeWidth={3} />
					{/if}
				</div>
			</button>
		</div>
	</div>
	
	{#if isExpanded}
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<div class="w-full mt-2 relative" use:clickOutside={{ enabled: isExpanded, handler: () => isExpanded = false, ignore: `#edit-${componentId}-btn, #${componentId}-row` }}>
			<div class="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-primary to-accent rounded-t-xl z-10"></div>
			<div class="p-5 bg-card text-card-foreground rounded-xl shadow-lg border border-border relative flex flex-col gap-4" onclick={(e) => e.stopPropagation()} role="presentation">
				<div class="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
					{#each widget.fields as field}
						{#if field.type === 'text'}
							<div class="md:col-span-6 h-10">
								<TextInput label={field.label} bind:value={values[field.id]} />
							</div>
						{:else if field.type === 'url'}
							<div class="md:col-span-6 h-10">
								<UrlInput label={field.label} bind:value={values[field.id]} />
							</div>
						{:else if field.type === 'password'}
							<div class="md:col-span-6 h-10">
								<TextInput label={field.label} type={showPassword[field.id] ? "text" : "password"} bind:value={values[field.id]} class="pr-10">
									<button type="button" onclick={() => showPassword[field.id] = !showPassword[field.id]} class="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground transition-colors">
										{#if showPassword[field.id]}
											<EyeOff class="size-5" strokeWidth={1.5} />
										{:else}
											<Eye class="size-5" strokeWidth={1.5} />
										{/if}
									</button>
								</TextInput>
							</div>
						{:else if field.type === 'select' && field.options}
							<div class="md:col-span-6 h-10">
								<SelectInput label={field.label} bind:value={values[field.id]} options={field.options} />
							</div>
						{:else if field.type === 'combobox' && field.options}
							<div class="md:col-span-6 h-10 z-50">
								<SearchableCombobox label={field.label} bind:value={values[field.id]} options={field.options} />
							</div>
						{:else if field.type === 'location'}
							<div class="md:col-span-6 h-10 z-[60]">
								<LocationSearchInput label={field.label} bind:value={values[field.id]} />
							</div>
						{/if}
					{/each}
				</div>
				
				<div class="flex justify-between items-center mt-2">
					<div class="flex gap-4 items-center">
					{#each widget.fields.filter((f: any) => f.type === 'checkbox') as field}
						<ToggleInput label={field.label} checked={values[field.id] ?? false} onCheckedChange={(v) => values[field.id] = v} />
					{/each}
					</div>
					<div class="flex items-center justify-end gap-2 shrink-0">
						{#if onDelete}
							<ConfirmDeleteButton onConfirm={onDelete} disabled={isSaving} />
						{/if}
						{#if onCancel}
							<BackButton onclick={onCancel} disabled={isSaving} text="" title="ANNULLA" />
						{/if}
						<SaveButton class="w-32 h-10" onclick={handleSave} isLoading={isSaving} />
					</div>
				</div>
			</div>
		</div>
	{/if}
</li>
{:else}
	<div class="flex flex-col gap-4 w-full">
		<div class="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
			{#each widget.fields as field}
				{#if field.type === 'text'}
					<div class="md:col-span-12 h-10">
						<TextInput label={field.label} bind:value={values[field.id]} />
					</div>
				{:else if field.type === 'url'}
					<div class="md:col-span-12 h-10">
						<UrlInput label={field.label} bind:value={values[field.id]} />
					</div>
				{:else if field.type === 'password'}
					<div class="md:col-span-12 h-10">
						<TextInput label={field.label} type={showPassword[field.id] ? "text" : "password"} bind:value={values[field.id]} class="pr-10">
							<button type="button" onclick={() => showPassword[field.id] = !showPassword[field.id]} class="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground transition-colors">
								{#if showPassword[field.id]}
									<EyeOff class="size-5" strokeWidth={1.5} />
								{:else}
									<Eye class="size-5" strokeWidth={1.5} />
								{/if}
							</button>
						</TextInput>
					</div>
				{:else if field.type === 'select' && field.options}
					<div class="md:col-span-12 h-10">
						<SelectInput label={field.label} bind:value={values[field.id]} options={field.options} />
					</div>
				{:else if field.type === 'combobox' && field.options}
					<div class="md:col-span-12 h-10 z-50">
						<SearchableCombobox label={field.label} bind:value={values[field.id]} options={field.options} />
					</div>
				{:else if field.type === 'location'}
					<div class="md:col-span-12 h-10 z-[60]">
						<LocationSearchInput label={field.label} bind:value={values[field.id]} />
					</div>
				{/if}
			{/each}
		</div>
		
		<div class="flex justify-between items-center mt-2 w-full">
			<div class="flex flex-col gap-2 items-start">
			{#each widget.fields.filter((f: any) => f.type === 'checkbox') as field}
				<ToggleInput label={field.label} checked={values[field.id] ?? false} onCheckedChange={(v) => values[field.id] = v} />
			{/each}
			</div>
			<div class="flex items-center justify-end gap-2 shrink-0">
				{#if onDelete}
					<ConfirmDeleteButton onConfirm={onDelete} disabled={isSaving} />
				{/if}
				{#if onCancel}
					<BackButton onclick={onCancel} disabled={isSaving} text="" title="ANNULLA" />
				{/if}
				<SaveButton class="w-32 h-10 shrink-0" onclick={handleSave} isLoading={isSaving} />
			</div>
		</div>
	</div>
{/if}
