<script lang="ts">
    import { Trash, Check, Undo2 } from "@lucide/svelte";
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
            type="button"
            class={cn("shrink-0", className)}
            onclick={() => { showConfirm = false; onConfirm(); }} 
            title="CONFERMA"
        >
            <Check />
        </Button>
        <Button 
            variant="outline" 
            size="icon"
            type="button"
            class={cn("shrink-0", className)}
            onclick={() => (showConfirm = false)} 
            title="ANNULLA"
        >
            <Undo2 />
        </Button>
    </div>
{:else}
    <Button 
        variant="destructive" 
        size="icon" 
        type="button"
        onclick={() => (showConfirm = true)} 
        class={cn("shrink-0", className)} 
        title="ELIMINA"
    >
        <Trash />
    </Button>
{/if}
