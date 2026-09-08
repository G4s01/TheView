<script lang="ts">
	import TextInput from '$lib/components/ui/TextInput.svelte';
	import SettingsHeader from '$lib/components/ui/SettingsHeader.svelte';
	import SaveButton from '$lib/components/ui/SaveButton.svelte';
	import BackButton from '$lib/components/ui/BackButton.svelte';
	import { slide } from "svelte/transition";
	import * as Card from "$lib/components/ui/card";
	import { Eye, EyeOff, X } from "@lucide/svelte";
	import { Button } from "$lib/components/ui/button";
	import { clickOutside } from '$lib/actions/clickOutside';
	import * as AlertDialog from "$lib/components/ui/alert-dialog";

	let { showAlert } = $props<{
		showAlert: (title: string, message: string) => void;
	}>();

	let showConfirmDialog = $state(false);

	let isChangingAdminPassword = $state(false);
	let adminPassword = $state('');
	let adminPasswordConfirm = $state('');
	let showAdminPassword = $state(false);
	let showAdminPasswordConfirm = $state(false);

	function preSavePassword() {
		if (!adminPassword) return showAlert("ATTENZIONE", "INSERIRE PASSWORD!");
		if (adminPassword !== adminPasswordConfirm) return showAlert("ATTENZIONE", "PASSWORD DIVERSE!");
		showConfirmDialog = true;
	}

	async function savePassword() {
		try {
			await fetch('/api/settings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ adminPassword }) });
			adminPassword = '';
			adminPasswordConfirm = '';
			isChangingAdminPassword = false;
			showConfirmDialog = false;
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
					id="edit-security-btn"
					onclick={() => isChangingAdminPassword = true}
					class="px-8 py-2.5 h-auto text-sm font-bold uppercase tracking-wider rounded-xl transition-colors border border-border min-w-60 edit-security-btn"
				>
					CAMBIA PASSWORD
				</Button>
			</div>
		{:else}
			<div transition:slide class="grid grid-cols-[1fr_auto] gap-4 items-end w-full" use:clickOutside={{ enabled: isChangingAdminPassword, handler: () => { isChangingAdminPassword = false; adminPassword = ''; adminPasswordConfirm = ''; }, ignore: '#edit-security-btn' }}>
				<div class="w-full">
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
				<BackButton 
					onclick={() => {
						isChangingAdminPassword = false;
						adminPassword = '';
						adminPasswordConfirm = '';
					}}
					class="shrink-0"
					text=""
					title="ANNULLA"
				/>

				<div class="w-full">
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
				<SaveButton
					onclick={preSavePassword}
					class="shrink-0"
					text=""
					title="SALVA"
				/>
			</div>
		{/if}
	</Card.Content>
</Card.Root>

<AlertDialog.Root bind:open={showConfirmDialog}>
	<AlertDialog.Content>
		<AlertDialog.Header>
			<AlertDialog.Title>CAMBIO PASSWORD D'AMMINISTRAZIONE</AlertDialog.Title>
			<AlertDialog.Description>
				SEI SICURO?
			</AlertDialog.Description>
		</AlertDialog.Header>
		<AlertDialog.Footer>
			<AlertDialog.Cancel>ANNULLA</AlertDialog.Cancel>
			<AlertDialog.Action onclick={savePassword}>CONFERMA</AlertDialog.Action>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>

