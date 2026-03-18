import { migrate } from "drizzle-orm/neon-http/migrator";
import { db } from "./db.js";

async function runMigrate() {
  console.log("Migration started");
  await migrate(db, { migrationsFolder: "./drizzle" });
  console.log("Migration completed");
  process.exit(0);
}

runMigrate().catch((err) => {
  console.error("Migration error:", err);
  process.exit(1);
});
