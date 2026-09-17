import { db } from "$lib/server/db";
import { services, categories } from "$lib/server/db/schema";
import { eq } from "drizzle-orm";
import { resolveIcon } from "$lib/server/iconResolver";

export async function load() {
  const cats = await db.select().from(categories).orderBy(categories.position);
  // Ora proviamo a caricare dashboard_grids per chi ha già migrato o avviato la migrazione
  let grids: any[] = [];
  try {
    const { dashboard_grids } = await import("$lib/server/db/schema");
    grids = await db
      .select()
      .from(dashboard_grids)
      .orderBy(dashboard_grids.position);
      
    if (grids.length === 0) {
      const inserted = await db.insert(dashboard_grids).values({
        name: "MAIN",
        position: 0,
        show_header: false
      }).returning();
      grids = inserted;
    }
  } catch (e) {
    // Fallback se la migrazione non è ancora passata a DB
    grids = cats;
  }

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
      grid_id: services.grid_id,
      position: services.position,
      dockerImage: services.dockerImage,
      size: services.size,
      x: services.x,
      y: services.y,
      w: services.w,
      h: services.h,
    })
    .from(services);

  // Group services by grid_id (or category_id as fallback)
  const groupedServices: Record<string, any[]> = {};

  for (const grid of grids) {
    if (grid.id !== -1) groupedServices[grid.id.toString()] = [];
  }

  // The Inbox / Senza Categoria
  groupedServices["Inbox"] = [];

  for (const s of allServices) {
    const currentGridId = s.grid_id ?? s.categoryId;
    const grid = grids.find((g) => g.id === currentGridId);

    const decorated = { ...s, category: grid ? grid.name : "Inbox" } as any;

    // Sanitize legacy sizes for widgets
    const strict1x1Widgets = ["spacer", "docker", "dockhand", "duplicati"];
    if (
      decorated.widgetType &&
      !strict1x1Widgets.includes(decorated.widgetType) &&
      decorated.size === "1x1"
    ) {
      decorated.size = "2x1";
      // We should also adjust w/h if needed, but Gridstack will handle it on render
    }

    decorated.iconDetails = resolveIcon(
      decorated.icon,
      decorated.dockerImage,
      decorated.name,
      decorated.url,
    );

    if (grid && grid.id !== -1) {
      groupedServices[grid.id.toString()].push(decorated);
    } else {
      groupedServices["Inbox"].push(decorated);
    }
  }

  // Se l'inbox è vuoto, lo togliamo per pulizia in view mode (la logica UI deciderà se mostrarlo in edit mode)
  if (groupedServices["Inbox"].length === 0) {
    delete groupedServices["Inbox"];
  }

  return {
    groupedServices,
    categories: cats,
    grids: grids,
  };
}
