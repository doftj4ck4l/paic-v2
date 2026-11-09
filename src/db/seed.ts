import { eq } from "drizzle-orm";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { auth } from "../lib/auth";
import { db } from "./index";
import { schools, users } from "./schema";

const SEED_SCHOOLS = [
  { name: "SK Bukit Ramun", slug: "sk-bukit-ramun", type: "primary", state: "Johor", district: "Kulai" },
  { name: "SMS Johor", slug: "sms-johor", type: "secondary", state: "Johor", district: "Kota Tinggi" },
  { name: "SK Bukit Senta", slug: "sk-bukit-senta", type: "primary", state: "Johor", district: "Segamat" },
  { name: "SK Pekan Dua", slug: "sk-pekan-dua", type: "primary", state: "Johor", district: "Muar" },
] as const;

const DEMO_PASSWORD = "DemoPelajar123";

const DEMO_ACCOUNTS = [
  {
    email: "aiman@demo.pixelspace.my",
    username: "aiman",
    name: "Aiman Hakim bin Roslan",
    displayName: "Aiman",
    schoolSlug: "sk-bukit-ramun",
    yearLabel: "Tahun 4",
    className: "4 Bestari",
    xp: 240,
    streakDays: 3,
  },
  {
    email: "nurul@demo.pixelspace.my",
    username: "nurul",
    name: "Nurul Izzah binti Rahman",
    displayName: "Nurul",
    schoolSlug: "sms-johor",
    yearLabel: "Tingkatan 4",
    className: "4 Cemerlang",
    xp: 1750,
    streakDays: 12,
  },
] as const;

async function main() {
  console.log("→ applying migrations…");
  await migrate(db, { migrationsFolder: "./drizzle" });
  console.log("✓ migrations applied");

  console.log("→ seeding schools…");
  for (const school of SEED_SCHOOLS) {
    const existing = await db.select().from(schools).where(eq(schools.slug, school.slug));
    if (existing.length === 0) {
      await db.insert(schools).values(school);
      console.log(`  + ${school.name}`);
    } else {
      console.log(`  = ${school.name} (exists)`);
    }
  }

  console.log("→ seeding demo accounts…");
  for (const account of DEMO_ACCOUNTS) {
    const existing = await db.select().from(users).where(eq(users.email, account.email));
    if (existing.length > 0) {
      console.log(`  = ${account.email} (exists)`);
      continue;
    }
    const [school] = await db.select().from(schools).where(eq(schools.slug, account.schoolSlug));
    await auth.api.signUpEmail({
      body: {
        email: account.email,
        password: DEMO_PASSWORD,
        name: account.name,
        username: account.username,
        displayName: account.displayName,
        schoolId: school.id,
        yearLabel: account.yearLabel,
        className: account.className,
      },
    });
    await db
      .update(users)
      .set({ emailVerified: true, xp: account.xp, streakDays: account.streakDays })
      .where(eq(users.email, account.email));
    console.log(`  + ${account.email} (${account.username}) — ${school.name}`);
  }

  console.log("\n✓ seed complete");
  console.log(`  demo login: aiman@demo.pixelspace.my / ${DEMO_PASSWORD} (SK Bukit Ramun, Rendah)`);
  console.log(`  demo login: nurul@demo.pixelspace.my / ${DEMO_PASSWORD} (SMS Johor, Menengah)`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("✗ seed failed", error);
    process.exit(1);
  });
