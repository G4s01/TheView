import { db } from "./src/lib/server/db/index.js";
import { services } from "./src/lib/server/db/schema.js";
import { eq } from "drizzle-orm";

async function main() {
  const service = await db.select().from(services).limit(1);
  console.log("Found:", service);
  if (service.length > 0) {
    const stringId = service[0].id.toString();
    console.log("Updating with string id:", stringId);
    const res = await db.update(services).set({ name: service[0].name + " test" }).where(eq(services.id, stringId as any)).returning();
    console.log("Update returned:", res);
  }
}

main();
