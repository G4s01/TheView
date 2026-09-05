import { db } from "$lib/server/db";
import { categories, services } from "$lib/server/db/schema";

export async function load({ locals }) {
  // Fetch categories for the sidebar
  const allCategories = await db
    .select()
    .from(categories)
    .orderBy(categories.position);

  const allServices = await db
    .select({ categoryId: services.categoryId })
    .from(services);

  const categoriesWithCount = allCategories.map((c) => {
    const count = allServices.filter((s) => s.categoryId === c.id).length;
    return { ...c, count };
  });

  const { getSettings } = await import("$lib/server/settings");
  const settings = getSettings();
  const needsSetup =
    !settings.adminPassword || settings.adminPassword === "admin";

  return {
    categories: categoriesWithCount,
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
  };
}
