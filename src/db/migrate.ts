import { migrate } from "drizzle-orm/node-postgres/migrator";
import { db } from "./index";

async function main() {
  await migrate(db, { migrationsFolder: "./drizzle" });
  console.log("✓ migrations applied");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("✗ migration failed", error);
    process.exit(1);
  });
