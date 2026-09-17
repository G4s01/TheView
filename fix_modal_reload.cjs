const fs = require('fs');
let code = fs.readFileSync('src/routes/+page.svelte', 'utf-8');
const effect = `
	let _wasModalOpen = false;
	$effect(() => {
		if (isDiscoveryModalOpen) {
			_wasModalOpen = true;
		} else if (_wasModalOpen) {
			window.location.reload();
		}
	});
`;
code = code.replace(/let isDiscoveryModalOpen = \$state\(false\);/, "let isDiscoveryModalOpen = $state(false);\n" + effect);
fs.writeFileSync('src/routes/+page.svelte', code);
