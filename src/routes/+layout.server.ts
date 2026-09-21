import { db } from "$lib/server/db";
import { categories, services } from "$lib/server/db/schema";

export async function load({ locals }) {
  let allGrids = [];
  try {
    const { dashboard_grids } = await import("$lib/server/db/schema");
    allGrids = await db
      .select()
      .from(dashboard_grids)
      .orderBy(dashboard_grids.position);

    if (allGrids.length === 0) {
      const inserted = await db
        .insert(dashboard_grids)
        .values({
          name: "MAIN",
          position: 0,
          show_header: false,
        })
        .returning();
      allGrids = inserted;
    }
  } catch (e) {
    // Fallback if not yet migrated
    allGrids = await db.select().from(categories).orderBy(categories.position);
  }

  const allServices = await db
    .select({ categoryId: services.categoryId, grid_id: services.grid_id, widgetType: services.widgetType })
    .from(services);
    
  const usedWidgetTypes = Array.from(new Set(allServices.map(s => s.widgetType).filter(t => t && t !== 'none' && t !== 'spacer')));

  const gridsWithCount = allGrids.map((g) => {
    const count = allServices.filter(
      (s) => (s.grid_id ?? s.categoryId) === g.id,
    ).length;
    return { ...g, count };
  });

  const { getSettings } = await import("$lib/server/settings");
  const rawSettings = await getSettings();
  const needsSetup =
    !rawSettings.adminPassword || rawSettings.adminPassword === "admin";
  console.log(
    "DEBUG: rawSettings.adminPassword =",
    rawSettings.adminPassword,
    "needsSetup =",
    needsSetup,
  );

  const settings = { ...rawSettings };
  if (settings.adminPassword) delete settings.adminPassword;
  if (settings.npmPassword) settings.npmPassword = "********";
  if (settings.qbit_password) settings.qbit_password = "********";
  if (settings.adguard_password) settings.adguard_password = "********";

  return {
    grids: gridsWithCount,
    isAdmin: locals.isAdmin,
    needsSetup,
    showCategoriesDesktop: settings.showCategoriesDesktop !== false,
    showCategoriesMobile: settings.showCategoriesMobile !== false,
    customNavbarTitleDesktop:
      settings.customNavbarTitleDesktop || settings.customNavbarTitle || "",
    customNavbarTitleMobile:
      settings.customNavbarTitleMobile || settings.customNavbarTitle || "",
    showCategoryCounts: settings.showCategoryCounts !== false,
    showServiceDescriptions: settings.showServiceDescriptions !== false,
    iconStyle: settings.iconStyle || "rounded-xl",
    stickyNavbar: settings.stickyNavbar !== false,
    showEditButton: settings.showEditButton !== false,
    editModeSidebarPosition: settings.editModeSidebarPosition || "right",
    editServiceSheetPosition: settings.editServiceSheetPosition || "right",
    settings,
    usedWidgetTypes,
  };
}
