import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth-shell";
import { getCurrentUser } from "@/lib/auth-session";
import { ResetForm } from "./reset-form";

export const metadata: Metadata = { title: "Tetapkan semula kata laluan" };

export default async function ResetPasswordPage() {
  const user = await getCurrentUser();
  if (user) {
    redirect("/");
  }

  return (
    <AuthShell
      object="/assets/thiings/books.png"
      headline="Kata laluan baharu, permulaan baharu."
      points={[
        "Pautan selamat yang sah 30 minit",
        "Semua sesi lain akan ditamatkan",
        "Gunakan kata laluan yang kuat",
      ]}
      title="Tetapkan kata laluan baharu"
      subtitle="Pilih kata laluan baharu untuk akaun anda."
    >
      <ResetForm />
    </AuthShell>
  );
}
