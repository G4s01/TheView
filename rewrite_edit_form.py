import re

with open("src/routes/admin/components/AdminServices.svelte", "r") as f:
    content = f.read()

edit_form_regex = re.compile(r'<div class="space-y-4 w-full">.*?Salva Modifiche\s*</button>\s*</div>\s*</div>', re.DOTALL)
edit_form_replacement = """<div class="space-y-4 w-full bg-white dark:bg-gray-800 p-1">
										<!-- Row 1: Nome, URL -->
										<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
											<TextInput label="Nome" name="name" value={service.name} required />
											<TextInput label="URL (Richiesto)" type="url" name="url" value={service.url} required />
										</div>
										
										<!-- Row 2: Icona, Descrizione -->
										<div class="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
											<div class="flex gap-2 items-center">
												<TextInput label="Icona" name="icon" id={"icon_edit_" + service.id} value={service.icon || ''} />
												<label class="cursor-pointer border border-gray-200 dark:border-gray-700 rounded-xl w-[42px] h-[42px] flex items-center justify-center transition-colors bg-white dark:bg-gray-800 shadow-sm shrink-0 hover:bg-gray-50 dark:hover:bg-gray-700">
													<svg class="h-5 w-5 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
														<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
													</svg>
													<input type="file" accept="image/png, image/svg+xml, image/jpeg" class="hidden" onchange={async (e) => {
														const target = e.target; const file = target.files?.[0];
														if (!file) return;
														const formData = new FormData(); formData.append('file', file);
														const btn = target.parentElement; btn.classList.add('opacity-50');
														try {
															const res = await fetch('/api/icons', { method: 'POST', body: formData });
															const data = await res.json();
															if (data.url) (document.getElementById("icon_edit_" + service.id)).value = data.url;
														} catch (err) { console.error(err); } finally { btn.classList.remove('opacity-50'); }
													}} />
												</label>
											</div>
											<TextInput label="Descrizione" name="description" value={service.description || ''} />
										</div>
										
										<!-- Row 3: Categoria, Ping, Widget, Button -->
										<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
											<SelectInput label="Categoria" name="categoryId" value={service.categoryId} required>
												{#each localCategories as cat}
													<option value={cat.id} selected={cat.id === service.categoryId}>{cat.name}</option>
												{/each}
											</SelectInput>

											<ToggleInput label="Ping" name="pingEnabled" value="true" checked={service.pingEnabled} />

											<SelectInput label="Widget" name="widgetType" value={service.widgetType || ''}>
												<option value="" selected={!service.widgetType}>Nessuno</option>
												<option value="qbittorrent" selected={service.widgetType === 'qbittorrent'}>qBittorrent</option>
											</SelectInput>

											<div class="flex gap-2 h-[42px]">
												<button type="button" onclick={() => editingServiceId = null} class="flex-1 inline-flex items-center justify-center border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm">
													X
												</button>
												<button type="submit" class="flex-[2] inline-flex items-center justify-center border border-transparent rounded-xl shadow-sm text-sm font-bold uppercase tracking-wider text-white bg-blue-600 hover:bg-blue-700 focus:outline-none transition-colors">
													<svg class="-ml-1 mr-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
														<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
													</svg>
													Salva
												</button>
											</div>
										</div>
									</div>"""

if re.search(edit_form_regex, content):
    content = re.sub(edit_form_regex, edit_form_replacement, content)
    with open("src/routes/admin/components/AdminServices.svelte", "w") as f:
        f.write(content)
    print("SUCCESS")
else:
    print("REGEX NOT FOUND")

