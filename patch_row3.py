import re

with open("src/routes/admin/components/AdminDiscovery.svelte", "r") as f:
    content = f.read()

# I will replace the Row 3 div completely
row3_start = """									<!-- Row 3: Icona, Widget, Ping -->
									<div class="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">"""
row3_end = """									<button type="submit" class="inline-flex items-center px-6 py-2.5 border border-transparent rounded-xl shadow-md shadow-green-500/30 text-sm font-bold uppercase tracking-wider text-white bg-green-600 hover:bg-green-700 hover:shadow-lg focus:outline-none transition-all hover:scale-105">
										<svg class="-ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
										</svg>
										Aggiungi Servizio
									</button>
								</div>"""

row3_replacement = """									<!-- Row 3: Icona, Widget, Ping, Button -->
									<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
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
											<label class="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">Widget</label>
											<select name="widgetType" bind:value={ds.widgetType} class="block w-full px-4 py-2.5 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500">
												<option value="">Nessuno</option>
												<option value="qbittorrent">qBittorrent</option>
											</select>
										</div>
										<div class="pb-1.5 flex items-center">
											<label class="relative inline-flex items-center cursor-pointer">
												<input type="checkbox" name="pingEnabled" bind:checked={ds.pingEnabled} class="sr-only peer">
												<div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
												<span class="ml-3 text-xs sm:text-sm font-bold text-gray-900 dark:text-gray-300 uppercase tracking-wider">Ping</span>
											</label>
										</div>
										<div class="flex justify-end">
											<button type="submit" class="inline-flex items-center w-full justify-center px-4 py-2.5 border border-transparent rounded-xl shadow-md shadow-green-500/30 text-sm font-bold uppercase tracking-wider text-white bg-green-600 hover:bg-green-700 hover:shadow-lg focus:outline-none transition-all">
												<svg class="-ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
													<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
												</svg>
												Aggiungi
											</button>
										</div>
									</div>
								</div>"""

row3_regex = re.compile(re.escape(row3_start) + ".*?" + re.escape(row3_end), re.DOTALL)
content = row3_regex.sub(row3_replacement, content)

with open("src/routes/admin/components/AdminDiscovery.svelte", "w") as f:
    f.write(content)
