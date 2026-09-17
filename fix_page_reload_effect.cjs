const fs = require('fs');
let code = fs.readFileSync('src/routes/+page.svelte', 'utf-8');

// Add hasAddedServices state
code = code.replace(/let isDiscoveryModalOpen = \$state\(false\);/, "let isDiscoveryModalOpen = $state(false);\n\tlet hasAddedServices = $state(false);");

// Update effect
const oldEffect = /let _wasModalOpen = false;\n\s*\$effect\(\(\) => \{\n\s*if \(isDiscoveryModalOpen\) \{\n\s*_wasModalOpen = true;\n\s*\} else if \(_wasModalOpen\) \{\n\s*window\.location\.reload\(\);\n\s*\}\n\s*\}\);/;

const newEffect = `let _wasModalOpen = false;
	$effect(() => {
		if (isDiscoveryModalOpen) {
			_wasModalOpen = true;
		} else if (_wasModalOpen) {
			_wasModalOpen = false;
			if (hasAddedServices) {
				window.location.reload();
			}
		}
	});`;

code = code.replace(oldEffect, newEffect);

// Pass prop to AdminDiscovery
code = code.replace(/<AdminDiscovery mode="dashboard" \/>/, `<AdminDiscovery mode="dashboard" onServiceAdded={() => hasAddedServices = true} />`);

// Change manual add so it also sets hasAddedServices and then reloads on close (to be consistent and clean)
// Wait, in manual add, it currently does: isDiscoveryModalOpen = false; window.location.reload();
// We can just do: hasAddedServices = true; isDiscoveryModalOpen = false; (which triggers the effect!)
code = code.replace(/isDiscoveryModalOpen = false;\n\s*window\.location\.reload\(\);/, `hasAddedServices = true;
										isDiscoveryModalOpen = false;`);

fs.writeFileSync('src/routes/+page.svelte', code);
