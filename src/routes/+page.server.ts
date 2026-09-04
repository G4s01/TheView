import { db } from "$lib/server/db";
import { services, categories } from "$lib/server/db/schema";
import { eq } from "drizzle-orm";
import { getIconDetails } from "$lib/server/icons";

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
    })
    .from(services)
    .orderBy(services.position);

  // Group services by category name
  const groupedServices: Record<string, any[]> = {};
  
  // Initialize all categories (even empty ones)
  for (const cat of cats) {
      groupedServices[cat.name] = [];
  }

  for (const service of allServices) {
      if (!service.categoryId) continue;
      const cat = cats.find(c => c.id === service.categoryId);
      if (cat) {
          const s = { ...service, category: cat.name } as any;
          if (s.icon) {
              s.iconDetails = getIconDetails(s.icon);
          } else {
              s.iconDetails = null;
          }
          groupedServices[cat.name].push(s);
      }
  }

  return {
    groupedServices,
    categories: cats,
  };
}
