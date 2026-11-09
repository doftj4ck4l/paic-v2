import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthLayout } from "@/components/auth/auth-layout";
import { getCurrentUser } from "@/lib/auth-session";
import { ForgotForm } from "./forgot-form";

export const metadata: Metadata = { title: "Lupa kata laluan" };

export default async function ForgotPasswordPage() {
  const user = await getCurrentUser();
  if (user) {
    redirect("/home");
  }

  return (
    <AuthLayout
      title="Lupa kata laluan?"
      subtitle="Masukkan emel akaun anda dan kami akan menghantar pautan tetapan semula."
    >
      <ForgotForm />
    </AuthLayout>
  );
}
