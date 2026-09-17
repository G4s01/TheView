const fs = require('fs');
let code = fs.readFileSync('src/routes/admin/components/SettingsAppearance.svelte', 'utf-8');

// Add editModeSidebarPosition to props
code = code.replace(/showEditButton = \$bindable\(\),/, 'showEditButton = $bindable(),\n\t\teditModeSidebarPosition = $bindable(),');
code = code.replace(/showEditButton: boolean;/, 'showEditButton: boolean;\n\t\teditModeSidebarPosition: string;');
code = code.replace(/showEditButton\n\t\t\];/, 'showEditButton,\n\t\t\teditModeSidebarPosition\n\t\t];');

// Add to UI
const uiAddition = `							<div class="flex flex-col gap-3 p-4 border border-border rounded-xl bg-background shadow-sm mt-4">
								<p class="text-xs font-bold text-foreground uppercase tracking-wider">Posizione Sidebar Edit Mode</p>
								<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
									<button type="button" onclick={() => editModeSidebarPosition = 'left'} class="flex flex-col items-center gap-3 p-4 rounded-xl {editModeSidebarPosition === 'left' ? 'border-2 border-primary bg-primary/10 shadow-sm' : 'border-2 border-transparent bg-card hover:bg-muted/50'} transition-all">
										<span class="text-[10px] font-bold text-foreground uppercase tracking-wider text-center">Sinistra</span>
									</button>
									<button type="button" onclick={() => editModeSidebarPosition = 'right'} class="flex flex-col items-center gap-3 p-4 rounded-xl {editModeSidebarPosition === 'right' ? 'border-2 border-primary bg-primary/10 shadow-sm' : 'border-2 border-transparent bg-card hover:bg-muted/50'} transition-all">
										<span class="text-[10px] font-bold text-foreground uppercase tracking-wider text-center">Destra</span>
									</button>
								</div>
							</div>`;

code = code.replace(/<\/div>\n\n\t\t\t\t\t\t\t<!-- Subgroup 2: Indice Griglie e Titoli -->/g, `${uiAddition}\n\t\t\t\t\t\t\t</div>\n\n\t\t\t\t\t\t\t<!-- Subgroup 2: Indice Griglie e Titoli -->`);

fs.writeFileSync('src/routes/admin/components/SettingsAppearance.svelte', code);
