const fs = require('fs');
let code = fs.readFileSync('src/routes/admin/components/AdminSettings.svelte', 'utf-8');

code = code.replace(/let showEditButton = \$state\(\$page\.data\.settings\?\.showEditButton !== false\);/, "let showEditButton = $state($page.data.settings?.showEditButton !== false);\n\tlet editModeSidebarPosition = $state($page.data.settings?.editModeSidebarPosition || 'right');");

code = code.replace(/body: JSON\.stringify\(\{ showCategoriesDesktop, showCategoriesMobile, customNavbarTitleDesktop, customNavbarTitleMobile, showCategoryCounts, showServiceDescriptions, iconStyle, stickyNavbar, showEditButton \}\)/, "body: JSON.stringify({ showCategoriesDesktop, showCategoriesMobile, customNavbarTitleDesktop, customNavbarTitleMobile, showCategoryCounts, showServiceDescriptions, iconStyle, stickyNavbar, showEditButton, editModeSidebarPosition })");

code = code.replace(/bind:showEditButton\n\t\t\{saveAppearanceSettings\}/, "bind:showEditButton\n\t\tbind:editModeSidebarPosition\n\t\t{saveAppearanceSettings}");

fs.writeFileSync('src/routes/admin/components/AdminSettings.svelte', code);
