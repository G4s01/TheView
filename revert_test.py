import re

with open("src/routes/admin/components/AdminDiscovery.svelte", "r") as f:
    content = f.read()

content = content.replace("""								<p class="text-white">TEST FORM RENDERED</p>
								<div class="hidden">""", """								<!-- Decoration line -->
								<div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-600"></div>

								<div class="space-y-4 relative w-full pt-2">""")

with open("src/routes/admin/components/AdminDiscovery.svelte", "w") as f:
    f.write(content)

