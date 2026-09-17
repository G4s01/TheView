<script lang="ts">
	import TextInput from '$lib/components/ui/TextInput.svelte';
	import ToggleOptionCard from '$lib/components/ui/ToggleOptionCard.svelte';
	import SettingsHeader from '$lib/components/ui/SettingsHeader.svelte';
	import { slide } from "svelte/transition";
	import * as Card from "$lib/components/ui/card";
	import { Paintbrush, MonitorSmartphone, Home, Pencil, Save, Loader2 } from "@lucide/svelte";
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
		editModeSidebarPosition = $bindable(),
		editServiceSheetPosition = $bindable(),
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
		editModeSidebarPosition: string;
		editServiceSheetPosition: string;
		saveAppearanceSettings: () => void;
		isSavingAppearance: boolean;
	}>();

	let isEditingDesktop = $state(false);
	let isEditingMobile = $state(false);
	let isInitial = true;

	$effect(() => {
		showCategoriesDesktop;
		showCategoriesMobile;
		showCategoryCounts;
		showServiceDescriptions;
		iconStyle;
		stickyNavbar;
		showEditButton;
		editModeSidebarPosition;
		editServiceSheetPosition;

		if (isInitial) {
			isInitial = false;
			return;
		}

		untrack(() => {
			saveAppearanceSettings();
		});
	});

	const iconStyles = [
		{ id: 'rounded-xl', label: 'Arrotondato', radius: 'rx-2' },
		{ id: 'rounded-full', label: 'Circolare', radius: 'rx-full' },
		{ id: 'rounded-none', label: 'Quadrato', radius: 'rx-none' }
	];

	const sidebarPositions = [
		{ id: 'left', label: 'Sinistra' },
		{ id: 'right', label: 'Destra' }
	];
</script>

<div class="flex flex-col gap-6">

	<!-- Appearance Section -->
	<Card.Root>
		<SettingsHeader 
			title="ASPETTO" 
			description="PERSONALIZZA L'ASPETTO DELL'INTERFACCIA"
		>
			{#snippet icon()}
				<Paintbrush class="size-6" />
			{/snippet}
		</SettingsHeader>
		<Card.Content class="p-6">
			
			<div class="flex flex-col gap-10">
				
				<!-- Macro Category: HOME -->
				<div class="flex flex-col gap-6">
					
					<div class="flex items-center gap-2 border-b border-border pb-2">
						<Home class="size-5 text-muted-foreground" />
						<h3 class="text-lg font-bold uppercase tracking-wider text-foreground">Home</h3>
					</div>

					<!-- Group: Generali -->
					<div class="flex flex-col gap-3">
						<h4 class="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Generali</h4>
						<div class="p-5 border border-border rounded-xl bg-card/50 flex flex-col gap-6">
							
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
									{#each iconStyles as style}
										<button type="button" onclick={() => iconStyle = style.id} class="flex flex-col items-center gap-3 p-4 rounded-xl {iconStyle === style.id ? 'border-2 border-primary bg-primary/10 shadow-sm' : 'border-2 border-transparent bg-card hover:bg-muted/50'} transition-all">
											<div class="size-12 bg-primary shadow-sm flex items-center justify-center {style.id}">
												<svg class="size-6 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
											</div>
											<span class="text-[10px] font-bold text-foreground uppercase tracking-wider text-center">{style.label}</span>
										</button>
									{/each}
								</div>
							</div>
						</div>
					</div>

					<!-- Group: Navbar / Topbar -->
					<div class="flex flex-col gap-3">
						<h4 class="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Navbar / Topbar</h4>
						<div class="p-5 border border-border rounded-xl bg-card/50 flex flex-col gap-8">
							
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
								<div class="flex flex-col gap-3 p-4 border border-border rounded-xl bg-background shadow-sm mt-4">
									<p class="text-xs font-bold text-foreground uppercase tracking-wider">Posizione Sidebar Edit Mode</p>
									<div class="grid grid-cols-2 gap-4">
										{#each sidebarPositions as pos}
											<button type="button" onclick={() => editModeSidebarPosition = pos.id} class="flex flex-col items-center gap-3 p-4 rounded-xl {editModeSidebarPosition === pos.id ? 'border-2 border-primary bg-primary/10 shadow-sm' : 'border-2 border-transparent bg-card hover:bg-muted/50'} transition-all">
												<span class="text-[10px] font-bold text-foreground uppercase tracking-wider text-center">{pos.label}</span>
											</button>
										{/each}
									</div>
								</div>
								
								<div class="flex flex-col gap-3 p-4 border border-border rounded-xl bg-background shadow-sm mt-4">
									<p class="text-xs font-bold text-foreground uppercase tracking-wider">Posizione Pannello Servizi</p>
									<div class="grid grid-cols-2 gap-4">
										{#each sidebarPositions as pos}
											<button type="button" onclick={() => editServiceSheetPosition = pos.id} class="flex flex-col items-center gap-3 p-4 rounded-xl {editServiceSheetPosition === pos.id ? 'border-2 border-primary bg-primary/10 shadow-sm' : 'border-2 border-transparent bg-card hover:bg-muted/50'} transition-all">
												<span class="text-[10px] font-bold text-foreground uppercase tracking-wider text-center">{pos.label}</span>
											</button>
										{/each}
									</div>
								</div>
							</div>

							<!-- Subgroup 2: Indice Griglie e Titoli -->
							<div class="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6 border-t border-border/50">
								<ToggleOptionCard 
									title="INDICE GRIGLIE DESKTOP" 
									description="MOSTRA INDICE GRIGLIE NELLA TOPBAR SU SCHERMI GRANDI" 
									bind:checked={showCategoriesDesktop} 
								>
									{#snippet icon()}
										<MonitorSmartphone class="size-4" />
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
														<Loader2 class="size-4 animate-spin" strokeWidth={1.5} />
													{:else if isEditingDesktop}
														<Save class="size-4" strokeWidth={1.5} />
													{:else}
														<Pencil class="size-4" strokeWidth={1.5} />
													{/if}
												</button>
											</TextInput>
										</div>
									{/if}
								</ToggleOptionCard>

								<ToggleOptionCard 
									title="INDICE GRIGLIE MOBILE" 
									description="MOSTRA INDICE GRIGLIE NELLA TOPBAR SU SCHERMI PICCOLI" 
									bind:checked={showCategoriesMobile} 
								>
									{#snippet icon()}
										<MonitorSmartphone class="size-4" />
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
														<Loader2 class="size-4 animate-spin" strokeWidth={1.5} />
													{:else if isEditingMobile}
														<Save class="size-4" strokeWidth={1.5} />
													{:else}
														<Pencil class="size-4" strokeWidth={1.5} />
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
