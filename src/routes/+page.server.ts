import { db } from "$lib/server/db";
import { services, categories } from "$lib/server/db/schema";
import { eq } from "drizzle-orm";
import { getIconDetails } from "$lib/server/icons";

export async function load() {
  // Fetch all services joined with categories
  const allServices = await db
    .select({
      id: services.id,
      name: services.name,
      description: services.description,
      url: services.url,
      icon: services.icon,
      widgetType: services.widgetType,
      pingEnabled: services.pingEnabled,
      category: categories.name,
    })
    .from(services)
    .innerJoin(categories, eq(services.categoryId, categories.id));

  // Group and attach icon details
  const groupedServices = allServices.reduce(
    (acc, service) => {
      if (!acc[service.category]) {
        acc[service.category] = [];
      }

      const iconDetails = getIconDetails(service.icon);

      acc[service.category].push({
        ...service,
        iconDetails,
      });
      return acc;
    },
    {} as Record<string, any[]>,
  );

  return {
    groupedServices,
  };
}
