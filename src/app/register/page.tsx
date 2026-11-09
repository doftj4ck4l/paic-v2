import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthLayout } from "@/components/auth/auth-layout";
import { getCurrentUser } from "@/lib/auth-session";
import { RegisterForm } from "./register-form";

export const metadata: Metadata = { title: "Daftar" };

export default async function RegisterPage() {
  const user = await getCurrentUser();
  if (user) {
    redirect("/home");
  }

  return (
    <AuthLayout
      title="Cipta akaun anda"
      subtitle="Daftar sebagai pelajar atau guru — sahkan emel selepas mendaftar."
    >
      <RegisterForm />
    </AuthLayout>
  );
}
