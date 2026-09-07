<script lang="ts">
	import * as Card from "$lib/components/ui/card";
	import SettingsHeader from '$lib/components/ui/SettingsHeader.svelte';
	import { DatabaseBackup, Download, Upload, Loader2 } from "@lucide/svelte";

	let { showAlert, showConfirm } = $props<{
		showAlert: (title: string, message: string) => void;
		showConfirm: (title: string, message: string, onConfirm: () => void) => void;
	}>();

	let isUploadingBackup = $state(false);

	async function handleBackupUpload(e: Event) {
		const target = e.target as HTMLInputElement;
		if (!target.files || target.files.length === 0) return;
		
		const file = target.files[0];
		showConfirm("RIPRISTINO", "ATTENZIONE! STAI PER SOVRASCRIVERE TUTTI I DATI ATTUALI. SEI SICURO DI VOLER CONTINUARE?", async () => {
			isUploadingBackup = true;
			const formData = new FormData();
			formData.append('file', file);

			try {
				const res = await fetch('/api/backup/upload', {
					method: 'POST',
					body: formData
				});
				if (res.ok) {
					showAlert("RIPRISTINO COMPLETATO", "L'APP SI RIAVVIA PER APPLICARE LE MODIFICHE. ATTENDERE QUALCHE SECONDO...");
					setTimeout(() => window.location.reload(), 3000);
				} else {
					const err = await res.json();
					showAlert("Errore", "Errore durante il ripristino: " + err.error);
				}
			} catch (e) {
				showAlert("ERRORE", "ERRORE DI RETE");
			} finally {
				isUploadingBackup = false;
				target.value = '';
			}
		});
		
		// Reset value if user clicks cancel (the confirmation modal might not be blocking here but state resets)
		target.value = '';
	}
</script>

<Card.Root class="h-full flex flex-col">
	<SettingsHeader 
		title="Backup e Ripristino" 
		description="CONSERVA E RIPRISTINA I DATI DEL SISTEMA"
	>
		{#snippet icon()}
			<DatabaseBackup class="w-6 h-6" />
		{/snippet}
	</SettingsHeader>
	<Card.Content class="p-6">
		<div class="flex flex-col sm:flex-row gap-4">
			<a 
				href="/api/backup/download" 
				download
				class="inline-flex items-center justify-center px-4 py-2.5 bg-muted hover:bg-muted/80 text-foreground text-sm font-bold uppercase tracking-wider rounded-xl transition-colors border border-border"
			>
				<Download class="w-4 h-4 mr-2" />
				ESPORTA
			</a>
			
			<label class="relative inline-flex items-center justify-center px-4 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-bold uppercase tracking-wider rounded-xl transition-colors cursor-pointer disabled:opacity-50 {isUploadingBackup ? 'opacity-50 pointer-events-none' : ''}">
				{#if isUploadingBackup}
					<Loader2 class="animate-spin -ml-1 mr-2 h-4 w-4 text-current" strokeWidth={2} />
					Ripristino...
				{:else}
					<Upload class="w-4 h-4 mr-2" />
					IMPORTA
				{/if}
				<input 
					type="file" 
					accept=".db,.sqlite,.sqlite3" 
					class="hidden" 
					onchange={handleBackupUpload}
					disabled={isUploadingBackup}
				/>
			</label>
		</div>
	</Card.Content>
</Card.Root>

