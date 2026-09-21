import fs from 'fs';

let content = fs.readFileSync('src/lib/components/ui/SearchableCombobox.svelte', 'utf8');
content = content.replace(
    /from "lucide-svelte"/,
    `from "@lucide/svelte"`
);
fs.writeFileSync('src/lib/components/ui/SearchableCombobox.svelte', content);
