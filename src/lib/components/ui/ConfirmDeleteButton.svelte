<script lang="ts">
    import { Trash2, Check, X } from "@lucide/svelte";
    
    let {
        onConfirm,
        class: className = 'w-10 h-10'
    } = $props<{
        onConfirm: () => void;
        class?: string;
    }>();
    
    let showConfirm = $state(false);
</script>

{#if showConfirm}
    <div class="flex flex-1 min-w-max items-center justify-between gap-2 bg-transparent border border-red-600/30 dark:border-red-500/30 rounded-md px-2 h-10 shadow-sm {className.replace(/w-\d+\s*|h-\d+\s*/g, '')}">
        <span class="text-sm font-bold uppercase tracking-wider text-red-600 dark:text-red-500 mx-1">SICURO?</span>
        <div class="flex gap-2 shrink-0">
            <button type="button" class="flex items-center justify-center w-8 h-8 rounded shadow-md shadow-red-500/30 transition-transform hover:scale-110 bg-red-600 hover:bg-red-700 text-white" onclick={() => { showConfirm = false; onConfirm(); }} title="Conferma">
                <Check class="w-5 h-5" strokeWidth={3} />
            </button>
            <button type="button" class="flex items-center justify-center w-8 h-8 rounded shadow-md border border-input transition-transform hover:scale-110 bg-card hover:bg-muted text-muted-foreground" onclick={() => (showConfirm = false)} title="Annulla">
                <X class="w-5 h-5" strokeWidth={2.5} />
            </button>
        </div>
    </div>
{:else}
    <button 
        type="button" 
        onclick={() => (showConfirm = true)} 
        class="flex items-center justify-center rounded-lg shadow-sm transition-transform hover:scale-105 bg-red-600 hover:bg-red-700 text-white shadow-red-500/30 shrink-0 {className}" 
        title="Elimina"
    >
        <Trash2 class="w-5 h-5" strokeWidth={2} />
    </button>
{/if}
