<script lang="ts">
	import TextInput from '$lib/components/ui/TextInput.svelte';
	import ToggleOptionCard from '$lib/components/ui/ToggleOptionCard.svelte';
	import SettingsHeader from '$lib/components/ui/SettingsHeader.svelte';
	import { slide } from "svelte/transition";
	import * as Card from "$lib/components/ui/card";
	import { Palette, MonitorSmartphone, Home, Paintbrush, Pencil, Save, Loader2 } from "@lucide/svelte";
	import { untrack } from "svelte";

	let {
		showCategoriesDesktop = $bindable(),
		showCategoriesMobile = $bindable(),
		customNavbarTitleDesktop = $bindable(),
		customNavbarTitleMobile = $bindable(),
		showCategoryCounts = $bindable(),
		showServiceDescriptions = $bindable(),
		iconStyle = $bindable(),
		stickyNavbar = $bindable(),
		showEditButton = $bindable(),
		saveAppearanceSettings,
		isSavingAppearance
	} = $props<{
		showCategoriesDesktop: boolean;
		showCategoriesMobile: boolean;
		customNavbarTitleDesktop: string;
		customNavbarTitleMobile: string;
		showCategoryCounts: boolean;
		showServiceDescriptions: boolean;
		iconStyle: string;
		stickyNavbar: boolean;
		showEditButton: boolean;
		saveAppearanceSettings: () => void;
		isSavingAppearance: boolean;
	}>();

	let isEditingDesktop = $state(false);
	let isEditingMobile = $state(false);
	let isInitial = true;

	$effect(() => {
		// Track auto-save dependencies
		const _ = [
			showCategoriesDesktop, 
			showCategoriesMobile, 
			showCategoryCounts, 
			showServiceDescriptions, 
			iconStyle, 
			stickyNavbar, 
			showEditButton
		];

		if (isInitial) {
			isInitial = false;
			return;
		}

		untrack(() => {
			saveAppearanceSettings();
		});
	});
</script>

