<script lang="ts">
	import { Settings, Moon, Pencil, PencilOff, LogOut, ArrowUp, LogIn } from "@lucide/svelte";
	import './layout.css';
	import LoginModal from '$lib/components/LoginModal.svelte';
	import { appState } from '$lib/client/state.svelte';
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { QueryClient, QueryClientProvider } from '@tanstack/svelte-query';
	
	let { children, data } = $props();

	const queryClient = new QueryClient({
		defaultOptions: {
			queries: {
				enabled: browser,
			},
		},
	});

	let hasInitializedEditMode = false;
	let hasInitializedAdminTab = false;
	
	$effect(() => {
		appState.isAdmin = data.isAdmin;
		appState.settings = data.settings || {};
	});

	$effect(() => {
		if (browser && data.isAdmin && !hasInitializedEditMode) {
			const saved = localStorage.getItem('isEditMode');
			if (saved !== null) {
				appState.isEditMode = saved === 'true';
			} else {
				appState.isEditMode = true;
			}
			hasInitializedEditMode = true;
		}
	});

	$effect(() => {
		if (browser && hasInitializedEditMode) {
			localStorage.setItem('isEditMode', String(appState.isEditMode));
		}
	});

	$effect(() => {
		if (browser && !hasInitializedAdminTab) {
			const saved = localStorage.getItem('adminTab');
			if (saved) appState.adminTab = saved;
			hasInitializedAdminTab = true;
		}
	});

	$effect(() => {
		if (browser && hasInitializedAdminTab) {
			localStorage.setItem('adminTab', appState.adminTab);
		}
	});

	// We'll pass categories down to the sidebar
	// data.categories will be populated by +layout.server.ts later
	let categories = $derived(data.categories || []);
	let versionInfo = $state<{currentVersion?: string, latestVersion?: string, url?: string}>({});
	
	let isNavbarHidden = $state(false);
	let lastScrollY = $state(0);

	$effect(() => {
		if ($page.url.pathname.startsWith('/admin') || data.stickyNavbar) {
			isNavbarHidden = false;
		} else {
			isNavbarHidden = true;
		}
	});

	function handleScroll() {
		if (data.stickyNavbar || $page.url.pathname.startsWith('/admin')) {
			isNavbarHidden = false;
			return;
		}
		const currentScrollY = window.scrollY;
		if (currentScrollY > lastScrollY && currentScrollY > 10) {
			isNavbarHidden = true; // Scrolling down
		} else if (currentScrollY < lastScrollY) {
			isNavbarHidden = false; // Scrolling up
		}
		lastScrollY = currentScrollY;
	}

	onMount(() => {
		fetch('/api/version').then(r => r.json()).then(v => versionInfo = v).catch(() => {});
	});
</script>

<svelte:window onscroll={handleScroll} />

