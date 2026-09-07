<script lang="ts">
	import * as Card from "$lib/components/ui/card";
	import SettingsHeader from '$lib/components/ui/SettingsHeader.svelte';
	import { Palette, SunMoon, Moon, Sun, Cat } from "@lucide/svelte";
</script>

<Card.Root>
	<SettingsHeader 
		title="TEMI" 
		description="SCEGLI TRA MIRABOLANTI COLORI E SPERANZE"
	>
		{#snippet icon()}
			<Palette class="w-6 h-6" />
		{/snippet}
	</SettingsHeader>
	<Card.Content class="p-6">
		<div class="grid grid-cols-1 md:grid-cols-3 gap-8">
			
			<!-- COLONNA 1: SISTEMA -->
			<div class="space-y-4">
				<h3 class="text-sm font-bold uppercase tracking-wider text-muted-foreground border-b border-border pb-2">Sistema</h3>
				<div class="space-y-3">
					<button type="button" class="w-full flex items-center justify-between p-4 border-2 border-primary ring-2 ring-primary/20 rounded-xl bg-card transition-all">
						<div class="flex items-center gap-3">
							<SunMoon class="w-5 h-5 text-primary" />
							<span class="text-xs font-bold text-foreground uppercase tracking-wider">Default</span>
						</div>
						<div class="w-4 h-4 rounded-full bg-primary"></div>
					</button>

					<div class="w-full flex items-center justify-between p-4 border border-border rounded-xl bg-card/50 opacity-50 cursor-not-allowed">
						<div class="flex items-center gap-3">
							<SunMoon class="w-5 h-5 text-muted-foreground" />
							<span class="text-xs font-bold text-muted-foreground uppercase tracking-wider">Due Facce</span>
						</div>
						<span class="text-[9px] font-bold text-muted-foreground uppercase tracking-wider border border-border px-1.5 py-0.5 rounded-sm">C. Soon</span>
					</div>
				</div>
			</div>

			<!-- COLONNA 2: DRACULA -->
			<div class="space-y-4">
				<h3 class="text-sm font-bold uppercase tracking-wider text-muted-foreground border-b border-border pb-2">Dracula</h3>
				<div class="space-y-3">
					<div class="w-full flex items-center justify-between p-4 border border-border rounded-xl bg-card/50 opacity-50 cursor-not-allowed">
						<div class="flex items-center gap-3">
							<Moon class="w-5 h-5 text-muted-foreground" />
							<span class="text-xs font-bold text-muted-foreground uppercase tracking-wider">Van Helsing</span>
						</div>
						<span class="text-[9px] font-bold text-muted-foreground uppercase tracking-wider border border-border px-1.5 py-0.5 rounded-sm">C. Soon</span>
					</div>

					<div class="w-full flex items-center justify-between p-4 border border-border rounded-xl bg-card/50 opacity-50 cursor-not-allowed">
						<div class="flex items-center gap-3">
							<Sun class="w-5 h-5 text-muted-foreground" />
							<span class="text-xs font-bold text-muted-foreground uppercase tracking-wider">Alucard</span>
						</div>
						<span class="text-[9px] font-bold text-muted-foreground uppercase tracking-wider border border-border px-1.5 py-0.5 rounded-sm">C. Soon</span>
					</div>
				</div>
			</div>

			<!-- COLONNA 3: C. SOON -->
			<div class="space-y-4">
				<h3 class="text-sm font-bold uppercase tracking-wider text-muted-foreground border-b border-border pb-2">C. Soon</h3>
				<div class="h-[148px] w-full flex flex-col items-center justify-center p-4 border border-dashed border-border rounded-xl bg-card/30 opacity-50">
					<Cat class="w-10 h-10 text-muted-foreground mb-2" strokeWidth={1.5} />
					<span class="text-xs font-bold text-muted-foreground uppercase tracking-wider">Presto in Arrivo</span>
				</div>
			</div>

		</div>
	</Card.Content>
</Card.Root>

