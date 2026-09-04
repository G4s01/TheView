<script lang="ts">
	import './layout.css';
	import LoginModal from '$lib/components/LoginModal.svelte';
	import { appState } from '$lib/client/state.svelte';
	import { onMount } from 'svelte';
	
	let { children, data } = $props();

	// We'll pass categories down to the sidebar
	// data.categories will be populated by +layout.server.ts later
	let categories = $derived(data.categories || []);
	let showLogin = $state(false);

	onMount(() => {
		if (data.isAdmin) {
			appState.isEditMode = true;
		}
	});
</script>

<div class="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
	<!-- Topbar Header -->
	<header class="sticky top-0 z-40 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
		<div class="flex items-center justify-between px-4 sm:px-6 lg:px-8 h-16">
			<!-- Logo -->
			<div class="flex items-center space-x-4">
				<h1 class="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-500">
					TheView
				</h1>
			</div>

			<!-- Categories Horizontal Nav (Desktop) -->
			<nav class="hidden md:flex items-center space-x-1 flex-1 px-8 overflow-x-auto no-scrollbar">
				{#each categories as category}
					<a href="#{category.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}" class="px-3 py-1.5 text-sm font-medium rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-white transition-colors whitespace-nowrap">
						{category.name}
					</a>
				{/each}
			</nav>

			<div class="flex-1"></div>
			
			<!-- Global Actions (Theme toggle, etc) -->
			<div class="flex items-center space-x-2 sm:space-x-4">
				{#if data.isAdmin}
					<!-- Admin Gear (Stand-alone) -->
					<a 
						href="/admin"
						class="p-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
						title="Pannello Amministrazione"
					>
						<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
						</svg>
					</a>

					<!-- Edit Mode Toggle & Logout (Grouped) -->
					<div class="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-1 border border-gray-200 dark:border-gray-700 transition-colors {appState.isEditMode ? 'ring-2 ring-blue-500 border-blue-500' : ''}">
						<button 
							class="p-1.5 transition-colors {appState.isEditMode ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'}"
							onclick={() => appState.isEditMode = !appState.isEditMode}
							title={appState.isEditMode ? "Chiudi Modalità Modifica" : "Modalità Modifica"}
						>
							<!-- Pencil Icon -->
							<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
							</svg>
						</button>

						<div class="w-px h-4 bg-gray-300 dark:bg-gray-600 mx-1"></div>

						<!-- Logout Button (X) -->
						<button 
							class="p-1.5 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 transition-colors"
							onclick={async () => {
								await fetch('/api/auth', { method: 'POST', body: JSON.stringify({ action: 'logout' }) });
								window.location.reload();
							}}
							title="Esci dalla sessione"
						>
							<!-- X Icon -->
							<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
							</svg>
						</button>
					</div>
				{:else}
					<!-- Edit Mode (Login Trigger) -->
					<button 
						class="p-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
						onclick={() => showLogin = true}
						title="Accedi per Modificare"
					>
						<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
						</svg>
					</button>
				{/if}

				<!-- Theme Toggle -->
				<button 
					class="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
					onclick={() => document.documentElement.classList.toggle('dark')}
					title="Tema Chiaro/Scuro"
				>
					<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
					</svg>
				</button>
			</div>
		</div>
		
		<!-- Categories Horizontal Nav (Mobile) - scrolls horizontally -->
		<nav class="md:hidden flex items-center space-x-2 px-4 py-3 overflow-x-auto border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-800/90 no-scrollbar">
			{#each categories as category}
				<a href="#{category.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}" class="px-3 py-1 text-sm font-medium rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors whitespace-nowrap">
					{category.name}
				</a>
			{/each}
		</nav>
	</header>

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
