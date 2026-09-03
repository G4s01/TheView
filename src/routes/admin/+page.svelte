<script lang="ts">
	import { enhance } from '$app/forms';
	
	let { data, form } = $props();
	
	let services = $derived(data.services);
	let categories = $derived(data.categories);
</script>

<svelte:head>
	<title>Admin - TheView</title>
</svelte:head>

<div class="max-w-7xl mx-auto space-y-8">
	<div>
		<h2 class="text-2xl font-bold text-gray-900 dark:text-white">Admin Panel</h2>
		<p class="mt-1 text-sm text-gray-500 dark:text-gray-400">Manage your homelab services.</p>
	</div>

	{#if form?.error}
		<div class="p-4 rounded-md bg-red-50 text-red-700 dark:bg-red-900/50 dark:text-red-200">
			{form.error}
		</div>
	{/if}

	<!-- Add New Service Form -->
	<div class="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
		<div class="px-4 py-5 sm:p-6">
			<h3 class="text-lg leading-6 font-medium text-gray-900 dark:text-white mb-4">Add New Service</h3>
			<form method="POST" action="?/createService" use:enhance class="space-y-4">
				<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
					<div>
						<label for="name" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Name *</label>
						<input type="text" name="name" id="name" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm">
					</div>
					<div>
						<label for="url" class="block text-sm font-medium text-gray-700 dark:text-gray-300">URL *</label>
						<input type="url" name="url" id="url" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm">
					</div>
					<div>
						<label for="categoryId" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Category *</label>
						<select name="categoryId" id="categoryId" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm">
							{#each categories as category}
								<option value={category.id}>{category.name}</option>
							{/each}
						</select>
					</div>
					<div>
						<label for="icon" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Icon (Optional)</label>
						<input type="text" name="icon" id="icon" placeholder="e.g. server" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm">
					</div>
					<div>
						<label for="description" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Description (Optional)</label>
						<input type="text" name="description" id="description" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm">
					</div>
					<div>
						<label for="widgetType" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Widget Type (Optional)</label>
						<select name="widgetType" id="widgetType" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm">
							<option value="">None</option>
							<option value="qbittorrent">qBittorrent</option>
						</select>
					</div>
				</div>
				<div class="flex items-center mt-4">
					<input id="pingEnabled" name="pingEnabled" type="checkbox" checked class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600">
					<label for="pingEnabled" class="ml-2 block text-sm text-gray-900 dark:text-gray-300">Enable Ping (Health Check)</label>
				</div>
				<div class="pt-2">
					<button type="submit" class="inline-flex justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
						Save Service
					</button>
				</div>
			</form>
		</div>
	</div>

	<!-- Services List -->
	<div class="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
		<ul class="divide-y divide-gray-200 dark:divide-gray-700">
			{#each services as service}
				<li class="px-4 py-4 sm:px-6 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50">
					<div>
						<p class="text-sm font-medium text-blue-600 dark:text-blue-400 truncate">{service.name}</p>
						<p class="text-sm text-gray-500 dark:text-gray-400 truncate">{service.url}</p>
					</div>
					<div class="flex items-center space-x-4">
						<form method="POST" action="?/deleteService" use:enhance>
							<input type="hidden" name="id" value={service.id}>
							<button type="submit" class="text-sm text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">
								Delete
							</button>
						</form>
					</div>
				</li>
			{/each}
		</ul>
	</div>
</div>

