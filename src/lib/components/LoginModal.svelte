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
			const res = await fetch('/api/auth', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ action: 'login', password })
			});

			if (res.ok) {
				password = '';
				onSuccess();
			} else {
				error = 'Password errata';
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
			<div class="relative w-full">
				<input 
					type={showPassword ? "text" : "password"} 
					bind:value={password} 
					placeholder="Password" 
					class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 pr-10"
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
			
			{#if error}
				<p class="text-sm text-destructive">{error}</p>
			{/if}
		</form>
	{/snippet}
	{#snippet footer()}
		<div class="flex justify-end space-x-3 w-full mt-4">
			<button 
				type="button" 
				onclick={onClose}
				class="px-4 py-2 text-sm font-medium text-foreground hover:bg-muted rounded-lg transition-colors border border-border"
			>
				Annulla
			</button>
			<button 
				type="submit" 
				form="login-form"
				disabled={loading}
				class="px-4 py-2 text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 rounded-lg shadow-sm transition-colors disabled:opacity-50"
			>
				{loading ? 'Sblocco...' : 'Sblocca'}
			</button>
		</div>
	{/snippet}
</BaseModal>

