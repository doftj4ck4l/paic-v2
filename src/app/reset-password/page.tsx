import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthLayout } from "@/components/auth/auth-layout";
import { getCurrentUser } from "@/lib/auth-session";
import { ResetForm } from "./reset-form";

export const metadata: Metadata = { title: "Tetapkan semula kata laluan" };

export default async function ResetPasswordPage() {
  const user = await getCurrentUser();
  if (user) {
    redirect("/");
  }

  return (
    <AuthLayout
      title="Kata laluan baharu"
      subtitle="Pilih kata laluan baharu untuk akaun anda."
    >
      <ResetForm />
    </AuthLayout>
  );
}
