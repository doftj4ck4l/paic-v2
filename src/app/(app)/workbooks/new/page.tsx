import type { Metadata } from "next";
import { PageHeader, PageShell } from "@/components/studio/shell";
import { NewWorkbookForm } from "./new-workbook-form";

export const metadata: Metadata = { title: "Buku Kerja Baharu" };

export default async function NewWorkbookPage({ searchParams }: {
  searchParams: Promise<{ mode?: string }>;
}) {
  const { mode } = await searchParams;
  const aiMode = mode === "ai";
  return (
    <PageShell className="max-w-[680px]">
      <PageHeader
        title={aiMode ? "Bina buku kerja dengan AI" : "Buku kerja baharu"}
        description={aiMode
          ? "Sediakan tajuk dan topik pembelajaran untuk ruang kerja AI anda."
          : "Cipta ruang kerja AI anda sendiri — tambah sumber, tanya soalan dan jana bahan ulang kaji."}
        backHref="/workbooks"
        backLabel="Kembali ke buku kerja"
      />
      <div className="rounded-[24px] border border-border bg-card p-6 shadow-soft">
        <NewWorkbookForm />
      </div>
    </PageShell>
  );
}
