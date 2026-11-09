import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth-shell";
import { getCurrentUser } from "@/lib/auth-session";
import { RegisterForm } from "./register-form";

export const metadata: Metadata = { title: "Daftar" };

export default async function RegisterPage() {
  const user = await getCurrentUser();
  if (user) {
    redirect("/");
  }

  return (
    <AuthShell
      object="/assets/thiings/graduation.png"
      headline="Sertai beribu pelajar."
      points={[
        "Satu akaun untuk semua subjek",
        "Diselia oleh sekolah anda",
        "Percuma untuk pelajar sekolah",
      ]}
      title="Cipta akaun anda"
      subtitle="Mulakan perjalanan pembelajaran anda hari ini."
    >
      <RegisterForm />
    </AuthShell>
  );
}
