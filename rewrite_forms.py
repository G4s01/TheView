import re

with open("src/routes/admin/components/AdminServices.svelte", "r") as f:
    content = f.read()

# REWRITE ADD FORM
add_form_regex = re.compile(r'<!-- Row 1: Nome, URL -->\s*<div class="grid.*?<div class="pt-4 flex justify-end border-t border-gray-100 dark:border-gray-700">\s*<button type="submit".*?Salva Servizio\s*</button>\s*</div>', re.DOTALL)
add_form_replacement = """				<!-- Row 1: Nome, URL -->
				<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
					<TextInput label="Nome" name="name" id="name" required />
					<TextInput label="URL (Richiesto)" type="url" name="url" id="url" required />
				</div>

				<!-- Row 2: Icona, Descrizione -->
				<div class="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start mt-4">
					<div class="flex gap-2 items-center">
						<TextInput label="Icona" name="icon" id="icon" placeholder="Nome o carica ->" />
						<label class="cursor-pointer border border-gray-200 dark:border-gray-700 rounded-xl w-[42px] h-[42px] flex items-center justify-center transition-colors bg-white dark:bg-gray-800 shadow-sm shrink-0 hover:bg-gray-50 dark:hover:bg-gray-700">
							<svg class="h-5 w-5 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
							</svg>
							<input type="file" accept="image/png, image/svg+xml, image/jpeg" class="hidden" onchange={async (e) => {
								const target = e.target; const file = target.files?.[0]; if (!file) return;
								const formData = new FormData(); formData.append('file', file);
								const btn = target.parentElement; btn.classList.add('opacity-50');
								try {
									const res = await fetch('/api/icons', { method: 'POST', body: formData });
									const data = await res.json();
									if (data.url) (document.getElementById("icon")).value = data.url;
								} catch (err) { console.error(err); } finally { btn.classList.remove('opacity-50'); }
							}} />
						</label>
					</div>
					<TextInput label="Descrizione" name="description" id="description" />
				</div>

				<!-- Row 3: Categoria, Ping, Widget, Button -->
				<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end mt-4">
					<div class="flex flex-col gap-2">
						{#if isCreatingCategory}
							<div class="flex gap-2 h-[42px]">
								<TextInput label="Nome" bind:value={newCategoryName} />
								<button type="button" onclick={async () => {
									if (!newCategoryName) { isCreatingCategory = false; return; }
									try {
										const res = await fetch('/api/categories/create', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ name: newCategoryName }) });
										if (res.ok) {
											const data = await res.json();
											localCategories = [...localCategories, data.category];
											newServiceCategoryId = data.category.id;
											isCreatingCategory = false;
										}
									} catch(e) { console.error(e); }
								}} class="px-3 bg-green-600 text-white rounded-xl hover:bg-green-700 text-sm font-medium whitespace-nowrap">Ok</button>
								<button type="button" onclick={() => isCreatingCategory = false} class="px-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 text-sm font-medium">X</button>
							</div>
						{:else}
							<SelectInput label="Categoria" name="categoryId" bind:value={newServiceCategoryId} required onchange={(e) => { if ((e.target).value === 'new_category_trigger') { isCreatingCategory = true; newServiceCategoryId = ''; } }}>
								<option value="" disabled selected={!newServiceCategoryId}>-- Seleziona --</option>
								{#each localCategories as category}
									<option value={category.id}>{category.name}</option>
								{/each}
								<option value="new_category_trigger" class="font-bold text-blue-600">+ Nuova...</option>
							</SelectInput>
						{/if}
					</div>

					<ToggleInput label="Ping" name="pingEnabled" value="true" />

					<SelectInput label="Widget" name="widgetType">
						<option value="">Nessuno</option>
						<option value="qbittorrent">qBittorrent</option>
					</SelectInput>

					<div>
						<button type="submit" class="w-full inline-flex items-center justify-center px-4 py-2.5 border border-transparent rounded-xl shadow-md shadow-green-500/30 text-sm font-bold uppercase tracking-wider text-white bg-green-600 hover:bg-green-700 hover:shadow-lg focus:outline-none transition-all h-[42px]">
							<svg class="-ml-1 mr-1.5 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
							</svg>
							Salva
						</button>
					</div>
				</div>"""

content = re.sub(add_form_regex, add_form_replacement, content)


# REWRITE EDIT FORM
edit_form_regex = re.compile(r'<div class="space-y-4 w-full">\s*<div class="grid.*?Salva Modifiche\s*</button>\s*</div>\s*</div>', re.DOTALL)
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

content = re.sub(edit_form_regex, edit_form_replacement, content)

with open("src/routes/admin/components/AdminServices.svelte", "w") as f:
    f.write(content)

