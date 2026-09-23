<script lang="ts">
	import TextInput from '$lib/components/ui/TextInput.svelte';
	import UrlInput from '$lib/components/ui/UrlInput.svelte';
	import SaveButton from '$lib/components/ui/SaveButton.svelte';
	import BackButton from '$lib/components/ui/BackButton.svelte';
	import ServiceIcon from '$lib/components/ui/ServiceIcon.svelte';
	import ModifyButton from '$lib/components/ui/ModifyButton.svelte';
	import { Switch } from "$lib/components/ui/switch";
	import { slide } from 'svelte/transition';
	import { Eye, EyeOff, CircleAlert } from "@lucide/svelte";
	import { clickOutside } from '$lib/actions/clickOutside';

	let {
		npmEnabled = $bindable(false),
		npmUrlCombined = $bindable(),
		npmEmail = $bindable(),
		npmPassword = $bindable(),
		isNpmEditing = $bindable(),
		showNpmPassword = $bindable(),
		onSave,
		npmError = null,
		isDiscovering = false
	} = $props<{
		npmEnabled: boolean;
		npmUrlCombined: string;
		npmEmail: string;
		npmPassword: string;
		isNpmEditing: boolean;
		showNpmPassword: boolean;
		onSave: () => Promise<void>;
		npmError: string | null;
		isDiscovering: boolean;
	}>();

	let originalUrl = $state(npmUrlCombined);
	let originalEmail = $state(npmEmail);
	let originalPassword = $state(npmPassword);

	$effect(() => {
		if (!isNpmEditing) {
			originalUrl = npmUrlCombined;
			originalEmail = npmEmail;
			originalPassword = npmPassword;
		}
	});

	function handleCancel() {
		npmUrlCombined = originalUrl;
		npmEmail = originalEmail;
		npmPassword = originalPassword;
		isNpmEditing = false;
		showNpmPassword = false;
	}

	async function toggleNpmEnabled(v: boolean) {
		npmEnabled = v;
		if (v && (!npmUrlCombined || !npmEmail || !npmPassword)) {
			isNpmEditing = true;
		}
		// Save setting right away
		await fetch('/api/settings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ npmUrl: npmUrlCombined, npmEmail, npmPassword, npm_enabled: npmEnabled }) });
		if (v && npmUrlCombined && npmEmail && npmPassword && !isNpmEditing) {
			if (onSave) await onSave();
		}
	}
</script>

<div class="bg-card text-card-foreground rounded-2xl shadow-lg border border-border">
	<div class="p-6">
		<div class="flex flex-col sm:flex-row sm:items-center gap-3">
			<div class="flex items-center gap-3 flex-1">
				<div class="relative">
					<ServiceIcon icon="nginx-proxy-manager" name="NPM" size="lg" iconStyle="rounded-xl" />
					{#if npmEnabled && !npmError && !isDiscovering && npmUrlCombined && npmEmail}
						<!-- Pallino verde lampeggiante -->
						<span class="absolute -top-1 -left-1 flex h-3 w-3">
							<span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
							<span class="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
						</span>
					{/if}
				</div>
				<div>
					<h3 class="text-xl font-bold uppercase tracking-wider text-foreground">NGINX PROXY MANAGER</h3>
					<p class="text-sm text-muted-foreground">COLLEGA E SCOVA I SERVIZI ESPOSTI</p>
				</div>
			</div>
			
			<div class="flex items-center gap-3 mt-4 sm:mt-0">
				{#if npmEnabled && npmError}
					<CircleAlert class="text-destructive size-5" title="Errore di autenticazione: {npmError}" />
				{/if}
				<ModifyButton onclick={() => { isNpmEditing = !isNpmEditing; showNpmPassword = false; }} id="edit-npm-btn" />
				<div class="flex items-center ml-2 border-l border-border pl-4">
					<Switch checked={npmEnabled} onCheckedChange={toggleNpmEnabled} title="Abilita/Disabilita NPM" />
				</div>
			</div>
		</div>

		{#if isNpmEditing}
			<div class="flex flex-col gap-4 pt-6 w-full" transition:slide use:clickOutside={{ enabled: isNpmEditing, handler: handleCancel, ignore: '#edit-npm-btn' }}>
				<!-- Riga 1: Email e Password -->
				<div class="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
					<div class="md:col-span-6 h-10">
						<TextInput label="EMAIL" type="email" bind:value={npmEmail} />
					</div>
					<div class="md:col-span-6 h-10">
						<TextInput label="PASSWORD" type={showNpmPassword ? "text" : "password"} bind:value={npmPassword} class="pr-10">
							<button type="button" onclick={() => showNpmPassword = !showNpmPassword} class="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground">
								{#if showNpmPassword}
									<EyeOff class="h-5 w-5" strokeWidth={1.5} />
								{:else}
									<Eye class="h-5 w-5" strokeWidth={1.5} />
								{/if}
							</button>
						</TextInput>
					</div>
				</div>
				
				<!-- Riga 2: URL, Annulla e Salva -->
				<div class="grid grid-cols-1 md:grid-cols-12 gap-4 items-center w-full">
					<div class="md:col-span-12 flex gap-2 w-full items-end">
						<div class="flex-1 min-w-0">
							<UrlInput label="INDIRIZZO NPM (es. 192.168.1.100:81)" bind:value={npmUrlCombined} />
						</div>
						{#if originalUrl && originalEmail}
							<BackButton 
								onclick={handleCancel}
								class="shrink-0"
								text=""
								title="ANNULLA"
							/>
						{/if}
						<SaveButton 
							class="shrink-0"
							onclick={async () => {
								await fetch('/api/settings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ npmUrl: npmUrlCombined, npmEmail, npmPassword, npm_enabled: npmEnabled }) });
								isNpmEditing = false;
								showNpmPassword = false;
								if (onSave) await onSave();
							}}
							title="SALVA"
						/>
					</div>
				</div>
			</div>
		{/if}
	</div>
</div>
