<script lang="ts">
  import { goto } from '$app/navigation';
  import TextInput from '$lib/components/ui/TextInput.svelte';
  
  let password = $state('');
  let confirmPassword = $state('');
  let error = $state('');
  let loading = $state(false);
  let showPassword = $state(false);
  let showConfirmPassword = $state(false);

  async function handleSetup(e: Event) {
    e.preventDefault();
    if (password.length < 4) {
      error = "La password deve contenere almeno 4 caratteri";
      return;
    }
    if (password !== confirmPassword) {
      error = "Le password non coincidono";
      return;
    }

    loading = true;
    error = '';
    
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'setup', password })
      });
      
      if (res.ok) {
        // Redirige all'admin panel una volta salvato e loggato
        goto('/admin');
        window.location.reload(); // Per aggiornare i dati nel layout
      } else {
        const data = await res.json();
        error = data.error || 'Errore durante il salvataggio';
      }
    } catch (err) {
      error = 'Errore di rete';
    } finally {
      loading = false;
    }
  }
</script>

<div class="min-h-[60vh] flex items-center justify-center p-4">
  <div class="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-8 border border-gray-200 dark:border-gray-700">
    <div class="text-center mb-8">
      <img src="/favicon.svg" alt="TheView Logo" class="w-20 h-20 mx-auto mb-4 drop-shadow-md" />
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">Benvenuto in TheView! 🎉</h1>
      <p class="text-sm text-gray-500 dark:text-gray-400">Sembra che tu non abbia ancora configurato una password di amministratore. Inseriscine una sicura per proteggere la tua dashboard.</p>
    </div>
    
    <form onsubmit={handleSetup} class="space-y-6">
      <TextInput 
        label="Nuova Password Admin" 
        type={showPassword ? "text" : "password"} 
        bind:value={password} 
        required 
        class="pr-10"
      >
        <button type="button" onclick={() => showPassword = !showPassword} class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
          {#if showPassword}
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
          {:else}
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
          {/if}
        </button>
      </TextInput>
      
      <TextInput 
        label="Conferma Password" 
        type={showConfirmPassword ? "text" : "password"} 
        bind:value={confirmPassword} 
        required 
        class="pr-10"
      >
        <button type="button" onclick={() => showConfirmPassword = !showConfirmPassword} class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
          {#if showConfirmPassword}
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
          {:else}
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
          {/if}
        </button>
      </TextInput>

      {#if error}
        <p class="text-sm text-red-500 font-medium text-center">{error}</p>
      {/if}

      <button 
        type="submit" 
        disabled={loading}
        class="w-full py-3 px-4 text-sm font-bold uppercase tracking-wider text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md transition-colors disabled:opacity-50"
      >
        {loading ? 'Salvataggio...' : 'Salva e Inizia'}
      </button>
    </form>
  </div>
</div>
