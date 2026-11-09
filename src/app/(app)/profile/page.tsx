import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Bell, Settings, UserRound } from "lucide-react";
import { PageHeader, PageShell } from "@/components/studio/shell";
import { Chip } from "@/components/studio/ui";
import { requireUser } from "@/lib/auth-session";

export const metadata: Metadata = { title: "Profil" };

export default async function ProfilePage() {
  const student = await requireUser();

  return (
    <PageShell className="max-w-[680px]">
      <PageHeader
        title="Profil saya"
        description="Maklumat akaun dan pengenalan sekolah anda."
        actions={
          <Link
            href="/profile/edit"
            className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-border bg-card px-4 text-sm font-semibold shadow-soft hover:bg-secondary"
          >
            <UserRound className="size-4" aria-hidden="true" /> Sunting profil
          </Link>
        }
      />

      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-5 rounded-[24px] border border-border bg-card p-6 shadow-soft">
          <span className="grid size-20 shrink-0 place-items-center rounded-full bg-gradient-to-br from-[#007a66] to-[#00856f] text-3xl font-extrabold text-white">
            {student.preferredName.slice(0, 1)}
          </span>
          <div className="min-w-0">
            <h2 className="text-lg font-extrabold">{student.fullName}</h2>
            <p className="mt-0.5 text-sm text-muted-foreground">{student.school}</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <Chip tone="purple">{student.yearLabel}</Chip>
              <Chip tone="neutral">{student.className}</Chip>
              <Chip tone="teal">Bahasa Melayu</Chip>
            </div>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <Link href="/settings" className="flex items-center gap-3.5 rounded-[20px] border border-border bg-card p-4 shadow-soft transition-transform hover:-translate-y-0.5 hover:shadow-soft-lg">
            <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-secondary text-muted-foreground">
              <Settings className="size-5" aria-hidden="true" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-bold">Tetapan akaun</span>
              <span className="mt-0.5 block text-xs text-muted-foreground">Keselamatan & keutamaan</span>
            </span>
            <ArrowRight className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
          </Link>
          <Link href="/notifications" className="flex items-center gap-3.5 rounded-[20px] border border-border bg-card p-4 shadow-soft transition-transform hover:-translate-y-0.5 hover:shadow-soft-lg">
            <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-secondary text-muted-foreground">
              <Bell className="size-5" aria-hidden="true" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-bold">Pemberitahuan</span>
              <span className="mt-0.5 block text-xs text-muted-foreground">Tugasan, kelas & penjanaan</span>
            </span>
            <ArrowRight className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
          </Link>
        </div>

        <p className="text-xs leading-relaxed text-muted-foreground">
          Maklumat sekolah dan tahun/tingkatan anda disahkan oleh pihak sekolah dan tidak boleh
          diubah sendiri — hubungi guru kelas untuk pembetulan.
        </p>
      </div>
    </PageShell>
  );
}
