<script lang="ts">
	import * as Card from "$lib/components/ui/card";
	import SettingsHeader from '$lib/components/ui/SettingsHeader.svelte';
	import { Palette, SunMoon, Moon, Coffee } from "@lucide/svelte";

	import { appState } from '$lib/client/state.svelte';
	import { page } from '$app/stores';

	let currentTheme = $state($page.data.settings?.theme || 'default');

	$effect(() => {
		if (appState.settings?.theme && appState.settings.theme !== currentTheme) {
			currentTheme = appState.settings.theme;
		}
	});

	async function setTheme(theme: string) {
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
		}
		
		try {
			await fetch('/api/settings', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ theme })
			});
			appState.settings.theme = theme;
		} catch (e) {
			console.error('Errore nel salvataggio del tema', e);
		}
	}

	const themeGroups = [
		{
			title: 'Essenziali',
			themes: [
				{ id: 'default', label: 'Default', icon: SunMoon, colors: ['hsl(240 5.9% 10%)', 'hsl(240 4.8% 95.9%)', 'hsl(240 10% 3.9%)'] },
				{ id: 'dracula', label: 'Classic', icon: Moon, colors: ['hsl(326 100% 74%)', 'hsl(258 61% 60%)', 'hsl(258 61% 60%)'] },
			]
		},
		{
			title: 'Classici',
			themes: [
				{ id: 'dracula-duo', label: 'Dracula', icon: SunMoon, colors: ['hsl(326 100% 74%)', 'hsl(191 97% 77%)', 'hsl(191 97% 77%)'] },
				{ id: 'catppuccin', label: 'Catppuccin', icon: Coffee, colors: ['hsl(326 74% 74%)', 'hsl(267 84% 81%)', 'hsl(240 18% 26%)'] },
			]
		},
		{
			title: 'Japan',
			themes: [
				{ id: 'manga-vibe', label: 'Manga Vibe', icon: SunMoon, colors: ['hsl(0 0% 96.8627%)', 'hsl(0 0% 25.098%)', 'hsl(0 0% 25.098%)'] },
				{ id: 'tokyo-drift', label: 'Tokyo Drift', icon: SunMoon, colors: ['hsl(283.1489 99.1561% 53.5294%)', 'hsl(196.7059 100% 50%)', 'hsl(340 100% 50%)'] },
			]
		},
		{
			title: 'Gamer',
			themes: [
				{ id: 'fallaout', label: 'Fallaout', icon: SunMoon, colors: ['hsl(48 100% 50%)', 'hsl(144 100% 50%)', 'hsl(47.4419 100.0000% 8.4314%)'] },
				{ id: 'synthwave', label: 'Neon Tweak', icon: SunMoon, colors: ['hsl(300 100% 50%)', 'hsl(266.3529 100% 50%)', 'hsl(180 100% 50%)'] },
			]
		},
		{
			title: 'Crazy',
			themes: [
				{ id: 'brutalist', label: 'Brutalist', icon: SunMoon, colors: ['hsl(150 100% 48%)', 'hsl(0 100% 60%)', 'hsl(35 100% 58.0000%)'] },
				{ id: 'wild-party', label: 'Wild Party', icon: SunMoon, colors: ['hsl(292.1212 79.8387% 51.3725%)', 'hsl(162.1348 70.0787% 49.8039%)', 'hsl(192.7059 100% 50%)'] },
			]
		}
	];
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
			
			{#each themeGroups as group}
				<div class="flex flex-col gap-4">
					<h3 class="text-sm font-bold uppercase tracking-wider text-muted-foreground border-b border-border pb-2">{group.title}</h3>
					<div class="flex flex-col gap-3">
						{#each group.themes as theme}
							{@const Icon = theme.icon}
							<button type="button" onclick={() => setTheme(theme.id)} class="w-full flex items-center justify-between p-4 border-2 {currentTheme === theme.id ? 'border-primary ring-2 ring-primary/20' : 'border-border'} rounded-xl bg-card hover:bg-muted/50 transition-all">
								<div class="flex items-center gap-3">
									<Icon class="size-5 text-primary" />
									<span class="text-xs font-bold text-foreground uppercase tracking-wider">{theme.label}</span>
								</div>
								<div class="flex gap-1">
									{#each theme.colors as color}
										<div class="size-3 rounded-full" style="background-color: {color};"></div>
									{/each}
								</div>
							</button>
						{/each}
					</div>
				</div>
			{/each}

		</div>
	</Card.Content>
</Card.Root>

