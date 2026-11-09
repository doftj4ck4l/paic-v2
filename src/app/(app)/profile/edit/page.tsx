import type { Metadata } from "next";
import { PageHeader, PageShell } from "@/components/studio/shell";
import { getDemoStudent } from "@/lib/demo-profile";
import { EditProfileForm } from "./edit-profile-form";

export const metadata: Metadata = { title: "Sunting Profil" };

export default async function EditProfilePage() {
  const student = await getDemoStudent();
  return (
    <PageShell className="max-w-[640px]">
      <PageHeader
        title="Sunting profil"
        description="Kemas kini nama paparan anda. Maklumat sekolah dikawal oleh pihak sekolah."
        backHref="/profile"
        backLabel="Kembali ke profil"
      />
      <div className="rounded-[24px] border border-border bg-card p-6 shadow-soft">
        <EditProfileForm initialName={student.fullName} initialPreferred={student.preferredName} />
      </div>
    </PageShell>
  );
}
