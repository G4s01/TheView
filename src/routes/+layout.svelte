<script lang="ts">
	import './layout.css';
	import Sidebar from '$lib/components/Sidebar.svelte';
	
	let { children, data } = $props();

	// We'll pass categories down to the sidebar
	// data.categories will be populated by +layout.server.ts later
	let categories = $derived(data.categories || []);
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
			<div class="flex items-center space-x-4">
				<button 
					class="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
					onclick={() => document.documentElement.classList.toggle('dark')}
					title="Toggle Dark Mode"
				>
					<!-- Moon/Sun Icon (Mocking a generic circle for now) -->
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