<QueryClientProvider client={queryClient}>
<div class="flex flex-col min-h-screen bg-background text-foreground">
	{#if $page.url.pathname !== '/setup'}
	<!-- Topbar Header -->
	{#if isNavbarHidden}
	<!-- Hover trigger area to reveal navbar -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div 
		class="fixed top-0 left-0 w-full h-4 z-50 bg-transparent"
		onmouseenter={() => isNavbarHidden = false}
	></div>
	{/if}
	
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<header 
		class="sticky top-0 z-40 bg-card border-b border-border transition-transform duration-300 {isNavbarHidden ? '-translate-y-full' : 'translate-y-0'}"
		onmouseleave={() => { if (!data.stickyNavbar && !$page.url.pathname.startsWith('/admin')) isNavbarHidden = true; }}
	>
		<div class="w-full flex items-center justify-between px-4 sm:px-6 lg:px-8 h-16 max-w-[1920px] mx-auto">
			
			<!-- Left Column (Logo & Back) -->
			<div class="flex-1 flex items-center justify-start min-w-50">
				<div class="flex items-center space-x-3">
					{#if $page.url.pathname.startsWith('/admin')}
						<a href="/" class="flex items-center justify-center p-2 bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground rounded-xl transition-colors shadow-sm" title="Torna alla Dashboard">
							<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
						</a>
					{/if}
					<a href="/" class="flex items-center space-x-2 hover:opacity-80 transition-opacity">
						<img src="/favicon.svg" alt="TheView Logo" class="w-8 h-8" />
						<span class="hidden sm:inline text-xl font-bold text-foreground tracking-tight">TheView</span>
					</a>
				</div>
			</div>

			<!-- Center Column (Nav Tabs) -->
			<div class="hidden md:flex w-full max-w-7xl shrink px-4">
				{#if $page.url.pathname.startsWith('/admin')}
					<nav class="flex items-center w-full space-x-3">
						<a href="/admin?tab=services" data-sveltekit-replacestate data-sveltekit-noscroll class="flex-1 text-center px-4 py-2 text-sm font-bold uppercase tracking-wider rounded-xl transition-all border {($page.url.searchParams.get('tab') || 'services') === 'services' ? 'border-primary/20 bg-primary/10 text-primary shadow-sm' : 'border-transparent text-muted-foreground hover:bg-muted'}">
																Servizi
															</a>
						<a href="/admin?tab=categories" data-sveltekit-replacestate data-sveltekit-noscroll class="flex-1 text-center px-4 py-2 text-sm font-bold uppercase tracking-wider rounded-xl transition-all border {($page.url.searchParams.get('tab') || 'services') === 'categories' ? 'border-primary/20 bg-primary/10 text-primary shadow-sm' : 'border-transparent text-muted-foreground hover:bg-muted'}">
																Categorie
															</a>
						<a href="/admin?tab=discovery" data-sveltekit-replacestate data-sveltekit-noscroll class="flex-1 text-center px-4 py-2 text-sm font-bold uppercase tracking-wider rounded-xl transition-all border {($page.url.searchParams.get('tab') || 'services') === 'discovery' ? 'border-primary/20 bg-primary/10 text-primary shadow-sm' : 'border-transparent text-muted-foreground hover:bg-muted'}">
																Discovery
															</a>
						<a href="/admin?tab=widgets" data-sveltekit-replacestate data-sveltekit-noscroll class="flex-1 text-center px-4 py-2 text-sm font-bold uppercase tracking-wider rounded-xl transition-all border {($page.url.searchParams.get('tab') || 'services') === 'widgets' ? 'border-primary/20 bg-primary/10 text-primary shadow-sm' : 'border-transparent text-muted-foreground hover:bg-muted'}">
																Widgets
															</a>
						<a href="/admin?tab=settings" data-sveltekit-replacestate data-sveltekit-noscroll class="flex-1 text-center px-4 py-2 text-sm font-bold uppercase tracking-wider rounded-xl transition-all border {($page.url.searchParams.get('tab') || 'services') === 'settings' ? 'border-primary/20 bg-primary/10 text-primary shadow-sm' : 'border-transparent text-muted-foreground hover:bg-muted'}">
																Impostazioni
															</a>
					</nav>
				{:else}
					<div class="relative w-full overflow-hidden flex items-center" style="-webkit-mask-image: linear-gradient(to right, transparent, black 32px, black calc(100% - 64px), transparent); mask-image: linear-gradient(to right, transparent, black 32px, black calc(100% - 64px), transparent);">
						<nav class="flex items-center space-x-2 w-full justify-start md:justify-center overflow-x-auto no-scrollbar relative z-0 px-2">
						{#if data.showCategoriesDesktop}
							{#each categories as category}
								{#if category.count > 0 || appState.isEditMode}
									<a href="/#{category.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}" class="flex-1 text-center px-4 py-2 text-sm font-bold uppercase tracking-wider rounded-xl transition-all whitespace-nowrap border border-border text-muted-foreground hover:bg-muted hover:text-foreground">
										{category.name}
									</a>
								{/if}
							{/each}
						{:else if data.customNavbarTitleDesktop}
							<span class="px-4 py-2 text-sm font-bold uppercase tracking-wider text-foreground whitespace-nowrap">
								{data.customNavbarTitleDesktop}
							</span>
						{/if}
						</nav>
					</div>
				{/if}
			</div>

			<!-- Right Column (Actions) -->
			<div class="flex-1 flex items-center justify-end min-w-37.5 space-x-2 sm:space-x-4">
				<div class="flex items-center bg-muted rounded-lg p-1 border border-border transition-colors {data.isAdmin && appState.isEditMode ? 'ring-2 ring-primary border-primary' : ''}">
					{#if data.isAdmin}
						<a href="/admin?tab={appState.adminTab || 'services'}" class="relative p-1.5 text-muted-foreground hover:text-foreground transition-colors" title="ADMIN PANEL">
							<Settings class="h-5 w-5" strokeWidth={1.5} />
							{#if versionInfo.latestVersion && versionInfo.latestVersion !== versionInfo.currentVersion}
								<div class="absolute -top-1 -right-1 bg-destructive rounded-full text-destructive-foreground p-0.5 animate-bounce shadow-sm ring-1 ring-background" title="Nuova versione disponibile!">
									<ArrowUp class="w-2.5 h-2.5" strokeWidth={1.5} />
								</div>
							{/if}
						</a>
						{#if data.showEditButton && $page.url.pathname === '/'}
						<div class="w-px h-4 bg-border mx-1"></div>
						<button class="p-1.5 transition-colors {appState.isEditMode ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}" onclick={() => appState.isEditMode = !appState.isEditMode} title={appState.isEditMode ? "DISATTIVA" : "MODIFICA"}>
							{#if appState.isEditMode}
								<Pencil class="h-5 w-5" strokeWidth={1.5} />
							{:else}
								<PencilOff class="h-5 w-5" strokeWidth={1.5} />
							{/if}
						</button>
						{/if}
						<div class="w-px h-4 bg-border mx-1"></div>
						<button class="p-1.5 text-destructive hover:opacity-80 transition-colors" onclick={async () => { await fetch('/api/auth', { method: 'POST', body: JSON.stringify({ action: 'logout' }) }); window.location.reload(); }} title="Esci dalla sessione">
							<LogOut class="h-5 w-5" strokeWidth={1.5} />
						</button>
					{:else}
						<button class="p-1.5 text-primary hover:text-primary/80 transition-colors" onclick={() => data.needsSetup ? goto('/setup') : appState.showLoginModal = true} title="Accedi">
							<LogIn class="h-5 w-5" strokeWidth={1.5} />
						</button>
					{/if}
				</div>
				<div class="flex items-center space-x-1">
										<button class="theme-mode-toggle p-2 text-muted-foreground hover:text-foreground transition-colors" onclick={() => { const isDark = document.documentElement.classList.toggle('dark'); localStorage.setItem('theview-color-scheme', isDark ? 'dark' : 'light'); }} title="CHIARO/SCURO">
						<Moon class="h-5 w-5" strokeWidth={1.5} />
					</button>
				</div>
			</div>
		</div>

		<!-- Mobile Header Tabs (if admin) -->
		{#if $page.url.pathname.startsWith('/admin')}
		<div class="md:hidden relative border-t border-border bg-card/90 w-full" style="-webkit-mask-image: linear-gradient(to right, transparent, black 16px, black calc(100% - 40px), transparent); mask-image: linear-gradient(to right, transparent, black 16px, black calc(100% - 40px), transparent);">
			<nav class="flex items-center space-x-2 px-4 py-3 overflow-x-auto no-scrollbar relative z-0">
			<a href="/admin?tab=services" data-sveltekit-replacestate data-sveltekit-noscroll class="px-4 py-2 text-sm font-bold uppercase tracking-wider rounded-xl transition-all whitespace-nowrap border {($page.url.searchParams.get('tab') || 'services') === 'services' ? 'border-primary/20 bg-primary/10 text-primary shadow-sm' : 'border-transparent text-muted-foreground hover:bg-muted'}">
																Servizi
															</a>
			<a href="/admin?tab=categories" data-sveltekit-replacestate data-sveltekit-noscroll class="px-4 py-2 text-sm font-bold uppercase tracking-wider rounded-xl transition-all whitespace-nowrap border {($page.url.searchParams.get('tab') || 'services') === 'categories' ? 'border-primary/20 bg-primary/10 text-primary shadow-sm' : 'border-transparent text-muted-foreground hover:bg-muted'}">
																Categorie
															</a>
			<a href="/admin?tab=discovery" data-sveltekit-replacestate data-sveltekit-noscroll class="px-4 py-2 text-sm font-bold uppercase tracking-wider rounded-xl transition-all whitespace-nowrap border {($page.url.searchParams.get('tab') || 'services') === 'discovery' ? 'border-primary/20 bg-primary/10 text-primary shadow-sm' : 'border-transparent text-muted-foreground hover:bg-muted'}">
																Discovery
															</a>
			<a href="/admin?tab=widgets" data-sveltekit-replacestate data-sveltekit-noscroll class="px-4 py-2 text-sm font-bold uppercase tracking-wider rounded-xl transition-all whitespace-nowrap border {($page.url.searchParams.get('tab') || 'services') === 'widgets' ? 'border-primary/20 bg-primary/10 text-primary shadow-sm' : 'border-transparent text-muted-foreground hover:bg-muted'}">
																Widgets
															</a>
			<a href="/admin?tab=settings" data-sveltekit-replacestate data-sveltekit-noscroll class="px-4 py-2 text-sm font-bold uppercase tracking-wider rounded-xl transition-all whitespace-nowrap border {($page.url.searchParams.get('tab') || 'services') === 'settings' ? 'border-primary/20 bg-primary/10 text-primary shadow-sm' : 'border-transparent text-muted-foreground hover:bg-muted'}">
																Impostazioni
															</a>
			<!-- spacer for right padding scroll -->
			<div class="w-1 shrink-0"></div>
			</nav>
		</div>
		{:else}
		<div class="md:hidden relative border-t border-border bg-card/90 w-full" style="-webkit-mask-image: linear-gradient(to right, transparent, black 16px, black calc(100% - 40px), transparent); mask-image: linear-gradient(to right, transparent, black 16px, black calc(100% - 40px), transparent);">
			<nav class="flex items-center space-x-2 px-4 py-3 overflow-x-auto no-scrollbar relative z-0">
			{#if data.showCategoriesMobile}
				{#each categories as category}
					{#if category.count > 0 || appState.isEditMode}
					<a href="/#{category.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}" class="flex-1 text-center px-4 py-2 text-sm font-bold uppercase tracking-wider rounded-xl transition-all whitespace-nowrap border border-border text-muted-foreground hover:bg-muted hover:text-foreground">
						{category.name}
					</a>
					{/if}
				{/each}
			{:else if data.customNavbarTitleMobile}
				<div class="flex-1 text-center px-4 py-2 text-sm font-bold uppercase tracking-wider text-foreground whitespace-nowrap">
					{data.customNavbarTitleMobile}
				</div>
			{/if}
			<!-- spacer for right padding scroll -->
			<div class="w-1 shrink-0"></div>
			</nav>
		</div>
		{/if}
	</header>
	{/if}

	<!-- Main Page Content -->
	<main class="flex-1 w-full max-w-7xl mx-auto focus:outline-none flex flex-col">
		<div class="py-6 px-4 sm:px-6 lg:px-8 flex-1">
			{@render children()}
		</div>
		<footer class="w-full py-4 px-4 sm:px-6 lg:px-8 flex justify-end items-center mt-auto">
			{#if versionInfo.currentVersion}
			<div class="flex items-center space-x-1 text-xs font-medium text-muted-foreground">
				<span>v{versionInfo.currentVersion}</span>
				{#if versionInfo.latestVersion && versionInfo.latestVersion !== versionInfo.currentVersion}
				<a href={versionInfo.url || 'https://github.com/g4s01/TheView/releases'} target="_blank" rel="noopener noreferrer" class="text-destructive hover:text-destructive/80 transition-colors animate-pulse flex items-center" title="Nuova versione {versionInfo.latestVersion} disponibile su GitHub!">
					<ArrowUp class="w-4 h-4" strokeWidth={1.5} />
				</a>
				{/if}
			</div>
			{/if}
		</footer>
	</main>
</div>

<LoginModal 
	show={appState.showLoginModal} 
	onClose={() => appState.showLoginModal = false} 
	onSuccess={() => {
		appState.showLoginModal = false;
		
		let hasServices = false;
		if (data.categories) {
			hasServices = data.categories.some((c: any) => c.count > 0);
		}

		if (appState.loginRedirectUrl) {
			const url = appState.loginRedirectUrl;
			appState.loginRedirectUrl = null;
			window.location.href = url;
		} else if (!hasServices) {
			window.location.href = '/admin?tab=discovery';
		} else {
			window.location.reload();
		}
	}} 
/>
</QueryClientProvider>
