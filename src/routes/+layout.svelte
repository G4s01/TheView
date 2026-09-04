<script lang="ts">
	import './layout.css';
	import LoginModal from '$lib/components/LoginModal.svelte';
	import { appState } from '$lib/client/state.svelte';
	import { themeStore, themes } from '$lib/client/themeStore.svelte';
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	
	let { children, data } = $props();

	// We'll pass categories down to the sidebar
	// data.categories will be populated by +layout.server.ts later
	let categories = $derived(data.categories || []);
	let showLogin = $state(false);

	onMount(() => {
		themeStore.init();
		
		if (data.isAdmin) {
			appState.isEditMode = true;
		}
	});
</script>

<div class="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
	{#if $page.url.pathname !== '/setup'}
	<!-- Topbar Header -->
	<header class="sticky top-0 z-40 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
		<div class="w-full flex items-center justify-between px-4 sm:px-6 lg:px-8 h-16 max-w-[1920px] mx-auto">
			
			<!-- Left Column (Logo & Back) -->
			<div class="flex-1 flex items-center justify-start min-w-[200px]">
				<div class="flex items-center space-x-3">
					{#if $page.url.pathname.startsWith('/admin')}
						<a href="/" class="flex items-center justify-center p-2 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-colors shadow-sm" title="Torna alla Dashboard">
							<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
						</a>
					{/if}
					<a href="/" class="flex items-center space-x-2 hover:opacity-80 transition-opacity">
						<img src="/favicon.svg" alt="TheView Logo" class="w-8 h-8" />
						<span class="hidden sm:inline text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-500">TheView</span>
					</a>
				</div>
			</div>

			<!-- Center Column (Nav Tabs) -->
			<div class="hidden md:flex w-full max-w-7xl flex-shrink-1 px-4">
				{#if $page.url.pathname.startsWith('/admin')}
					<nav class="flex items-center w-full space-x-3">
						<button onclick={() => appState.adminTab = 'services'} class="flex-1 text-center px-4 py-2 text-sm font-bold uppercase tracking-wider rounded-xl transition-all border {appState.adminTab === 'services' ? 'border-blue-200 bg-blue-100 text-blue-700 dark:border-blue-800 dark:bg-blue-900/50 dark:text-blue-300 shadow-sm' : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50'}">
							Servizi
						</button>
						<button onclick={() => appState.adminTab = 'categories'} class="flex-1 text-center px-4 py-2 text-sm font-bold uppercase tracking-wider rounded-xl transition-all border {appState.adminTab === 'categories' ? 'border-blue-200 bg-blue-100 text-blue-700 dark:border-blue-800 dark:bg-blue-900/50 dark:text-blue-300 shadow-sm' : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50'}">
							Categorie
						</button>
						<button onclick={() => appState.adminTab = 'discovery'} class="flex-1 text-center px-4 py-2 text-sm font-bold uppercase tracking-wider rounded-xl transition-all border {appState.adminTab === 'discovery' ? 'border-blue-200 bg-blue-100 text-blue-700 dark:border-blue-800 dark:bg-blue-900/50 dark:text-blue-300 shadow-sm' : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50'}">
							Discovery
						</button>
						<button onclick={() => appState.adminTab = 'settings'} class="flex-1 text-center px-4 py-2 text-sm font-bold uppercase tracking-wider rounded-xl transition-all border {appState.adminTab === 'settings' ? 'border-blue-200 bg-blue-100 text-blue-700 dark:border-blue-800 dark:bg-blue-900/50 dark:text-blue-300 shadow-sm' : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50'}">
							Impostazioni
						</button>
					</nav>
				{:else}
					<div class="relative w-full overflow-hidden flex items-center" style="-webkit-mask-image: linear-gradient(to right, transparent, black 32px, black calc(100% - 64px), transparent); mask-image: linear-gradient(to right, transparent, black 32px, black calc(100% - 64px), transparent);">
						<nav class="flex items-center space-x-2 w-full justify-start md:justify-center overflow-x-auto no-scrollbar relative z-0 px-2">
						{#each categories as category}
							{#if category.count > 0 || appState.isEditMode}
								<a href="/#{category.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}" class="flex-1 text-center px-4 py-2 text-sm font-bold uppercase tracking-wider rounded-xl transition-all whitespace-nowrap border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 hover:border-gray-300 dark:hover:bg-gray-800/50 dark:hover:border-gray-600">
									{category.name}
								</a>
							{/if}
						{/each}
					</nav>
					</div>
				{/if}
			</div>

			<!-- Right Column (Actions) -->
			<div class="flex-1 flex items-center justify-end min-w-[150px] space-x-2 sm:space-x-4">
				<div class="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-1 border border-gray-200 dark:border-gray-700 transition-colors {data.isAdmin && appState.isEditMode ? 'ring-2 ring-blue-500 border-blue-500' : ''}">
					{#if data.isAdmin}
						<a href="/admin" class="p-1.5 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors" title="Pannello Amministrazione">
							<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
						</a>
						<div class="w-px h-4 bg-gray-300 dark:bg-gray-600 mx-1"></div>
						<button class="p-1.5 transition-colors {appState.isEditMode ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'}" onclick={() => appState.isEditMode = !appState.isEditMode} title={appState.isEditMode ? "Chiudi Modalità Modifica" : "Modalità Modifica"}>
							<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
						</button>
						<div class="w-px h-4 bg-gray-300 dark:bg-gray-600 mx-1"></div>
						<button class="p-1.5 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 transition-colors" onclick={async () => { await fetch('/api/auth', { method: 'POST', body: JSON.stringify({ action: 'logout' }) }); window.location.reload(); }} title="Esci dalla sessione">
							<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
						</button>
					{:else}
						<button class="p-1.5 text-gray-400 hover:text-gray-900 dark:text-gray-500 dark:hover:text-white transition-colors" onclick={() => data.needsSetup ? goto('/setup') : showLogin = true} title="Sblocca per Amministrazione">
							<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
						</button>
						<div class="w-px h-4 bg-gray-300 dark:bg-gray-600 mx-1"></div>
						<button class="p-1.5 text-gray-400 hover:text-gray-900 dark:text-gray-500 dark:hover:text-white transition-colors" onclick={() => data.needsSetup ? goto('/setup') : showLogin = true} title="Sblocca per Modificare">
							<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
						</button>
						<div class="w-px h-4 bg-gray-300 dark:bg-gray-600 mx-1"></div>
						<button class="p-1.5 text-gray-400 hover:text-gray-900 dark:text-gray-500 dark:hover:text-white transition-colors" onclick={() => data.needsSetup ? goto('/setup') : showLogin = true} title="Sblocca Pannello">
							<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
						</button>
					{/if}
				</div>
				<div class="flex items-center space-x-1">
					<button class="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors" onclick={() => { const isDark = document.documentElement.classList.toggle('dark'); localStorage.setItem('theview-color-scheme', isDark ? 'dark' : 'light'); }} title="Tema Chiaro/Scuro">
						<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
					</button>
				</div>
			</div>
		</div>

		<!-- Mobile Header Tabs (if admin) -->
		{#if $page.url.pathname.startsWith('/admin')}
		<div class="md:hidden relative border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-800/90 w-full" style="-webkit-mask-image: linear-gradient(to right, transparent, black 16px, black calc(100% - 40px), transparent); mask-image: linear-gradient(to right, transparent, black 16px, black calc(100% - 40px), transparent);">
			<nav class="flex items-center space-x-2 px-4 py-3 overflow-x-auto no-scrollbar relative z-0">
			<button onclick={() => appState.adminTab = 'services'} class="px-4 py-2 text-sm font-bold uppercase tracking-wider rounded-xl transition-all whitespace-nowrap border {appState.adminTab === 'services' ? 'border-blue-200 bg-blue-100 text-blue-700 dark:border-blue-800 dark:bg-blue-900/50 dark:text-blue-300 shadow-sm' : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50'}">
				Servizi
			</button>
			<button onclick={() => appState.adminTab = 'categories'} class="px-4 py-2 text-sm font-bold uppercase tracking-wider rounded-xl transition-all whitespace-nowrap border {appState.adminTab === 'categories' ? 'border-blue-200 bg-blue-100 text-blue-700 dark:border-blue-800 dark:bg-blue-900/50 dark:text-blue-300 shadow-sm' : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50'}">
				Categorie
			</button>
			<button onclick={() => appState.adminTab = 'discovery'} class="px-4 py-2 text-sm font-bold uppercase tracking-wider rounded-xl transition-all whitespace-nowrap border {appState.adminTab === 'discovery' ? 'border-blue-200 bg-blue-100 text-blue-700 dark:border-blue-800 dark:bg-blue-900/50 dark:text-blue-300 shadow-sm' : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50'}">
				Discovery
			</button>
			<button onclick={() => appState.adminTab = 'settings'} class="px-4 py-2 text-sm font-bold uppercase tracking-wider rounded-xl transition-all whitespace-nowrap border {appState.adminTab === 'settings' ? 'border-blue-200 bg-blue-100 text-blue-700 dark:border-blue-800 dark:bg-blue-900/50 dark:text-blue-300 shadow-sm' : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50'}">
				Impostazioni
			</button>
			<!-- spacer for right padding scroll -->
			<div class="w-1 shrink-0"></div>
			</nav>
		</div>
		{:else}
		<div class="md:hidden relative border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-800/90 w-full" style="-webkit-mask-image: linear-gradient(to right, transparent, black 16px, black calc(100% - 40px), transparent); mask-image: linear-gradient(to right, transparent, black 16px, black calc(100% - 40px), transparent);">
			<nav class="flex items-center space-x-2 px-4 py-3 overflow-x-auto no-scrollbar relative z-0">
			{#each categories as category}
				{#if category.count > 0 || appState.isEditMode}
				<a href="/#{category.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}" class="flex-1 text-center px-4 py-2 text-sm font-bold uppercase tracking-wider rounded-xl transition-all whitespace-nowrap border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 hover:border-gray-300 dark:hover:bg-gray-800/50 dark:hover:border-gray-600">
					{category.name}
				</a>
				{/if}
			{/each}
			<!-- spacer for right padding scroll -->
			<div class="w-1 shrink-0"></div>
			</nav>
		</div>
		{/if}
	</header>
	{/if}

	<!-- Main Page Content -->
	<main class="flex-1 w-full max-w-7xl mx-auto focus:outline-none">
		<div class="py-6 px-4 sm:px-6 lg:px-8">
			{@render children()}
		</div>
	</main>
</div>

<LoginModal 
	show={showLogin} 
	onClose={() => showLogin = false} 
	onSuccess={() => {
		showLogin = false;
		window.location.reload();
	}} 
/>
