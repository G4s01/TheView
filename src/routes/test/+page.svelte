<script lang="ts">
  import TextInput from '$lib/components/ui/TextInput.svelte';
  import { onMount } from 'svelte';
  
  let val = $state('');
  
  onMount(() => {
     setTimeout(() => val = "HELLO", 500);
  });
</script>
<TextInput label="Test" bind:value={val} />
<p>Value: {val}</p>
