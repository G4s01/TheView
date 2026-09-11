<script lang="ts">
	import TextInput from "$lib/components/ui/TextInput.svelte";
	import UrlInput from "$lib/components/ui/UrlInput.svelte";
	import SelectInput from "$lib/components/ui/SelectInput.svelte";
	import ToggleInput from "$lib/components/ui/ToggleInput.svelte";
	import IconCombobox from "$lib/components/IconCombobox.svelte";
	import ConfirmDeleteButton from "$lib/components/ui/ConfirmDeleteButton.svelte";
	import BackButton from "$lib/components/ui/BackButton.svelte";
	import SaveButton from "$lib/components/ui/SaveButton.svelte";
	import { Upload, Check, Save, Plus } from "@lucide/svelte";
	import { enhance } from "$app/forms";
	import type { Action } from "svelte/action";
	import { Button } from "$lib/components/ui/button";
	import { WIDGET_SIZES } from "$lib/config/widgetConstraints";
	import { page } from "$app/stores";

	const ALL_SIZES = [
		{ value: "1x1", label: "1x1 (Singola)" },
		{ value: "2x1", label: "2x1 (Larga)" },
		{ value: "1x2", label: "1x2 (Verticale)" },
	];

	let {
		mode = "edit", // 'add', 'edit', 'discovery'
		service = $bindable({
			id: null,
			name: "",
			url: "",
			dockerImage: "",
			icon: "",
			description: "",
			categoryId: "",
			pingEnabled: true,
			widgetType: "none",
			size: "1x1",
		}),
		categories = $bindable([]),
		isSaving = false,
		action = undefined,
		useEnhance = false,
		enhanceFn = undefined,
		onCancel = undefined,
		onSubmit = undefined,
		onDelete = undefined,
		hideDelete = false,
		hideCancel = false,
		iconSlot = undefined,
	} = $props<{
		mode?: "add" | "edit" | "discovery";
		service?: any;
		categories?: any[];
		isSaving?: boolean;
		action?: string;
		useEnhance?: boolean;
		enhanceFn?: any;
		onCancel?: () => void;
		onSubmit?: (e: Event) => void;
		onDelete?: () => void;
		hideDelete?: boolean;
		hideCancel?: boolean;
		iconSlot?: import("svelte").Snippet;
	}>();

	let isCreatingCategory = $state(false);
	let newCategoryName = $state("");

	async function createCategory() {
		if (!newCategoryName) {
			isCreatingCategory = false;
			return;
		}
		try {
			const res = await fetch("/api/categories/create", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ name: newCategoryName }),
			});
			if (res.ok) {
				const data = await res.json();
				categories = [...categories, data.category];
				service.categoryId = data.category.id;
				isCreatingCategory = false;
				newCategoryName = "";
			} else {
				const data = await res.json();
				alert(
					data.error || "ERRORE DURANTE LA CREAZIONE DELLA CATEGORIA",
				);
			}
		} catch (e) {
			console.error(e);
		}
	}

	function handleCancel() {
		isCreatingCategory = false;
		if (onCancel) onCancel();
	}

	const optionalEnhance: Action<HTMLFormElement, any> = (node, options) => {
		if (useEnhance) {
			return enhance(node, (params) => {
				const form = params.formElement;
				form.classList.remove("show-errors");
				if (!form.checkValidity()) {
					params.cancel();
					void form.offsetWidth;
					form.classList.add("show-errors");
					return;
				}
				if (options) {
					const handler = options(params);
					if (handler) return handler;
				}
			});
		}
	};

	let allowedSizes = $derived(
		WIDGET_SIZES[service.widgetType || "none"] || WIDGET_SIZES.default,
	);
	let sizeOptions = $derived(
		ALL_SIZES.filter((s) => allowedSizes.includes(s.value)),
	);

	let enableCategories = $derived($page.data.settings?.enableCategories !== false);

	$effect(() => {
		if (service) {
			if (!service.widgetType) service.widgetType = "none";
			if (!service.size) service.size = "1x1";
			if (service.pingEnabled === undefined) service.pingEnabled = true;
			if (!enableCategories && service.categoryId !== -1) {
				service.categoryId = -1;
			}

			const valid =
				WIDGET_SIZES[service.widgetType] || WIDGET_SIZES.default;
			if (!valid.includes(service.size)) {
				service.size = valid[0];
			}
		}
	});
</script>

<form
	method={action ? "POST" : undefined}
	{action}
	use:optionalEnhance={enhanceFn}
	oninput={(e) => e.currentTarget.classList.remove("show-errors")}
	onchange={(e) => e.currentTarget.classList.remove("show-errors")}
	onsubmit={(e) => {
		const form = e.currentTarget;
		form.classList.remove("show-errors");

		if (isCreatingCategory && newCategoryName) {
			e.preventDefault();
			createCategory().then(async () => {
				if (!isCreatingCategory) {
					await import("svelte").then((m) => m.tick());
					form.requestSubmit();
				}
			});
			return;
		}

		if (!form.checkValidity()) {
			e.preventDefault();
			void form.offsetWidth;
			form.classList.add("show-errors");
			return;
		}
		if (onSubmit) {
			e.preventDefault();
			onSubmit(e);
		}
	}}
	class="w-full flex flex-col"
