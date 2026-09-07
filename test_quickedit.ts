import { db } from "./src/lib/server/db/index.js";
import { services } from "./src/lib/server/db/schema.js";
import { eq } from "drizzle-orm";

async function main() {
  const service = await db.select().from(services).limit(1);
  console.log("Before:", service);

  if (service.length > 0) {
    const s = service[0];
    const payload = {
        id: s.id,
        name: s.name + " edit",
        url: s.url,
        categoryId: s.categoryId.toString(), // SelectInput might pass string
        size: "2x2"
    };

    console.log("Updating with payload:", payload);
    try {
        await db.update(services).set({
            name: payload.name,
            categoryId: payload.categoryId,
            size: payload.size
        }).where(eq(services.id, payload.id));
        console.log("Success");
    } catch(e) {
        console.error("Error:", e);
    }
  }
}

main();
