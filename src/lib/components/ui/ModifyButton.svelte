<script lang="ts">
	import { Settings2 } from "@lucide/svelte";
	let { onclick, class: className = "", title = "Modifica", id } = $props<{
		onclick: (e: MouseEvent) => void;
		class?: string;
		title?: string;
		id?: string;
	}>();
</script>

<button
	{id}
	type="button"
	{title}
	{onclick}
	class="inline-flex items-center justify-center size-9 bg-card border border-border text-foreground rounded-xl shadow-sm hover:bg-muted transition-colors focus:outline-none {className}"
>
	<Settings2 class="size-4" strokeWidth={2} />
</button>