>
	{#if service.id}
		<input type="hidden" name="id" value={service.id} />
	{/if}
	<input type="hidden" name="categoryId" value={service.categoryId} />

	<div class="grid grid-cols-1 md:grid-cols-12 gap-4 items-center relative">
		{#if isSaving}
			<div
				class="absolute inset-0 z-50 bg-background/50 backdrop-blur-[2px] flex items-center justify-center rounded-xl transition-all"
			>
				<div
					class="flex items-center gap-3 bg-card p-4 rounded-xl shadow-lg border border-border"
				>
					<div
						class="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"
					></div>
					<span
						class="text-sm font-bold uppercase tracking-wider text-primary"
						>Salvataggio...</span
					>
				</div>
			</div>
		{/if}

		<!-- ROW 1 -->
		<div class="{enableCategories ? 'md:col-span-6' : 'md:col-span-12'} h-10">
			{#if iconSlot}
				<div class="flex items-center gap-4 h-full">
					<div class="shrink-0 hidden md:block">
						{@render iconSlot()}
					</div>
					<div class="flex-1 min-w-0 h-10">
						<TextInput
							label="NOME"
							name="name"
							bind:value={service.name}
							required
						/>
					</div>
				</div>
			{:else}
				<TextInput
					label="NOME"
					name="name"
					bind:value={service.name}
					required
				/>
			{/if}
		</div>
		{#if enableCategories}
			<div class="md:col-span-6 flex flex-col gap-2 h-10">
				{#if isCreatingCategory}
					<div class="flex gap-4 h-10">
						<div class="flex-1 min-w-0 h-10">
							<TextInput
								label="NUOVA CATEGORIA"
								bind:value={newCategoryName}
							/>
						</div>
						<SaveButton
							type="button"
							onclick={createCategory}
							class="shadow-sm shrink-0"
							text=""
							title="SALVA"
						/>
						<BackButton
							onclick={() => {
								isCreatingCategory = false;
								newCategoryName = "";
							}}
							text=""
							class="shadow-sm shrink-0"
							title="ANNULLA"
						/>
					</div>
				{:else}
					<SelectInput
						label="CATEGORIA"
						bind:value={service.categoryId}
						options={[
							...categories.map((c: any) => ({
								value: c.id,
								label: c.name,
							})),
							{
								value: -1,
								label: "CATEGORIA FANTASMA",
								class: "italic text-muted-foreground",
							},
							{
								value: "new_category_trigger",
								label: "[+ NUOVA]",
								class: "font-bold text-primary",
							},
						]}
						onchange={(val) => {
							if (val === "new_category_trigger") {
								isCreatingCategory = true;
								service.categoryId = "";
							}
						}}
					/>
				{/if}
			</div>
		{/if}

		<!-- ROW 2 -->
		<div class="md:col-span-6 h-10">
			<UrlInput
				label="URL"
				name="url"
				bind:value={service.url}
				required
			/>
		</div>
		<div class="md:col-span-6 flex gap-4 items-center h-10">
			<div class="flex-1 min-w-0 h-10">
				<IconCombobox name="icon" bind:value={service.icon} />
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
						formData.append("file", file);
						const btn = target.parentElement as HTMLElement;
						btn.classList.add("opacity-50");
						try {
							const res = await fetch("/api/icons", {
								method: "POST",
								body: formData,
							});
							const data = await res.json();
							if (data.url) service.icon = data.url;
						} catch (err) {
							console.error(err);
						} finally {
							btn.classList.remove("opacity-50");
						}
					}}
				/>
			</label>
		</div>

		<!-- ROW 3 -->
		<div class="md:col-span-8 h-10">
			<TextInput
				label="IMMAGINE DOCKER"
				name="dockerImage"
				bind:value={service.dockerImage}
			/>
		</div>
		<div class="md:col-span-4 h-10 w-full">
			<SelectInput
				label="WIDGET"
				name="widgetType"
				bind:value={service.widgetType}
				options={[
					{ value: "none", label: "NESSUNO" },
					{ value: "qbittorrent", label: "qBittorrent" },
					{ value: "adguard", label: "AdGuard Home" },
				]}
			/>
		</div>

		<div
			class="md:col-span-12 flex flex-col md:flex-row gap-4 h-auto md:h-10 w-full items-start md:items-center"
		>
			<div class="flex-1 w-full min-w-0 h-10">
				<TextInput
					label="DESCRIZIONE"
					name="description"
					bind:value={service.description}
				/>
			</div>
			<div
				class="flex justify-between items-center w-full md:w-auto shrink-0 h-10 gap-4"
			>
				<div class="flex items-center gap-2">
					<ToggleInput
						label="Ping"
						bind:checked={service.pingEnabled}
					/>
					{#if service.pingEnabled}
						<input type="hidden" name="pingEnabled" value="on" />
					{/if}
				</div>
				<div class="flex justify-end gap-2 shrink-0">
					{#if mode === "edit"}
						{#if !hideDelete}
							<ConfirmDeleteButton
								onConfirm={() => {
									if (onDelete) onDelete();
								}}
							/>
						{/if}
						{#if !hideCancel}
							<BackButton
								onclick={handleCancel}
								text=""
								class="shadow-sm shrink-0"
								title="ANNULLA"
							/>
						{/if}
						<SaveButton
							type="submit"
							isLoading={isSaving}
							class="shadow-sm shrink-0"
							text=""
							title="SALVA"
						/>
					{:else if mode === "discovery"}
						<BackButton
							onclick={handleCancel}
							text=""
							class="shadow-sm shrink-0"
							title="ANNULLA"
						/>
						<Button
							type="submit"
							disabled={isSaving}
							size="icon"
							class="bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm shrink-0"
							title="AGGIUNGI"
						>
							<Plus class="w-4 h-4" strokeWidth={2.5} />
						</Button>
					{:else if mode === "add"}
						<SaveButton
							type="submit"
							isLoading={isSaving}
							text=""
							class="bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm shrink-0"
							title="SALVA"
						/>
					{/if}
				</div>
			</div>
		</div>
	</div>
</form>
