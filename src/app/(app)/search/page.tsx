import type { Metadata } from "next";
import { PageHeader, PageShell } from "@/components/studio/shell";
import { SearchClient } from "./search-client";

export const metadata: Metadata = { title: "Carian" };

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  return (
    <PageShell className="max-w-[760px]">
      <PageHeader title="Carian" description="Cari di seluruh buku kerja, topik dan hasil karya anda." />
      <SearchClient initialQuery={q ?? ""} />
    </PageShell>
  );
}
