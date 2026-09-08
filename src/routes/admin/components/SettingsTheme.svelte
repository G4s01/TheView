<script lang="ts">
	import * as Card from "$lib/components/ui/card";
	import SettingsHeader from '$lib/components/ui/SettingsHeader.svelte';
	import { Palette, SunMoon, Moon, Sun, Cat, Crosshair, Coffee, Zap } from "@lucide/svelte";

	let currentTheme = $state(
		typeof window !== 'undefined' ? localStorage.getItem('theview-theme') || 'default' : 'default'
	);

	function setTheme(theme: string) {
		currentTheme = theme;
		if (typeof document !== 'undefined') {
			if (theme === 'default') {
				document.documentElement.removeAttribute('data-theme');
			} else {
				document.documentElement.setAttribute('data-theme', theme);
				if (theme === 'dracula') {
					document.documentElement.classList.add('dark');
					localStorage.setItem('theview-color-scheme', 'dark');
				}
			}
			localStorage.setItem('theview-theme', theme);
		}
	}
</script>

<Card.Root>
	<SettingsHeader 
		title="TEMI" 
		description="SCEGLI TRA MIRABOLANTI COLORI E SPERANZE"
	>
		{#snippet icon()}
			<Palette class="size-6" />
		{/snippet}
	</SettingsHeader>
	<Card.Content class="p-6">
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
			
			<!-- COLONNA 1: ESSENZIALI -->
			<div class="flex flex-col gap-4">
				<h3 class="text-sm font-bold uppercase tracking-wider text-muted-foreground border-b border-border pb-2">Essenziali</h3>
				<div class="flex flex-col gap-3">
					<button type="button" onclick={() => setTheme('default')} class="w-full flex items-center justify-between p-4 border-2 {currentTheme === 'default' ? 'border-primary ring-2 ring-primary/20' : 'border-border'} rounded-xl bg-card transition-all">
						<div class="flex items-center gap-3">
							<SunMoon class="size-5 text-primary" />
							<span class="text-xs font-bold text-foreground uppercase tracking-wider">Default</span>
						</div>
						<div class="flex gap-1">
							<div class="size-3 rounded-full" style="background-color: hsl(240 5.9% 10%);"></div>
							<div class="size-3 rounded-full" style="background-color: hsl(240 4.8% 95.9%);"></div>
							<div class="size-3 rounded-full" style="background-color: hsl(240 10% 3.9%);"></div>
						</div>
					</button>

					<button type="button" onclick={() => setTheme('dracula')} class="w-full flex items-center justify-between p-4 border-2 {currentTheme === 'dracula' ? 'border-primary ring-2 ring-primary/20' : 'border-border'} rounded-xl bg-background transition-all">
						<div class="flex items-center gap-3">
							<Moon class="size-5 text-primary" />
							<span class="text-xs font-bold text-foreground uppercase tracking-wider">Classic</span>
						</div>
						<div class="flex gap-1">
							<div class="size-3 rounded-full" style="background-color: hsl(326 100% 74%);"></div>
							<div class="size-3 rounded-full" style="background-color: hsl(258 61% 60%);"></div>
							<div class="size-3 rounded-full" style="background-color: hsl(258 61% 60%);"></div>
						</div>
					</button>
				</div>
			</div>

			<!-- COLONNA 2: CLASSICI -->
			<div class="flex flex-col gap-4">
				<h3 class="text-sm font-bold uppercase tracking-wider text-muted-foreground border-b border-border pb-2">Classici</h3>
				<div class="flex flex-col gap-3">
					<button type="button" onclick={() => setTheme('dracula-duo')} class="w-full flex items-center justify-between p-4 border-2 {currentTheme === 'dracula-duo' ? 'border-primary ring-2 ring-primary/20' : 'border-border'} rounded-xl bg-background transition-all">
						<div class="flex items-center gap-3">
							<SunMoon class="size-5 text-primary" />
							<span class="text-xs font-bold text-foreground uppercase tracking-wider">Dracula</span>
						</div>
						<div class="flex gap-1">
							<div class="size-3 rounded-full" style="background-color: hsl(326 100% 74%);"></div>
							<div class="size-3 rounded-full" style="background-color: hsl(191 97% 77%);"></div>
							<div class="size-3 rounded-full" style="background-color: hsl(191 97% 77%);"></div>
						</div>
					</button>

					<button type="button" onclick={() => setTheme('catppuccin')} class="w-full flex items-center justify-between p-4 border-2 {currentTheme === 'catppuccin' ? 'border-primary ring-2 ring-primary/20' : 'border-border'} rounded-xl bg-background transition-all">
						<div class="flex items-center gap-3">
							<Coffee class="size-5 text-primary" />
							<span class="text-xs font-bold text-foreground uppercase tracking-wider">Catppuccin</span>
						</div>
						<div class="flex gap-1">
							<div class="size-3 rounded-full" style="background-color: hsl(326 74% 74%);"></div>
							<div class="size-3 rounded-full" style="background-color: hsl(267 84% 81%);"></div>
							<div class="size-3 rounded-full" style="background-color: hsl(240 18% 26%);"></div>
						</div>
					</button>
				</div>
			</div>

			<!-- COLONNA 3: JAPAN -->
			<div class="flex flex-col gap-4">
				<h3 class="text-sm font-bold uppercase tracking-wider text-muted-foreground border-b border-border pb-2">Japan</h3>
				<div class="flex flex-col gap-3">
					<button type="button" onclick={() => setTheme('manga-vibe')} class="w-full flex items-center justify-between p-4 border-2 {currentTheme === 'manga-vibe' ? 'border-primary ring-2 ring-primary/20' : 'border-border'} rounded-xl bg-background transition-all">
						<div class="flex items-center gap-3">
							<SunMoon class="size-5 text-primary" />
							<span class="text-xs font-bold text-foreground uppercase tracking-wider">Manga Vibe</span>
						</div>
						<div class="flex gap-1">
							<div class="size-3 rounded-full" style="background-color: hsl(0 0% 96.8627%);"></div>
							<div class="size-3 rounded-full" style="background-color: hsl(0 0% 25.098%);"></div>
							<div class="size-3 rounded-full" style="background-color: hsl(0 0% 25.098%);"></div>
						</div>
					</button>

					<button type="button" onclick={() => setTheme('tokyo-drift')} class="w-full flex items-center justify-between p-4 border-2 {currentTheme === 'tokyo-drift' ? 'border-primary ring-2 ring-primary/20' : 'border-border'} rounded-xl bg-background transition-all">
						<div class="flex items-center gap-3">
							<SunMoon class="size-5 text-primary" />
							<span class="text-xs font-bold text-foreground uppercase tracking-wider">Tokyo Drift</span>
						</div>
						<div class="flex gap-1">
							<div class="size-3 rounded-full" style="background-color: hsl(283.1489 99.1561% 53.5294%);"></div>
							<div class="size-3 rounded-full" style="background-color: hsl(196.7059 100% 50%);"></div>
							<div class="size-3 rounded-full" style="background-color: hsl(340 100% 50%);"></div>
						</div>
					</button>
				</div>
			</div>

			<!-- COLONNA 4: GAMER -->
			<div class="flex flex-col gap-4">
				<h3 class="text-sm font-bold uppercase tracking-wider text-muted-foreground border-b border-border pb-2">Gamer</h3>
				<div class="flex flex-col gap-3">
					<button type="button" onclick={() => setTheme('fallaout')} class="w-full flex items-center justify-between p-4 border-2 {currentTheme === 'fallaout' ? 'border-primary ring-2 ring-primary/20' : 'border-border'} rounded-xl bg-background transition-all">
						<div class="flex items-center gap-3">
							<SunMoon class="size-5 text-primary" />
							<span class="text-xs font-bold text-foreground uppercase tracking-wider">Fallaout</span>
						</div>
						<div class="flex gap-1">
							<div class="size-3 rounded-full" style="background-color: hsl(48 100% 50%);"></div>
							<div class="size-3 rounded-full" style="background-color: hsl(144 100% 50%);"></div>
							<div class="size-3 rounded-full" style="background-color: hsl(47.4419 100.0000% 8.4314%);"></div>
						</div>
					</button>

					<button type="button" onclick={() => setTheme('synthwave')} class="w-full flex items-center justify-between p-4 border-2 {currentTheme === 'synthwave' ? 'border-primary ring-2 ring-primary/20' : 'border-border'} rounded-xl bg-background transition-all">
						<div class="flex items-center gap-3">
							<SunMoon class="size-5 text-primary" />
							<span class="text-xs font-bold text-foreground uppercase tracking-wider">Neon Tweak</span>
						</div>
						<div class="flex gap-1">
							<div class="size-3 rounded-full" style="background-color: hsl(300 100% 50%);"></div>
							<div class="size-3 rounded-full" style="background-color: hsl(266.3529 100% 50%);"></div>
							<div class="size-3 rounded-full" style="background-color: hsl(180 100% 50%);"></div>
						</div>
					</button>
				</div>
			</div>

			<!-- COLONNA 5: CRAZY -->
			<div class="flex flex-col gap-4">
				<h3 class="text-sm font-bold uppercase tracking-wider text-muted-foreground border-b border-border pb-2">Crazy</h3>
				<div class="flex flex-col gap-3">
					<button type="button" onclick={() => setTheme('brutalist')} class="w-full flex items-center justify-between p-4 border-2 {currentTheme === 'brutalist' ? 'border-primary ring-2 ring-primary/20' : 'border-border'} rounded-xl bg-background transition-all">
						<div class="flex items-center gap-3">
							<SunMoon class="size-5 text-primary" />
							<span class="text-xs font-bold text-foreground uppercase tracking-wider">Brutalist</span>
						</div>
						<div class="flex gap-1">
							<div class="size-3 rounded-full" style="background-color: hsl(150 100% 48%);"></div>
							<div class="size-3 rounded-full" style="background-color: hsl(0 100% 60%);"></div>
							<div class="size-3 rounded-full" style="background-color: hsl(35 100% 58.0000%);"></div>
						</div>
					</button>

					<button type="button" onclick={() => setTheme('wild-party')} class="w-full flex items-center justify-between p-4 border-2 {currentTheme === 'wild-party' ? 'border-primary ring-2 ring-primary/20' : 'border-border'} rounded-xl bg-background transition-all">
						<div class="flex items-center gap-3">
							<SunMoon class="size-5 text-primary" />
							<span class="text-xs font-bold text-foreground uppercase tracking-wider">Wild Party</span>
						</div>
						<div class="flex gap-1">
							<div class="size-3 rounded-full" style="background-color: hsl(292.1212 79.8387% 51.3725%);"></div>
							<div class="size-3 rounded-full" style="background-color: hsl(162.1348 70.0787% 49.8039%);"></div>
							<div class="size-3 rounded-full" style="background-color: hsl(192.7059 100% 50%);"></div>
						</div>
					</button>
				</div>
			</div>

		</div>
	</Card.Content>
</Card.Root>

