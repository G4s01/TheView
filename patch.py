import re

with open("src/routes/admin/components/AdminDiscovery.svelte", "r") as f:
    content = f.read()

disc_form_start = """								<!-- Decoration line -->"""
disc_form_end = """								<div class="sm:col-span-2 mt-2 flex justify-end">
									<button type="submit" class="inline-flex items-center px-6 py-2.5"""

disc_form_replacement = """								<!-- Decoration line -->
								<div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-600"></div>

								<div class="space-y-4 relative w-full pt-2">
									<!-- Row 1: Nome, URL -->
									<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
										<div>
											<label class="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">Nome</label>
											<input type="text" name="name" bind:value={ds.name} required class="block w-full px-4 py-2.5 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500" />
										</div>
										<div>
											<label class="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">URL (Richiesto)</label>
											<input type="url" name="url" bind:value={ds.url} placeholder="es. https://..." required class="block w-full px-4 py-2.5 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500" />
										</div>
									</div>
									
									<!-- Row 2: Categoria, Descrizione -->
									<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
										<div>
											<label class="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">Categoria</label>
											<div class="flex flex-col gap-2">
												{#if ds.isCreatingCategory}
													<div class="flex gap-2" transition:slide|local>
														<input type="text" bind:value={ds.newCategoryName} placeholder="Nome categoria" class="block w-full px-4 py-2.5 text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500" />
														<button type="button" onclick={async () => {
															if (!ds.newCategoryName) { ds.isCreatingCategory = false; return; }
															try {
																const res = await fetch('/api/categories/create', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ name: ds.newCategoryName }) });
																if (res.ok) {
																	const data = await res.json();
																	localCategories = [...localCategories, data.category];
																	ds.categoryId = data.category.id;
																	ds.isCreatingCategory = false;
																}
															} catch(e) { console.error(e); }
														}} class="px-3 bg-green-600 text-white rounded-xl hover:bg-green-700 text-sm font-medium whitespace-nowrap">Crea</button>
														<button type="button" onclick={() => ds.isCreatingCategory = false} class="px-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 text-sm font-medium">X</button>
													</div>
												{:else}
													<select name="categoryId" bind:value={ds.categoryId} class="block w-full px-4 py-2.5 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500" onchange={(e) => { if ((e.target as HTMLSelectElement).value === 'new_category_trigger') { ds.isCreatingCategory = true; ds.categoryId = ''; } }}>
														<option value="" disabled selected={!ds.categoryId}>-- Seleziona Categoria --</option>
														{#each localCategories as cat}
															<option value={cat.id}>{cat.name}</option>
														{/each}
														<option value="new_category_trigger" class="font-bold text-blue-600">+ Nuova Categoria...</option>
													</select>
												{/if}
											</div>
										</div>
										<div>
											<label class="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">Descrizione</label>
											<input type="text" name="description" bind:value={ds.description} class="block w-full px-4 py-2.5 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500" />
										</div>
									</div>
									
									<!-- Row 3: Icona, Widget, Ping -->
									<div class="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
										<div>
											<label class="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">Icona</label>
											<div class="flex gap-2">
												<input type="text" name="icon" id={"icon_dsc_" + ds.id} value={ds.name} class="block w-full px-4 py-2.5 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500" />
												<label class="cursor-pointer bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-2.5 flex items-center justify-center transition-colors shadow-sm">
													<svg class="h-5 w-5 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
														<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
													</svg>
													<input type="file" accept="image/png, image/svg+xml, image/jpeg" class="hidden" onchange={async (e) => {
														const target = e.target as HTMLInputElement; const file = target.files?.[0];
														if (!file) return;
														
														const formData = new FormData();
														formData.append('file', file);
														const btn = target.parentElement as HTMLElement; btn.classList.add('opacity-50');
														
														try {
															const res = await fetch('/api/icons', { method: 'POST', body: formData });
															const data = await res.json();
															if (data.url) { (document.getElementById("icon_dsc_" + ds.id) as HTMLInputElement).value = data.url; }
														} catch (err) { console.error(err); } finally { btn.classList.remove('opacity-50'); }
													}} />
												</label>
											</div>
										</div>
										<div>
											<label class="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">Tipo Widget (Opzionale)</label>
											<select name="widgetType" bind:value={ds.widgetType} class="block w-full px-4 py-2.5 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500">
												<option value="">Nessuno</option>
												<option value="qbittorrent">qBittorrent</option>
											</select>
										</div>
										<div class="pt-2 md:pt-7">
											<label class="relative inline-flex items-center cursor-pointer">
												<input type="checkbox" name="pingEnabled" bind:checked={ds.pingEnabled} class="sr-only peer">
												<div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
												<span class="ml-3 text-xs sm:text-sm font-bold text-gray-900 dark:text-gray-300 uppercase tracking-wider">Abilita Ping (Health)</span>
											</label>
										</div>
									</div>
								</div>

								<div class="mt-6 flex justify-end border-t border-gray-100 dark:border-gray-700 pt-4">
									<button type="submit" class="inline-flex items-center px-6 py-2.5"""

disc_form_regex = re.compile(re.escape(disc_form_start) + ".*?" + re.escape(disc_form_end), re.DOTALL)
content = disc_form_regex.sub(disc_form_replacement, content)

with open("src/routes/admin/components/AdminDiscovery.svelte", "w") as f:
    f.write(content)
