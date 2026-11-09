import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth-shell";
import { getCurrentUser } from "@/lib/auth-session";
import { ForgotForm } from "./forgot-form";

export const metadata: Metadata = { title: "Lupa kata laluan" };

export default async function ForgotPasswordPage() {
  const user = await getCurrentUser();
  if (user) {
    redirect("/");
  }

  return (
    <AuthShell
      object="/assets/thiings/welcome-rocket.png"
      headline="Jangan risau, kami bantu."
      points={[
        "Pautan selamat yang sah 30 minit",
        "Hanya boleh digunakan sekali",
        "Pemulihan penuh disambung dalam Fasa 1",
      ]}
      title="Lupa kata laluan?"
      subtitle="Masukkan emel akaun anda dan kami akan menghantar pautan tetapan semula."
    >
      <ForgotForm />
    </AuthShell>
  );
}
