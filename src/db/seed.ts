import { eq } from "drizzle-orm";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { auth } from "../lib/auth";
import { WORKBOOK_CORPUS } from "../lib/generation/corpus";
import { db } from "./index";
import { schools, sources, users } from "./schema";

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
    role: "student",
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
    role: "student",
  },
  {
    email: "farah@demo.pixelspace.my",
    username: "farah",
    name: "Farah binti Ismail",
    displayName: "Cikgu Farah",
    schoolSlug: "sk-bukit-ramun",
    yearLabel: undefined,
    className: "4 Bestari",
    xp: 0,
    streakDays: 0,
    role: "teacher",
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
      .set({ emailVerified: true, xp: account.xp, streakDays: account.streakDays, role: account.role })
      .where(eq(users.email, account.email));
    console.log(`  + ${account.email} (${account.username}) — ${school.name} [${account.role}]`);
  }

  console.log("→ seeding demo workbook sources…");
  for (const [workbookId, entries] of Object.entries(WORKBOOK_CORPUS)) {
    for (const entry of entries) {
      const sourceId = `src_demo_${workbookId}_${entry.id}`;
      const existing = await db.select().from(sources).where(eq(sources.id, sourceId));
      if (existing.length > 0) {
        console.log(`  = ${entry.title} (exists)`);
        continue;
      }
      await db.insert(sources).values({
        id: sourceId,
        workbookId,
        ownerId: null,
        title: entry.title,
        kind: "text",
        status: "ready",
        fullText: entry.text,
        sizeLabel: "Sumber demo",
      });
      console.log(`  + ${entry.title}`);
    }
  }

  console.log("\n✓ seed complete");
  console.log(`  demo login: aiman@demo.pixelspace.my / ${DEMO_PASSWORD} (SK Bukit Ramun, Rendah)`);
  console.log(`  demo login: nurul@demo.pixelspace.my / ${DEMO_PASSWORD} (SMS Johor, Menengah)`);
  console.log(`  demo login: farah@demo.pixelspace.my / ${DEMO_PASSWORD} (Cikgu Farah, guru — SK Bukit Ramun)`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("✗ seed failed", error);
    process.exit(1);
  });