<div class="space-y-6">

	<!-- Appearance Section -->
	<Card.Root>
		<SettingsHeader 
			title="ASPETTO" 
			description="PERSONALIZZA L'ASPETTO DELL'INTERFACCIA"
		>
			{#snippet icon()}
				<Paintbrush class="w-6 h-6" />
			{/snippet}
		</SettingsHeader>
		<Card.Content class="p-6">
			
			<div class="space-y-10">
				
				<!-- Macro Category: HOME -->
				<div class="space-y-6">
					
					<div class="flex items-center gap-2 border-b border-border pb-2">
						<Home class="w-5 h-5 text-muted-foreground" />
						<h3 class="text-lg font-bold uppercase tracking-wider text-foreground">Home</h3>
					</div>

					<!-- Group: Generali -->
					<div class="space-y-3">
						<h4 class="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Generali</h4>
						<div class="p-5 border border-border rounded-xl bg-card/50 space-y-6">
							
							<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
								<ToggleOptionCard 
									title="CONTATORE SERVIZI" 
									description="NUMERO DEI SERVIZI PER CATEGORIA" 
									bind:checked={showCategoryCounts} 
								/>
								<ToggleOptionCard 
									title="DESCRIZIONI" 
									description="MOSTRA LE DESCRIZIONI DEI SERVIZI" 
									bind:checked={showServiceDescriptions} 
								/>
							</div>
							
							<!-- Stile Icone Servizi -->
							<div class="flex flex-col gap-3 p-4 border border-border rounded-xl bg-background shadow-sm">
								<p class="text-xs font-bold text-foreground uppercase tracking-wider">Stile Icone Servizi</p>
								<div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
									<button type="button" onclick={() => iconStyle = 'rounded-xl'} class="flex flex-col items-center gap-3 p-4 rounded-xl {iconStyle === 'rounded-xl' ? 'border-2 border-primary bg-primary/10 shadow-sm' : 'border-2 border-transparent bg-card hover:bg-muted/50'} transition-all">
										<div class="w-12 h-12 bg-primary rounded-xl shadow-sm flex items-center justify-center">
											<svg class="w-6 h-6 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
										</div>
										<span class="text-[10px] font-bold text-foreground uppercase tracking-wider text-center">Arrotondato</span>
									</button>
									<button type="button" onclick={() => iconStyle = 'rounded-full'} class="flex flex-col items-center gap-3 p-4 rounded-xl {iconStyle === 'rounded-full' ? 'border-2 border-primary bg-primary/10 shadow-sm' : 'border-2 border-transparent bg-card hover:bg-muted/50'} transition-all">
										<div class="w-12 h-12 bg-primary rounded-full shadow-sm flex items-center justify-center">
											<svg class="w-6 h-6 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
										</div>
										<span class="text-[10px] font-bold text-foreground uppercase tracking-wider text-center">Circolare</span>
									</button>
									<button type="button" onclick={() => iconStyle = 'rounded-none'} class="flex flex-col items-center gap-3 p-4 rounded-xl {iconStyle === 'rounded-none' ? 'border-2 border-primary bg-primary/10 shadow-sm' : 'border-2 border-transparent bg-card hover:bg-muted/50'} transition-all">
										<div class="w-12 h-12 bg-primary rounded-none shadow-sm flex items-center justify-center">
											<svg class="w-6 h-6 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
										</div>
										<span class="text-[10px] font-bold text-foreground uppercase tracking-wider text-center">Quadrato</span>
									</button>
								</div>
							</div>
						</div>
					</div>

					<!-- Group: Navbar / Topbar -->
					<div class="space-y-3">
						<h4 class="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Navbar / Topbar</h4>
						<div class="p-5 border border-border rounded-xl bg-card/50 space-y-8">
							
							<!-- Subgroup 1: Settings Generali Navbar -->
							<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
								<ToggleOptionCard 
									title="NAVBAR ASSOLUTA" 
									description="RESTERA' FISSA IN ALTO ANCHE SCORRENDO" 
									bind:checked={stickyNavbar} 
								/>
								<ToggleOptionCard 
									title="MODIFICA RAPIDA" 
									description="MATITA PER COMMUTARE LA MODIFICA RAPIDA" 
									bind:checked={showEditButton} 
								/>
							</div>

							<!-- Subgroup 2: Categorie e Titoli -->
							<div class="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6 border-t border-border/50">
								<ToggleOptionCard 
									title="CATEGORIE DESKTOP" 
									description="MOSTRA LE CATEGORIE NELLA TOPBAR SU SCHERMI GRANDI" 
									bind:checked={showCategoriesDesktop} 
								>
									{#snippet icon()}
										<MonitorSmartphone class="w-4 h-4" />
									{/snippet}

									{#if !showCategoriesDesktop || !showCategoriesMobile}
										<div transition:slide class="pt-4 mt-4 border-t border-border/50 {showCategoriesDesktop ? 'opacity-50' : ''}">
											<TextInput 
												label="TITOLO A SOSTITUZIONE DESKTOP" 
												bind:value={customNavbarTitleDesktop} 
												placeholder="THEVIEW DASHBOARD" 
												disabled={showCategoriesDesktop || !isEditingDesktop || isSavingAppearance}
												class="pr-10"
											>
												<button 
													type="button" 
													onclick={(e) => {
														e.preventDefault();
														if (isEditingDesktop) {
															isEditingDesktop = false;
															saveAppearanceSettings();
														} else {
															isEditingDesktop = true;
														}
													}} 
													class="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground disabled:opacity-50"
													disabled={showCategoriesDesktop || isSavingAppearance}
												>
													{#if isSavingAppearance && !isEditingDesktop}
														<Loader2 class="h-4 w-4 animate-spin" strokeWidth={1.5} />
													{:else if isEditingDesktop}
														<Save class="h-4 w-4" strokeWidth={1.5} />
													{:else}
														<Pencil class="h-4 w-4" strokeWidth={1.5} />
													{/if}
												</button>
											</TextInput>
										</div>
									{/if}
								</ToggleOptionCard>

								<ToggleOptionCard 
									title="CATEGORIE MOBILE" 
									description="MOSTRA LE CATEGORIE NELLA TOPBAR SU SCHERMI PICCOLI" 
									bind:checked={showCategoriesMobile} 
								>
									{#snippet icon()}
										<MonitorSmartphone class="w-4 h-4" />
									{/snippet}

									{#if !showCategoriesDesktop || !showCategoriesMobile}
										<div transition:slide class="pt-4 mt-4 border-t border-border/50 {showCategoriesMobile ? 'opacity-50' : ''}">
											<TextInput 
												label="TITOLO A SOSTITUZIONE MOBILE" 
												bind:value={customNavbarTitleMobile} 
												placeholder="HOME" 
												disabled={showCategoriesMobile || !isEditingMobile || isSavingAppearance}
												class="pr-10"
											>
												<button 
													type="button" 
													onclick={(e) => {
														e.preventDefault();
														if (isEditingMobile) {
															isEditingMobile = false;
															saveAppearanceSettings();
														} else {
															isEditingMobile = true;
														}
													}} 
													class="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground disabled:opacity-50"
													disabled={showCategoriesMobile || isSavingAppearance}
												>
													{#if isSavingAppearance && !isEditingMobile}
														<Loader2 class="h-4 w-4 animate-spin" strokeWidth={1.5} />
													{:else if isEditingMobile}
														<Save class="h-4 w-4" strokeWidth={1.5} />
													{:else}
														<Pencil class="h-4 w-4" strokeWidth={1.5} />
													{/if}
												</button>
											</TextInput>
										</div>
									{/if}
								</ToggleOptionCard>
							</div>

						</div>
					</div>

				</div>
			</div>

		</Card.Content>
	</Card.Root>
</div>

