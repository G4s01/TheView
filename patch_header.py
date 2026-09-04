import re

with open("src/routes/admin/components/AdminDiscovery.svelte", "r") as f:
    content = f.read()

disc_header_start = """						<div class="flex items-center">
							<div class="flex-shrink-0">
								<span class="inline-flex items-center justify-center h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold uppercase shadow-sm">
									{ds.name.charAt(0)}
								</span>
							</div>
							<div class="ml-4">
								<p class="text-sm font-semibold text-gray-900 dark:text-white">{ds.name}</p>
								<p class="text-sm text-gray-500 dark:text-gray-400 mt-0.5 truncate max-w-xs sm:max-w-md">{ds.url || ds.description}</p>
								<div class="mt-2 flex items-center gap-1.5">"""
disc_header_end = """									{/if}
								</div>
							</div>
						</div>"""

with open("patch_disc_header.txt", "r") as f:
    disc_header_replacement = f.read().rstrip()

disc_header_regex = re.compile(re.escape(disc_header_start) + ".*?" + re.escape(disc_header_end), re.DOTALL)
content = disc_header_regex.sub(disc_header_replacement, content)

with open("src/routes/admin/components/AdminDiscovery.svelte", "w") as f:
    f.write(content)
