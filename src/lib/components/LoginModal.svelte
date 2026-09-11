<script lang="ts">
	import { Eye, EyeOff } from "@lucide/svelte";
	import BaseModal from '$lib/components/ui/BaseModal.svelte';
	import TextInput from '$lib/components/ui/TextInput.svelte';

	let { show = $bindable(), onClose, onSuccess } = $props<{
		show: boolean;
		onClose: () => void;
		onSuccess: () => void;
	}>();

	let password = $state('');
	let otpCode = $state('');
	let require2FA = $state(false);
	let error = $state('');
	let loading = $state(false);
	let showPassword = $state(false);

	function autofocus(node: HTMLElement) {
		setTimeout(() => node.focus(), 10);
	}

	async function handleLogin(e: Event) {
		e.preventDefault();
		loading = true;
		error = '';

		try {
			if (!require2FA) {
				const res = await fetch('/api/auth', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ action: 'login', password })
				});
				const data = await res.json();

				if (res.ok) {
					if (data.require2FA) {
						require2FA = true;
						password = ''; // Sicurezza
					} else {
						password = '';
						onSuccess();
					}
				} else {
					error = 'Password errata';
				}
			} else {
				// Esegui verifica 2FA (che emetterà il cookie se corretta)
				const res = await fetch('/api/auth/2fa/verify', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ action: 'login', code: otpCode })
				});
				const data = await res.json();
				if (res.ok && data.success) {
					otpCode = '';
					require2FA = false;
					onSuccess();
				} else {
					error = data.error || 'Codice OTP errato';
				}
			}
		} catch (err) {
			error = 'Errore di rete';
		} finally {
			loading = false;
		}
	}
</script>

<BaseModal 
	bind:open={show} 
	title="Modalità Modifica" 
	description="Inserisci la password di amministrazione per abilitare le modifiche."
>
	{#snippet children()}
		<form id="login-form" onsubmit={handleLogin} class="space-y-4">
			{#if require2FA}
				<div class="flex flex-col items-center gap-3">
					<div class="bg-primary/10 p-3 rounded-full">
						<svg class="size-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
					</div>
					<p class="text-sm font-medium text-center">Inserisci il codice Google Authenticator</p>
					<input 
						type="text" 
						bind:value={otpCode} 
						placeholder="000000" 
						class="flex h-12 w-full text-center font-mono tracking-widest text-lg rounded-md border border-input bg-background px-3 py-2 ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
						required
						use:autofocus
					/>
				</div>
			{:else}
				<div class="relative w-full">
					<input 
						type={showPassword ? "text" : "password"} 
						bind:value={password} 
						placeholder="Password" 
						class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 pr-10"
						required
						use:autofocus
					/>
					<button type="button" onclick={() => showPassword = !showPassword} class="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground">
						{#if showPassword}
							<EyeOff class="h-5 w-5" strokeWidth={1.5} />
						{:else}
							<Eye class="h-5 w-5" strokeWidth={1.5} />
						{/if}
					</button>
				</div>
			{/if}
			
			{#if error}
				<p class="text-sm text-destructive font-medium text-center">{error}</p>
			{/if}
		</form>
	{/snippet}
	{#snippet footer()}
		<div class="flex justify-end space-x-3 w-full mt-4">
			<button 
				type="button" 
				onclick={() => {
					require2FA = false;
					onClose();
				}}
				class="px-4 py-2 text-sm font-medium text-foreground hover:bg-muted rounded-lg transition-colors border border-border"
			>
				Annulla
			</button>
			<button 
				type="submit" 
				form="login-form"
				disabled={loading || (require2FA && otpCode.length < 6)}
				class="px-4 py-2 text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 rounded-lg shadow-sm transition-colors disabled:opacity-50"
			>
				{loading ? 'Sblocco...' : (require2FA ? 'Verifica' : 'Sblocca')}
			</button>
		</div>
	{/snippet}
</BaseModal>

