import type { Metadata } from "next";
import { PageHeader, PageShell } from "@/components/studio/shell";
import { PreferencesForm } from "./preferences-form";

export const metadata: Metadata = { title: "Keutamaan" };

export default function PreferencesPage() {
  return (
    <PageShell className="max-w-[640px]">
      <PageHeader
        title="Keutamaan"
        description="Bahasa, kebolehcapaian dan pemberitahuan."
        backHref="/settings"
        backLabel="Kembali ke tetapan"
      />
      <div className="rounded-[24px] border border-border bg-card p-6 shadow-soft">
        <PreferencesForm />
      </div>
    </PageShell>
  );
}
