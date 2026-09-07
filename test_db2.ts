import { db } from "./src/lib/server/db/index.js";
import { services } from "./src/lib/server/db/schema.js";
import { eq } from "drizzle-orm";

async function main() {
  const service = await db.select().from(services).limit(1);
  if (service.length > 0) {
    const stringId = service[0].id.toString();
    const stringCategoryId = service[0].categoryId.toString();
    console.log("Updating with string id:", stringId);

    // Simulate what Quickedit endpoint does
    const id = parseInt(stringId);
    const categoryId = parseInt(stringCategoryId);

    const res = await db
      .update(services)
      .set({ name: service[0].name + " (updated)" })
      .where(eq(services.id, id))
      .returning();
    console.log("Update returned:", res);
  }
}

main();
