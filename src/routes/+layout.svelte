<script lang="ts">
	import './layout.css';
	import Sidebar from '$lib/components/Sidebar.svelte';
	import LoginModal from '$lib/components/LoginModal.svelte';
	import { appState } from '$lib/client/state.svelte';
	
	let { children, data } = $props();

	// We'll pass categories down to the sidebar
	// data.categories will be populated by +layout.server.ts later
	let categories = $derived(data.categories || []);
	let showLogin = $state(false);
</script>

<div class="flex h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden">
	<!-- Sidebar -->
	<Sidebar {categories} />

	<!-- Main Content Area -->
	<div class="flex-1 flex flex-col w-0 overflow-hidden">
		<!-- Top header for mobile and general actions -->
		<header class="h-16 flex-shrink-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center px-4 justify-between sm:px-6 lg:px-8">
			<!-- Mobile menu button (TODO: implement toggle logic) -->
			<button class="md:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none">
				<span class="sr-only">Open sidebar</span>
				<svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
				</svg>
			</button>

			<div class="flex-1"></div>
			
			<!-- Global Actions (Theme toggle, etc) -->
			<div class="flex items-center space-x-2 sm:space-x-4">
				{#if data.isAdmin}
					<!-- Logout Button -->
					<button 
						class="p-2 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 transition-colors"
						onclick={async () => {
							await fetch('/api/auth', { method: 'POST', body: JSON.stringify({ action: 'logout' }) });
							window.location.reload();
						}}
						title="Esci"
					>
						<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
						</svg>
					</button>

					<!-- Admin Gear -->
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
				{/if}

				<!-- Wrench Icon (Edit Mode Toggle) -->
				<button 
					class="p-2 transition-colors {appState.isEditMode ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 rounded-md' : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'}"
					onclick={() => {
						if (!data.isAdmin) showLogin = true;
						else appState.isEditMode = !appState.isEditMode;
					}}
					title="Modalità Modifica"
				>
					<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.121 14.121L19 19m-4.879-4.879l-4.879-4.879M10.536 7.05a3 3 0 10-4.243 4.243l-4.243 4.242 1.414 1.415 4.242-4.243a3 3 0 104.243-4.243zM8.414 8.414A1.5 1.5 0 119.828 9.83 1.5 1.5 0 018.414 8.414z" />
					</svg>
				</button>

				<button 
					class="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
					onclick={() => document.documentElement.classList.toggle('dark')}
					title="Tema Chiaro/Scuro"
				>
					<!-- Moon/Sun Icon -->
					<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
					</svg>
				</button>
			</div>
		</header>

		<!-- Main Page Content -->
		<main class="flex-1 relative overflow-y-auto focus:outline-none">
			<div class="py-6 px-4 sm:px-6 lg:px-8">
				{@render children()}
			</div>
		</main>
	</div>
</div>

<LoginModal 
	show={showLogin} 
	onClose={() => showLogin = false} 
	onSuccess={() => {
		showLogin = false;
		window.location.reload();
	}} 
/>
