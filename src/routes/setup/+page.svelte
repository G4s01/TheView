<script lang="ts">
	import { Eye, EyeOff } from "@lucide/svelte";
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
            <EyeOff class="h-5 w-5" strokeWidth={1.5} />
          {:else}
            <Eye class="h-5 w-5" strokeWidth={1.5} />
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
            <EyeOff class="h-5 w-5" strokeWidth={1.5} />
          {:else}
            <Eye class="h-5 w-5" strokeWidth={1.5} />
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
