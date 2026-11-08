import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { AuthShell } from "@/components/auth-shell";
import { DEMO_LEVEL_COOKIE } from "@/lib/demo-constants";
import { RegisterForm } from "./register-form";

export const metadata: Metadata = { title: "Daftar" };

export default async function RegisterPage() {
  const store = await cookies();
  if (store.get(DEMO_LEVEL_COOKIE)) {
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
