<script lang="ts">
	// Props for categories
	let { categories = [] } = $props<{
		categories: { id: number; name: string }[];
	}>();
</script>

<aside class="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 h-screen hidden md:flex flex-col sticky top-0">
	<!-- Logo area -->
	<div class="h-16 flex items-center px-6 border-b border-gray-200 dark:border-gray-700">
		<h1 class="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-500">
			TheView
		</h1>
	</div>

	<!-- Navigation -->
	<nav class="flex-1 overflow-y-auto py-4">
		<ul class="space-y-1 px-3">
			<li>
				<a href="/" class="flex items-center px-3 py-2 text-sm font-medium rounded-md bg-blue-50 dark:bg-blue-900/50 text-blue-700 dark:text-blue-200">
					<!-- Icon: Home -->
					<svg class="mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
					</svg>
					All Services
				</a>
			</li>

			<div class="pt-4 pb-2">
				<p class="px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
					Categories
				</p>
			</div>
			
			{#each categories as category}
				<li>
					<a href="#{category.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}" class="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-white transition-colors">
						<span class="truncate">{category.name}</span>
					</a>
				</li>
			{/each}
		</ul>
	</nav>

	<!-- Footer / Settings -->
	<div class="p-4 border-t border-gray-200 dark:border-gray-700">
		<a href="/admin" class="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors">
			<!-- Icon: Settings -->
			<svg class="mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
			</svg>
			Admin Panel
		</a>
	</div>
</aside>

