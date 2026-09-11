<script lang="ts">
	import TextInput from '$lib/components/ui/TextInput.svelte';
	import IconCombobox from '$lib/components/IconCombobox.svelte';
	import ConfirmDeleteButton from '$lib/components/ui/ConfirmDeleteButton.svelte';
	import SaveButton from '$lib/components/ui/SaveButton.svelte';
	import { Upload } from '@lucide/svelte';
	import { enhance } from '$app/forms';

	let {
		category = $bindable(),
		isSaving = false,
		onCancel = undefined,
		onDelete = undefined,
		action = "?/updateCategory"
	} = $props<{
		category: any;
		isSaving?: boolean;
		onCancel?: () => void;
		onDelete?: () => void;
		action?: string;
	}>();

	function handleCancel() {
		if (onCancel) onCancel();
	}
</script>

<form
	method="POST"
	{action}
	use:enhance={() => {
		isSaving = true;
		return async ({ update }) => {
			await update();
			isSaving = false;
			if (onCancel) onCancel(); // Close form on successful save
		};
	}}
	class="w-full flex flex-col gap-4"
>
	<input type="hidden" name="id" value={category.id} />

	<div class="grid grid-cols-1 md:grid-cols-12 gap-4 items-center relative">
		{#if isSaving}
			<div class="absolute inset-0 z-50 bg-background/50 backdrop-blur-[2px] flex items-center justify-center rounded-xl transition-all">
				<div class="flex items-center gap-3 bg-card p-4 rounded-xl shadow-lg border border-border">
					<div class="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
					<span class="text-sm font-bold uppercase tracking-wider text-primary">Salvataggio...</span>
				</div>
			</div>
		{/if}

		<div class="md:col-span-6 h-10 flex gap-4 items-center">
			<div class="flex-1 min-w-0 h-10">
				<TextInput label="NOME CATEGORIA" name="name" bind:value={category.name} required />
			</div>
		</div>

		<div class="md:col-span-6 flex gap-4 items-center h-10">
			<div class="flex-1 min-w-0 h-10">
				<IconCombobox name="icon" bind:value={category.icon} />
			</div>
			<label
				class="cursor-pointer bg-transparent text-foreground border border-input rounded-md w-10 h-10 flex items-center justify-center transition-colors shadow-none shrink-0 hover:bg-accent hover:text-accent-foreground"
				title="Carica un'immagine"
			>
				<Upload class="h-4 w-4 opacity-70" strokeWidth={2} />
				<input
					type="file"
					accept="image/png, image/svg+xml, image/jpeg"
					class="hidden"
					onchange={async (e) => {
						const target = e.target as HTMLInputElement;
						const file = target?.files?.[0];
						if (!file) return;
						const formData = new FormData();
						formData.append('file', file);
						const btn = target.parentElement as HTMLElement;
						btn.classList.add('opacity-50');
						try {
							const res = await fetch('/api/icons', { method: 'POST', body: formData });
							const data = await res.json();
							if (data.url) category.icon = data.url;
						} catch (err) {
							console.error(err);
						} finally {
							btn.classList.remove('opacity-50');
						}
					}}
				/>
			</label>
		</div>

		<div class="md:col-span-12 flex justify-end items-center gap-2 mt-2">
			{#if onDelete}
				<ConfirmDeleteButton onConfirm={onDelete} />
			{/if}
			<SaveButton type="submit" isLoading={isSaving} class="shadow-sm shrink-0" text="" title="SALVA" />
		</div>
	</div>
</form>
