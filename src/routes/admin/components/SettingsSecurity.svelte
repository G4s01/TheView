<script lang="ts">
	import TextInput from '$lib/components/ui/TextInput.svelte';
	import SettingsHeader from '$lib/components/ui/SettingsHeader.svelte';
	import SaveButton from '$lib/components/ui/SaveButton.svelte';
	import BackButton from '$lib/components/ui/BackButton.svelte';
	import { slide } from "svelte/transition";
	import * as Card from "$lib/components/ui/card";
	import { Eye, EyeOff, Check, Undo2, ExternalLink, Copy, ShieldCheck } from "@lucide/svelte";
	import { Button } from "$lib/components/ui/button";
	import { Switch } from "$lib/components/ui/switch";
	import { clickOutside } from '$lib/actions/clickOutside';
	import * as AlertDialog from "$lib/components/ui/alert-dialog";
	import { page } from '$app/stores';

	let { showAlert } = $props<{
		showAlert: (title: string, message: string) => void;
	}>();

	let showConfirmDialog = $state(false);

	let isChangingAdminPassword = $state(false);
	let adminPassword = $state('');
	let adminPasswordConfirm = $state('');
	let showAdminPassword = $state(false);
	let showAdminPasswordConfirm = $state(false);

	let isChangingAdminPasswordStep = $state(1);
	let changePasswordOtpCode = $state('');

	let totpEnabled = $state($page.data.settings?.totp_enabled === true || $page.data.settings?.totp_enabled === 'true');
	
	let setupSecret = $state('');
	let setupQrCode = $state('');
	let setupOtpCode = $state('');
	
	let disable2FAOtpCode = $state('');
	let isDisabling2FA = $state(false);

	let isSaving2FA = $state(false);

	function preSavePassword() {
		if (!adminPassword) return showAlert("ATTENZIONE", "INSERIRE PASSWORD!");
		if (adminPassword !== adminPasswordConfirm) return showAlert("ATTENZIONE", "PASSWORD DIVERSE!");
		
		if (totpEnabled && isChangingAdminPasswordStep === 1) {
			isChangingAdminPasswordStep = 2;
			return;
		}
		
		showConfirmDialog = true;
	}

	async function savePassword() {
		try {
			const payload: any = { adminPassword };
			if (totpEnabled && changePasswordOtpCode) {
				payload.otpCode = changePasswordOtpCode;
			}
			const res = await fetch('/api/settings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
			if (!res.ok) {
				const data = await res.json();
				showAlert("ERRORE", data.error || "Impossibile cambiare password");
				return;
			}
			adminPassword = '';
			adminPasswordConfirm = '';
			changePasswordOtpCode = '';
			isChangingAdminPassword = false;
			isChangingAdminPasswordStep = 1;
			showConfirmDialog = false;
			showAlert("SUCCESSO", "PASSWORD MODIFICATA!");
		} catch(e) { 
			showAlert("ERRORE", "IMPEDIMENTO DURANTE IL CAMBIO PASSWORD"); 
		}
	}

	async function confirm2FAToggle() {
		isSaving2FA = true;
		// Avvia Setup 2FA (poiché disattivare ha una sua logica separata)
		const res = await fetch('/api/auth/2fa/setup');
		if (res.ok) {
			const data = await res.json();
			setupSecret = data.secret;
			setupQrCode = data.qrcode;
			totpEnabled = true; 
		} else {
			showAlert("ERRORE", "Impossibile avviare setup 2FA");
		}
		isSaving2FA = false;
	}

	async function disable2FA() {
		isSaving2FA = true;
		const res = await fetch('/api/settings', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ totp_enabled: false, totp_secret: null, otpCode: disable2FAOtpCode })
		});
		if (res.ok) {
			totpEnabled = false;
			isDisabling2FA = false;
			disable2FAOtpCode = '';
			showAlert("SUCCESSO", "2FA DISABILITATA");
		} else {
			const data = await res.json();
			showAlert("ERRORE", data.error || "Impossibile disabilitare 2FA");
		}
		isSaving2FA = false;
	}

	async function verifyAndEnable2FA() {
		isSaving2FA = true;
		try {
			const res = await fetch('/api/auth/2fa/verify', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ action: 'setup', code: setupOtpCode, secret: setupSecret })
			});
			const data = await res.json();
			if (res.ok && data.success) {
				showAlert("SUCCESSO", "2FA ABILITATA CON SUCCESSO");
				setupSecret = '';
				setupQrCode = '';
				setupOtpCode = '';
				import('$app/navigation').then(m => m.invalidateAll());
			} else {
				showAlert("ERRORE", data.error || "Codice non valido");
			}
		} catch(e) {
			showAlert("ERRORE", "Errore di connessione");
		}
		isSaving2FA = false;
	}
	function openQrCode() {
		const win = window.open("", "_blank");
		if (win) {
			win.document.write(`<html><body style="margin:0;display:flex;justify-content:center;align-items:center;height:100vh;background:#fff;"><img src="${setupQrCode}" style="max-width:100%;max-height:100%;" /></body></html>`);
			win.document.close();
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
	<Card.Content class="p-6 space-y-10">
		
		<!-- Sezione 2FA -->
		<div class="space-y-3">
			<h4 class="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">AUTENTICAZIONE A DUE FATTORI</h4>
			<div class="flex flex-col p-4 border border-border rounded-xl bg-background shadow-sm transition-all">
				<div class="flex items-center justify-between gap-4">
					
					<div class="flex flex-col flex-1 min-w-0 justify-center">
						<div class="flex items-center gap-2 text-foreground">
							<ShieldCheck class="w-5 h-5 text-primary" />
							<h4 class="text-sm font-bold uppercase tracking-wider truncate">2FA</h4>
						</div>
						<p class="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mt-1 leading-snug">AUTENTICAZIONE A DUE FATTORI</p>
					</div>

					{#if !setupSecret && !isDisabling2FA}
						<div class="flex items-center gap-3 px-3 py-1.5 border border-border rounded-lg bg-card/50 shrink-0">
							<span class="text-[11px] font-black uppercase tracking-wider w-6 text-center transition-colors {totpEnabled ? 'text-primary [text-shadow:0_0_8px_var(--color-primary)]' : 'text-muted-foreground'}">
								{totpEnabled ? 'ON' : 'OFF'}
							</span>
							<Switch checked={totpEnabled} onCheckedChange={(v) => {
								if (!totpEnabled) {
									confirm2FAToggle();
								} else {
									isDisabling2FA = true;
								}
							}} />
						</div>
					{/if}
				</div>

				{#if isDisabling2FA}
					<div transition:slide class="mt-6 pt-6 border-t border-border flex flex-col items-center gap-6">
						<div class="bg-destructive/10 p-3 rounded-lg border border-destructive/20 w-full mb-2">
							<p class="text-xs font-bold text-center text-destructive uppercase">DISATTIVA 2FA</p>
							<p class="text-xs text-center mt-1 text-foreground">INSEIRSCI IL CODICE OTP PER VALIDARE L'OPERAZIONE</p>
						</div>
						<div class="grid grid-cols-[1fr_auto_auto] gap-2 w-full max-w-[320px] items-end">
							<div class="h-10 w-full">
								<TextInput 
									label="CODICE OTP" 
									type="text" 
									bind:value={disable2FAOtpCode} 
									autofocus={true}
									onkeydown={(e) => {
										if (e.key === 'Enter' && disable2FAOtpCode.length >= 6 && !isSaving2FA) disable2FA();
									}}
									class="font-mono tracking-widest" 
								/>
							</div>
							<BackButton 
								onclick={() => {
									isDisabling2FA = false;
									disable2FAOtpCode = '';
								}}
								class="shrink-0 h-10 w-10"
								text=""
								title="ANNULLA"
							/>
							<SaveButton 
								onclick={disable2FA} 
								isLoading={isSaving2FA}
								disabled={disable2FAOtpCode.length < 6}
								class="shrink-0 h-10 w-10 bg-destructive text-destructive-foreground hover:bg-destructive/90" 
								text=""
								title="DISATTIVA"
							>
								<Check class="h-4 w-4" strokeWidth={2} />
							</SaveButton>
						</div>
					</div>
				{/if}

				{#if setupSecret}
					<div transition:slide class="mt-6 pt-6 border-t border-border flex flex-col items-center gap-6">
						<div class="bg-destructive/10 p-3 rounded-lg border border-destructive/20 w-full">
							<p class="text-xs font-bold text-center text-destructive uppercase">ACCOPPIA L'AUTENTICATORE</p>
							<p class="text-xs text-center mt-1 text-foreground">INQUADRA</p>
						</div>
						
						<div class="relative size-40 bg-card border border-border rounded-xl flex items-center justify-center p-2 shadow-sm">
							<img src={setupQrCode} alt="TOTP QR Code" class="w-full h-full object-contain rounded-lg" />
							<Button 
								variant="outline" 
								size="icon" 
								class="absolute -bottom-3 -right-3 h-8 w-8 rounded-full shadow-md bg-background"
								onclick={openQrCode}
								title="Apri QR in una nuova scheda"
							>
								<ExternalLink class="size-4" />
							</Button>
						</div>

						<div class="flex flex-col items-center gap-2 w-full max-w-70">
							<span class="text-[10px] uppercase text-muted-foreground font-bold tracking-widest text-center">O COPIA IL SECRET</span>
							<div class="flex items-center gap-2 bg-muted/50 pl-4 pr-1 py-1 rounded-full border border-border w-full shadow-sm">
								<span class="text-xs font-mono tracking-wider font-semibold select-all flex-1 text-center truncate">
									{setupSecret}
								</span>
								<Button 
									variant="ghost" 
									size="icon" 
									class="h-7 w-7 rounded-full hover:bg-muted shrink-0 text-muted-foreground" 
									onclick={() => navigator.clipboard.writeText(setupSecret)}
									title="Copia Secret"
								>
									<Copy class="size-3.5" />
								</Button>
							</div>
						</div>

						<div class="grid grid-cols-[1fr_auto_auto] gap-2 w-full max-w-[320px] mt-2 items-end">
							<div class="h-10 w-full">
								<TextInput 
									label="CODICE OTP" 
									type="text" 
									bind:value={setupOtpCode} 
									autofocus={true}
									onkeydown={(e) => {
										if (e.key === 'Enter' && setupOtpCode.length >= 6 && !isSaving2FA) verifyAndEnable2FA();
									}}
									class="font-mono tracking-widest" 
								/>
							</div>
							<BackButton 
								onclick={() => {
									setupSecret = '';
									setupQrCode = '';
									setupOtpCode = '';
									totpEnabled = false;
								}}
								class="shrink-0 h-10 w-10"
								text=""
								title="ANNULLA"
							/>
							<SaveButton 
								onclick={verifyAndEnable2FA} 
								isLoading={isSaving2FA}
								disabled={setupOtpCode.length < 6}
								class="shrink-0 h-10 w-10 bg-primary text-primary-foreground hover:bg-primary/90" 
								text=""
								title="CONFERMA"
							>
								<Check class="h-4 w-4" strokeWidth={2} />
							</SaveButton>
						</div>
					</div>
				{/if}
			</div>
		</div>

		<!-- Sezione Password -->
		<div class="space-y-3">
			<h4 class="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">PASSWORD DI AMMINISTRAZIONE</h4>
			<div class="p-5 border border-border rounded-xl bg-card/50 space-y-6">
				{#if !isChangingAdminPassword}
					<div class="flex flex-col gap-4">
						<div>
							<p class="text-sm font-bold uppercase tracking-wider">MODIFICA PASSWORD</p>
							<p class="text-xs text-muted-foreground mb-4">CREDENZIALI D'ACCESSO PRIVILEGIATO A THEVIEW</p>
						</div>
						<Button 
							type="button"
							variant="secondary"
							id="edit-security-btn"
							onclick={() => isChangingAdminPassword = true}
							class="px-8 py-2.5 h-auto text-sm font-bold uppercase tracking-wider rounded-xl transition-colors border border-border w-fit edit-security-btn"
						>
							CAMBIA PASSWORD
						</Button>
					</div>
				{:else}
					{#if isChangingAdminPasswordStep === 1}
						<div transition:slide class="grid grid-cols-[1fr_auto] gap-4 items-end w-full" use:clickOutside={{ enabled: isChangingAdminPassword, handler: () => { isChangingAdminPassword = false; isChangingAdminPasswordStep = 1; adminPassword = ''; adminPasswordConfirm = ''; }, ignore: '#edit-security-btn' }}>
							<div class="w-full">
								<TextInput 
									label="NUOVA PASSWORD" 
									type={showAdminPassword ? "text" : "password"} 
									bind:value={adminPassword} 
									onkeydown={(e) => {
										if (e.key === 'Enter') preSavePassword();
									}}
									class="pr-10"
								>
									<button type="button" tabindex="-1" onclick={() => showAdminPassword = !showAdminPassword} class="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground">
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
								<TextInput 
									label="CONFERMA PASSWORD" 
									type={showAdminPasswordConfirm ? "text" : "password"} 
									bind:value={adminPasswordConfirm} 
									onkeydown={(e) => {
										if (e.key === 'Enter') preSavePassword();
									}}
									class="pr-10"
								>
									<button type="button" tabindex="-1" onclick={() => showAdminPasswordConfirm = !showAdminPasswordConfirm} class="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground">
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
					{:else if isChangingAdminPasswordStep === 2}
						<div transition:slide class="flex flex-col items-center gap-6 w-full mt-4" use:clickOutside={{ enabled: isChangingAdminPassword, handler: () => { isChangingAdminPassword = false; isChangingAdminPasswordStep = 1; adminPassword = ''; adminPasswordConfirm = ''; changePasswordOtpCode = ''; }, ignore: '#edit-security-btn' }}>
							<div class="bg-primary/10 p-3 rounded-lg border border-primary/20 w-full mb-2">
								<p class="text-xs font-bold text-center text-primary uppercase">CONFERMA CON 2FA</p>
								<p class="text-xs text-center mt-1 text-foreground">INSERISCI L'OTP PER VALIDARE L'OPERAZIONE</p>
							</div>
							<div class="grid grid-cols-[1fr_auto_auto] gap-2 w-full max-w-[320px] items-end">
								<div class="h-10 w-full">
									<TextInput 
										label="CODICE OTP" 
										type="text" 
										bind:value={changePasswordOtpCode} 
										autofocus={true}
										onkeydown={(e) => {
											if (e.key === 'Enter' && changePasswordOtpCode.length >= 6) savePassword();
										}}
										class="font-mono tracking-widest" 
									/>
								</div>
								<BackButton 
									onclick={() => {
										isChangingAdminPasswordStep = 1;
										changePasswordOtpCode = '';
									}}
									class="shrink-0 h-10 w-10"
									text=""
									title="INDIETRO"
								/>
								<SaveButton 
									onclick={preSavePassword} 
									disabled={changePasswordOtpCode.length < 6}
									class="shrink-0 h-10 w-10 bg-primary text-primary-foreground hover:bg-primary/90" 
									text=""
									title="CONFERMA"
								>
									<Check class="h-4 w-4" strokeWidth={2} />
								</SaveButton>
							</div>
						</div>
					{/if}
				{/if}
			</div>
		</div>
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

