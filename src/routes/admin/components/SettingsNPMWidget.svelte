<script lang="ts">
	import TextInput from '$lib/components/ui/TextInput.svelte';
	import UrlInput from '$lib/components/ui/UrlInput.svelte';
	import SaveButton from '$lib/components/ui/SaveButton.svelte';
	import BackButton from '$lib/components/ui/BackButton.svelte';
	import ServiceIcon from '$lib/components/ui/ServiceIcon.svelte';
	import ConfirmDeleteButton from '$lib/components/ui/ConfirmDeleteButton.svelte';
	import { slide } from 'svelte/transition';
	import { Eye, EyeOff } from "@lucide/svelte";

	let {
		npmUrlCombined = $bindable(),
		npmEmail = $bindable(),
		npmPassword = $bindable(),
		isNpmEditing = $bindable(),
		showNpmPassword = $bindable(),
		onDisconnect
	} = $props<{
		npmUrlCombined: string;
		npmEmail: string;
		npmPassword: string;
		isNpmEditing: boolean;
		showNpmPassword: boolean;
		onDisconnect: () => void;
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
</script>

<div class="bg-card text-card-foreground rounded-2xl shadow-lg border border-border">
	<div class="p-6">
		<div class="flex items-center space-x-3 mb-6">
			<ServiceIcon icon="nginx-proxy-manager" name="NPM" size="lg" iconStyle="rounded-xl" />
			<div>
				<h3 class="text-xl font-bold uppercase tracking-wider text-foreground">NGINX PROXY MANAGER</h3>
				<p class="text-sm text-muted-foreground">COLLEGA E SCOVA I SERVIZI ESPOSTI</p>
			</div>
			<div class="flex-1"></div>
			{#if npmUrlCombined && npmEmail && npmPassword && !isNpmEditing}
				<span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-accent text-accent-foreground">
					<span class="w-2 h-2 rounded-full bg-accent-foreground mr-2"></span>
					CONFIGURATO
				</span>
			{:else}
				<span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-muted text-muted-foreground">
					DISATTIVO
				</span>
			{/if}
		</div>

		{#if isNpmEditing}
			<div class="space-y-4 pt-2 w-full" transition:slide>
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
								class="w-10 h-10 p-0 shrink-0"
								text=""
								title="ANNULLA"
							/>
						{/if}
						<SaveButton 
							class="w-10 h-10 p-0 shrink-0"
							onclick={async () => {
								await fetch('/api/settings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ npmUrl: npmUrlCombined, npmEmail, npmPassword }) });
								isNpmEditing = false;
								showNpmPassword = false;
							}}
							title="SALVA"
						/>
					</div>
				</div>
			</div>
		{:else}
			<div class="bg-muted text-muted-foreground rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between border border-border" transition:slide>
				<div class="flex items-center gap-3 mb-4 sm:mb-0">
					<div class="p-2 bg-accent/20 text-accent rounded-lg">
						<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
					</div>
					<div>
						<p class="text-sm font-medium text-foreground">CONNESSO A {npmUrlCombined}</p>
						<p class="text-xs text-muted-foreground">ACCOUNT: {npmEmail}</p>
					</div>
				</div>
				<div class="flex items-center space-x-3 w-full sm:w-auto justify-end">
					<ConfirmDeleteButton 
						class="w-9 h-9"
						onConfirm={onDisconnect}
					/>
					<button onclick={() => { isNpmEditing = true; showNpmPassword = false; }} class="px-4 py-2 bg-card border border-border text-foreground text-sm font-bold uppercase tracking-wider rounded-xl shadow-sm hover:bg-muted transition-colors">
						MODIFICA
					</button>
				</div>
			</div>
		{/if}
	</div>
</div>

