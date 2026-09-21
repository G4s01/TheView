<script lang="ts">
    import { Trash, Check, X } from "@lucide/svelte";
    import { Button } from "$lib/components/ui/button";
    import { cn } from "$lib/utils";
    
    let {
        onConfirm,
        disabled = false,
        class: className = ''
    } = $props<{
        onConfirm: () => void;
        class?: string;
        disabled?: boolean;
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
            {disabled}
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
            {disabled}
        >
            <X />
        </Button>
    </div>
{:else}
    <Button 
        variant="destructive" 
        size="icon" 
        type="button"
        onclick={() => (showConfirm = true)} 
        {disabled}
        class={cn("shrink-0", className)} 
        title="ELIMINA"
    >
        <Trash />
    </Button>
{/if}
