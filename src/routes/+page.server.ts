import { db } from "$lib/server/db";
import { services, categories } from "$lib/server/db/schema";
import { eq } from "drizzle-orm";
import { resolveIcon } from "$lib/server/iconResolver";

export async function load() {
  const cats = await db.select().from(categories).orderBy(categories.position);

  const allServices = await db
    .select({
      id: services.id,
      name: services.name,
      description: services.description,
      url: services.url,
      icon: services.icon,
      widgetType: services.widgetType,
      pingEnabled: services.pingEnabled,
      categoryId: services.categoryId,
      position: services.position,
      dockerImage: services.dockerImage,
      size: services.size,
    })
    .from(services)
    .orderBy(services.position);

  // Group services by category name
  const groupedServices: Record<string, any[]> = {};

  // Initialize all categories (even empty ones)
  for (const cat of cats) {
    groupedServices[cat.name] = [];
  }

  for (const cat of cats) {
    const catServices = allServices.filter((s) => s.categoryId === cat.id);
    if (catServices.length > 0) {
      const maxPos = catServices[catServices.length - 1].position || 0;
      const items = [];
      for (let i = 0; i <= maxPos; i++) {
        const s = catServices.find((service) => service.position === i);
        if (s) {
          const decorated = { ...s, category: cat.name } as any;
          decorated.iconDetails = resolveIcon(
            decorated.icon,
            decorated.dockerImage,
            decorated.name,
            decorated.url
          );
          items.push(decorated);
        } else {
          items.push({
            id: `__spacer_${cat.name}_${i}`,
            _isSpacer: true,
            size: "1x1",
          });
        }
      }
      groupedServices[cat.name] = items;
    }
  }

  return {
    groupedServices,
    categories: cats,
  };
}
