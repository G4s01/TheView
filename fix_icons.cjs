const fs = require('fs');
let code = fs.readFileSync('src/routes/+page.svelte', 'utf-8');
code = code.replace(/import \{ Plus, Trash, EyeOff, Eye \} from '@lucide\/svelte';/, "import { Plus, Trash, EyeOff, Eye, Pencil, Layers, PlusSquare, Undo2, SquareDashed } from '@lucide/svelte';");
fs.writeFileSync('src/routes/+page.svelte', code);
