import { eq } from "drizzle-orm";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { auth } from "../lib/auth";
import { WORKBOOK_CORPUS } from "../lib/generation/corpus";
import { db } from "./index";
import { assignments, classMembers, classes, notifications, quizAttempts, schools, sources, users, workbookClassShares } from "./schema";

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

  console.log("→ seeding demo class…");
  const [farah] = await db.select().from(users).where(eq(users.email, "farah@demo.pixelspace.my"));
  const [aiman] = await db.select().from(users).where(eq(users.email, "aiman@demo.pixelspace.my"));
  if (farah && aiman) {
    const demoClassId = "cls_demo_bestari";
    const existingClass = await db.select().from(classes).where(eq(classes.id, demoClassId));
    if (existingClass.length === 0) {
      await db.insert(classes).values({
        id: demoClassId,
        schoolId: farah.schoolId,
        teacherId: farah.id,
        subjectId: "science",
        name: "4 Bestari",
        formLevel: "Tahun 4",
        joinCode: "BESTAR",
      });
      await db.insert(classMembers).values({ classId: demoClassId, studentId: aiman.id }).onConflictDoNothing();
      console.log("  + 4 Bestari (Cikgu Farah) — kod BESTAR, Aiman menyertai");
    } else {
      console.log("  = 4 Bestari (exists)");
    }
  }

  console.log("→ seeding demo assignment…");
  const [bestari] = await db.select().from(classes).where(eq(classes.id, "cls_demo_bestari"));
  if (bestari) {
    const demoAssignmentId = "asg_demo_kitaran";
    const existingAssignment = await db.select().from(assignments).where(eq(assignments.id, demoAssignmentId));
    if (existingAssignment.length === 0) {
      await db.insert(assignments).values({
        id: demoAssignmentId,
        classId: bestari.id,
        workbookId: "kitaran-air",
        createdBy: bestari.teacherId,
        title: "Kitaran Air — kuiz & slaid",
        instructions: "Tonton slaid dan jawab kuiz. Tandakan selesai apabila sudah siap.",
        moduleKinds: ["quizzes", "slides"],
        dueAt: new Date(Date.now() + 5 * 86_400_000),
      });
      await db.insert(workbookClassShares).values({ workbookId: "kitaran-air", classId: bestari.id }).onConflictDoNothing();
      console.log("  + Tugasan “Kitaran Air — nota & kuiz” (tarikh akhir +5 hari) + bahan dikongsi");
    } else {
      console.log("  = Tugasan demo (exists)");
    }
  }

  console.log("→ seeding demo progress…");
  if (farah && aiman) {
    const attemptId = "att_demo_aiman_1";
    const existingAttempt = await db.select().from(quizAttempts).where(eq(quizAttempts.id, attemptId));
    if (existingAttempt.length === 0) {
      await db.insert(quizAttempts).values({
        id: attemptId,
        userId: aiman.id,
        workbookId: "kitaran-air",
        artifactId: "art_demo_kitaran",
        score: 6,
        total: 8,
        answers: [1, 0, 1, 2, 0, 1, 1, 3],
        completedAt: new Date(Date.now() - 2 * 86_400_000),
      });
      console.log("  + Percubaan kuiz Aiman (6/8) pada Kitaran Air");
    } else {
      console.log("  = Percubaan demo (exists)");
    }

    const joinNotificationId = "ntf_demo_farah_join";
    const existingNotification = await db.select().from(notifications).where(eq(notifications.id, joinNotificationId));
    if (existingNotification.length === 0) {
      await db.insert(notifications).values([
        {
          id: joinNotificationId,
          userId: farah.id,
          type: "join",
          title: "Aiman menyertai 4 Bestari",
          body: aiman.name,
          href: "/subjects/cls_demo_bestari?tab=students",
        },
        {
          id: "ntf_demo_aiman_assignment",
          userId: aiman.id,
          type: "assignment",
          title: "Buku kerja ditugaskan: Kitaran Air — kuiz & slaid",
          body: "4 Bestari · 2 modul",
          href: "/subjects/cls_demo_bestari?tab=assignments",
        },
      ]);
      console.log("  + Pemberitahuan demo (penyertaan kelas + tugasan)");
    } else {
      console.log("  = Pemberitahuan demo (exists)");
    }
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
