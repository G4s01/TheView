<script lang="ts">
    import { Trash, Check } from "@lucide/svelte";
    import { Button } from "$lib/components/ui/button";
    import { cn } from "$lib/utils";
    
    let {
        onConfirm,
        class: className = ''
    } = $props<{
        onConfirm: () => void;
        class?: string;
    }>();
    
    let showConfirm = $state(false);
</script>

{#if showConfirm}
    <div class="flex items-center gap-1 shrink-0">
        <Button 
            variant="destructive" 
            size="icon" 
            class={cn("shrink-0", className)}
            onclick={() => { showConfirm = false; onConfirm(); }} 
            title="CONFERMA"
        >
            <Check />
        </Button>
        <Button 
            variant="outline" 
            class={cn("shrink-0", className)}
            onclick={() => (showConfirm = false)} 
        >
            ANNULLA
        </Button>
    </div>
{:else}
    <Button 
        variant="destructive" 
        size="icon" 
        onclick={() => (showConfirm = true)} 
        class={cn("shrink-0", className)} 
        title="Elimina"
    >
        <Trash />
    </Button>
{/if}
