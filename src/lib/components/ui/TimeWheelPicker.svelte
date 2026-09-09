<script lang="ts">
    import { onMount } from "svelte";
    let { durationMs = $bindable(0) } = $props();

    let customPauseDD = $state(0);
    let customPauseHH = $state(0);
    let customPauseMM = $state(0);

    let dds = Array.from({length: 31}, (_, i) => i);
    let hhs = Array.from({length: 24}, (_, i) => i);
    let mms = Array.from({length: 60}, (_, i) => i);

    function onScroll(e: Event, type: 'dd'|'hh'|'mm') {
        const target = e.target as HTMLElement;
        const index = Math.round(target.scrollTop / 28);
        if (type === 'dd') customPauseDD = index;
        if (type === 'hh') customPauseHH = index;
        if (type === 'mm') customPauseMM = index;
        
        updateDuration();
    }
    
    function updateDuration() {
        durationMs = (customPauseDD * 86400 + customPauseHH * 3600 + customPauseMM * 60) * 1000;
    }

    $effect(() => {
        updateDuration();
    });

    let activeEl: HTMLElement | null = null;
    let startY = 0;
    let initialScrollTop = 0;

    function handleMouseDown(e: MouseEvent) {
        activeEl = e.currentTarget as HTMLElement;
        startY = e.clientY;
        initialScrollTop = activeEl.scrollTop;
        activeEl.style.cursor = 'grabbing';
        
        window.addEventListener('mousemove', handleWindowMouseMove);
        window.addEventListener('mouseup', handleWindowMouseUp);
    }
    
    function handleWindowMouseUp(e: MouseEvent) {
        if (activeEl) {
            activeEl.style.cursor = 'grab';
            activeEl = null;
        }
        window.removeEventListener('mousemove', handleWindowMouseMove);
        window.removeEventListener('mouseup', handleWindowMouseUp);
    }
    
    function handleWindowMouseMove(e: MouseEvent) {
        if (!activeEl) return;
        e.preventDefault();
        const walk = (startY - e.clientY) * 1.5;
        activeEl.scrollTop = initialScrollTop + walk;
    }
</script>

<div class="flex flex-col text-foreground font-mono bg-muted/50 rounded-md border border-border p-1.5 w-full justify-between shadow-inner h-26">
    <div class="flex justify-between w-full px-2 shrink-0">
        <span class="text-[9px] font-sans font-semibold text-muted-foreground uppercase flex-1 text-center">Giorni</span>
        <span class="w-3"></span>
        <span class="text-[9px] font-sans font-semibold text-muted-foreground uppercase flex-1 text-center">Ore</span>
        <span class="w-3"></span>
        <span class="text-[9px] font-sans font-semibold text-muted-foreground uppercase flex-1 text-center">Minuti</span>
    </div>
    <div class="flex items-center justify-between w-full flex-1 min-h-0 relative mt-0.5">
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        <div class="w-full h-21 overflow-y-auto snap-y snap-mandatory scrollbar-none [&::-webkit-scrollbar]:hidden relative cursor-grab flex-1" 
             onscroll={(e) => onScroll(e, 'dd')}
             onmousedown={handleMouseDown}
        >
            <div class="h-7"></div>
            {#each dds as d}
                <!-- svelte-ignore a11y_click_events_have_key_events -->
                <!-- svelte-ignore a11y_no_static_element_interactions -->
                <div 
                    class="h-7 flex items-center justify-center snap-center cursor-pointer text-sm font-bold {customPauseDD === d ? 'text-primary scale-110' : 'text-muted-foreground opacity-50'} transition-all"
                    onclick={(e) => (e.currentTarget as HTMLElement).scrollIntoView({ behavior: 'smooth', block: 'center' })}
                >{d}</div>
            {/each}
            <div class="h-7"></div>
        </div>
        
        <span class="text-xl opacity-30 font-bold mb-1">:</span>
        
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        <div class="w-full h-21 overflow-y-auto snap-y snap-mandatory scrollbar-none [&::-webkit-scrollbar]:hidden relative cursor-grab flex-1" 
             onscroll={(e) => onScroll(e, 'hh')}
             onmousedown={handleMouseDown}
        >
            <div class="h-7"></div>
            {#each hhs as h}
                <!-- svelte-ignore a11y_click_events_have_key_events -->
                <!-- svelte-ignore a11y_no_static_element_interactions -->
                <div 
                    class="h-7 flex items-center justify-center snap-center cursor-pointer text-sm font-bold {customPauseHH === h ? 'text-primary scale-110' : 'text-muted-foreground opacity-50'} transition-all"
                    onclick={(e) => (e.currentTarget as HTMLElement).scrollIntoView({ behavior: 'smooth', block: 'center' })}
                >{h.toString().padStart(2, '0')}</div>
            {/each}
            <div class="h-7"></div>
        </div>
        
        <span class="text-xl opacity-30 font-bold mb-1">:</span>
        
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        <div class="w-full h-21 overflow-y-auto snap-y snap-mandatory scrollbar-none [&::-webkit-scrollbar]:hidden relative cursor-grab flex-1" 
             onscroll={(e) => onScroll(e, 'mm')}
             onmousedown={handleMouseDown}
        >
            <div class="h-7"></div>
            {#each mms as m}
                <!-- svelte-ignore a11y_click_events_have_key_events -->
                <!-- svelte-ignore a11y_no_static_element_interactions -->
                <div 
                    class="h-7 flex items-center justify-center snap-center cursor-pointer text-sm font-bold {customPauseMM === m ? 'text-primary scale-110' : 'text-muted-foreground opacity-50'} transition-all"
                    onclick={(e) => (e.currentTarget as HTMLElement).scrollIntoView({ behavior: 'smooth', block: 'center' })}
                >{m.toString().padStart(2, '0')}</div>
            {/each}
            <div class="h-7"></div>
        </div>
    </div>
</div>