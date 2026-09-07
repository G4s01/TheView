<script lang="ts">
	import TextInput from '$lib/components/ui/TextInput.svelte';
	import SettingsHeader from '$lib/components/ui/SettingsHeader.svelte';
	import SaveButton from '$lib/components/ui/SaveButton.svelte';
	import BackButton from '$lib/components/ui/BackButton.svelte';
	import { slide } from "svelte/transition";
	import * as Card from "$lib/components/ui/card";
	import { Eye, EyeOff, X } from "@lucide/svelte";
	import { Button } from "$lib/components/ui/button";

	let { showAlert } = $props<{
		showAlert: (title: string, message: string) => void;
	}>();

	let isChangingAdminPassword = $state(false);
	let adminPassword = $state('');
	let adminPasswordConfirm = $state('');
	let showAdminPassword = $state(false);
	let showAdminPasswordConfirm = $state(false);

	async function savePassword() {
		if (!adminPassword) return showAlert("ATTENZIONE", "INSERIRE PASSWORD!");
		if (adminPassword !== adminPasswordConfirm) return showAlert("ATTENZIONE", "PASSWORD DIVERSE!");
		try {
			await fetch('/api/settings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ adminPassword }) });
			adminPassword = '';
			adminPasswordConfirm = '';
			isChangingAdminPassword = false;
			showAlert("SUCCESSO", "PASSWORD MODIFICATA!");
		} catch(e) { 
			showAlert("ERRORE", "IMPEDIMENTO DURANTE IL CAMBIO PASSWORD"); 
		}
	}
</script>

<Card.Root class="h-full flex flex-col">
	<SettingsHeader 
		title="SICUREZZA" 
		description="THEVIEW TRA I SINONIMI"
	>
		{#snippet icon()}
			<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
		{/snippet}
	</SettingsHeader>
	<Card.Content class="p-6">
		{#if !isChangingAdminPassword}
			<div class="flex items-center justify-start">
				<Button 
					type="button"
					variant="secondary"
					onclick={() => isChangingAdminPassword = true}
					class="px-8 py-2.5 h-auto text-sm font-bold uppercase tracking-wider rounded-xl transition-colors border border-border min-w-[240px]"
				>
					CAMBIA PASSWORD
				</Button>
			</div>
		{:else}
			<div transition:slide class="grid grid-cols-1 md:grid-cols-12 gap-4 items-center w-full">
				<div class="col-span-1 md:col-span-12 xl:col-span-6 flex gap-2 w-full items-end">
					<div class="flex-1">
						<TextInput label="NUOVA PASSWORD" type={showAdminPassword ? "text" : "password"} bind:value={adminPassword} class="pr-10">
							<button type="button" onclick={() => showAdminPassword = !showAdminPassword} class="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground">
								{#if showAdminPassword}
									<EyeOff class="h-5 w-5" strokeWidth={1.5} />
								{:else}
									<Eye class="h-5 w-5" strokeWidth={1.5} />
								{/if}
							</button>
						</TextInput>
					</div>
					<SaveButton
						onclick={savePassword}
						class="w-10 h-10 p-0 shrink-0"
						text=""
						title="SALVA"
					/>
				</div>
				<div class="col-span-1 md:col-span-12 xl:col-span-6 flex gap-2 w-full items-end">
					<div class="flex-1">
						<TextInput label="CONFERMA PASSWORD" type={showAdminPasswordConfirm ? "text" : "password"} bind:value={adminPasswordConfirm} class="pr-10">
							<button type="button" onclick={() => showAdminPasswordConfirm = !showAdminPasswordConfirm} class="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground">
								{#if showAdminPasswordConfirm}
									<EyeOff class="h-5 w-5" strokeWidth={1.5} />
								{:else}
									<Eye class="h-5 w-5" strokeWidth={1.5} />
								{/if}
							</button>
						</TextInput>
					</div>
					<BackButton 
						onclick={() => {
							isChangingAdminPassword = false;
							adminPassword = '';
							adminPasswordConfirm = '';
						}}
						class="w-10 h-10 p-0 shrink-0"
						text=""
						title="ANNULLA"
					/>
				</div>
			</div>
		{/if}
	</Card.Content>
</Card.Root>

