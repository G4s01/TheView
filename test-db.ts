import { db } from './src/lib/server/db/index.js';
import { services } from './src/lib/server/db/schema.js';
console.log(db.select().from(services).all());
