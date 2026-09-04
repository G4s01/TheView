const fs = require('fs');
let content = fs.readFileSync('src/routes/admin/+page.svelte', 'utf-8');

// Replace fetchDiscovery
const oldFetch = `	async function fetchDiscovery() {
		isDiscovering = true;
		try {
			const res = await fetch('/api/discovery');`;
const newFetch = `	let npmUrl = $state('');
	let npmEmail = $state('');
	let npmPassword = $state('');
	
	// Carica credenziali da localStorage al mount
	$effect(() => {
		if (typeof window !== 'undefined' && !npmUrl && !npmEmail) {
			npmUrl = localStorage.getItem('npm_url') || '';
			npmEmail = localStorage.getItem('npm_email') || '';
			npmPassword = localStorage.getItem('npm_password') || '';
		}
	});

	async function fetchDiscovery() {
		if (npmUrl) localStorage.setItem('npm_url', npmUrl);
		if (npmEmail) localStorage.setItem('npm_email', npmEmail);
		if (npmPassword) localStorage.setItem('npm_password', npmPassword);

		isDiscovering = true;
		try {
			const headers: Record<string, string> = {};
			if (npmUrl) headers['x-npm-url'] = npmUrl;
			if (npmEmail) headers['x-npm-email'] = npmEmail;
			if (npmPassword) headers['x-npm-password'] = npmPassword;

			const res = await fetch('/api/discovery', { headers });`;
content = content.replace(oldFetch, newFetch);

// Add credentials form to the discovery tab
const oldHtml = `	{:else if activeTab === 'discovery'}
		<div class="space-y-6">
			<div class="flex items-center justify-between">
				<p class="text-sm text-gray-500 dark:text-gray-400">`;
const newHtml = `	{:else if activeTab === 'discovery'}
		<div class="space-y-6">
			<!-- Credenziali NPM -->
			<div class="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700 px-4 py-5 sm:p-6">
				<h3 class="text-lg leading-6 font-medium text-gray-900 dark:text-white mb-2">Credenziali Nginx Proxy Manager (Opzionale)</h3>
				<p class="text-sm text-gray-500 dark:text-gray-400 mb-4">Se inserite, TheView interrogherà NPM per auto-rilevare gli host.</p>
				<div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
					<div>
						<label class="block text-sm font-medium text-gray-700 dark:text-gray-300">URL NPM</label>
						<input type="url" bind:value={npmUrl} placeholder="http://172.17.0.1:81" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm">
					</div>
					<div>
						<label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
						<input type="email" bind:value={npmEmail} placeholder="admin@example.com" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm">
					</div>
					<div>
						<label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
						<input type="password" bind:value={npmPassword} class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm">
					</div>
				</div>
			</div>

			<div class="flex items-center justify-between">
				<p class="text-sm text-gray-500 dark:text-gray-400">`;
content = content.replace(oldHtml, newHtml);

fs.writeFileSync('src/routes/admin/+page.svelte', content);
