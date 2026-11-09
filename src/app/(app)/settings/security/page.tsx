import type { Metadata } from "next";
import { PageHeader, PageShell } from "@/components/studio/shell";
import { SecurityForm } from "./security-form";

export const metadata: Metadata = { title: "Keselamatan" };

export default function SecurityPage() {
  return (
    <PageShell className="max-w-[640px]">
      <PageHeader
        title="Keselamatan"
        description="Tukar kata laluan dan urus sesi akaun anda."
        backHref="/settings"
        backLabel="Kembali ke tetapan"
      />
      <div className="flex flex-col gap-4">
        <div className="rounded-[24px] border border-border bg-card p-6 shadow-soft">
          <h2 className="text-sm font-bold">Tukar kata laluan</h2>
          <div className="mt-4">
            <SecurityForm />
          </div>
        </div>
        <div className="flex items-center justify-between gap-4 rounded-[22px] border border-border bg-card p-5 shadow-soft">
          <div>
            <h2 className="text-sm font-bold">Sesi aktif</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Peranti semasa · pelayar ini · demo
            </p>
          </div>
          <button
            type="button"
            disabled
            title="Pengurusan sesi disambung dalam Fasa 1"
            className="inline-flex h-10 items-center rounded-xl border border-border bg-card px-4 text-xs font-semibold text-muted-foreground opacity-60"
          >
            Log keluar semua peranti
          </button>
        </div>
      </div>
    </PageShell>
  );
}
