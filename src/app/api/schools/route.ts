import { NextResponse, type NextRequest } from "next/server";
import { and, asc, eq, ilike } from "drizzle-orm";
import { db } from "@/db";
import { schools } from "@/db/schema";

/** Public school search used by the registration flow (search, not dropdown). */
export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q")?.trim() ?? "";

  const rows = await db
    .select({
      id: schools.id,
      name: schools.name,
      type: schools.type,
      state: schools.state,
      district: schools.district,
    })
    .from(schools)
    .where(query ? and(eq(schools.isActive, true), ilike(schools.name, `%${query}%`)) : eq(schools.isActive, true))
    .orderBy(asc(schools.name))
    .limit(8);

  return NextResponse.json({ schools: rows });
}
