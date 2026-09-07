<script lang="ts">
    import { cn } from "$lib/utils";

    let {
        icon,
        name,
        iconStyle = 'rounded-xl',
        size = 'md',
        class: className = ''
    } = $props<{
        icon?: string;
        name: string;
        iconStyle?: string;
        size?: 'sm' | 'md' | 'lg';
        class?: string;
    }>();

    let imageError = $state(false);

    let sizeClass = $derived(
        size === 'sm' ? 'size-4' : 
        size === 'lg' ? 'size-8' : 
        'size-6'
    );

    let imageRadiusClass = $derived(
        iconStyle === 'rounded-full' ? 'rounded-full' : 
        iconStyle === 'rounded-xl' ? 'rounded' : 
        'rounded-none'
    );

    let iconUrl = $derived.by(() => {
        if (!icon) return null;
        if (icon.startsWith('http://') || icon.startsWith('https://')) {
            return icon;
        }
        return `https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/${icon}.png`;
    });

    let showImage = $derived(!!iconUrl && !imageError);
    
    let fallbackInitial = $derived(name ? name.charAt(0).toUpperCase() : '?');
</script>

{#if showImage}
    <img 
        src={iconUrl} 
        alt={name} 
        class={cn(sizeClass, 'object-contain', imageRadiusClass, className)} 
        onerror={() => { imageError = true; }}
    />
{:else}
    <div class={cn(sizeClass, imageRadiusClass, 'bg-muted text-muted-foreground font-bold flex items-center justify-center', className)}>
        {fallbackInitial}
    </div>
{/if}
