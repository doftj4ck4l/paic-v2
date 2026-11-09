import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthLayout } from "@/components/auth/auth-layout";
import layoutStyles from "@/components/auth/auth-layout.module.css";
import { getCurrentUser } from "@/lib/auth-session";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Log masuk" };

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) {
    redirect("/");
  }

  return (
    <AuthLayout
      title={<>Selamat kembali! <span className={layoutStyles.wave} role="img" aria-label="Hai">👋</span></>}
      subtitle="Log masuk untuk menyambung pembelajaran anda."
    >
      <LoginForm />
    </AuthLayout>
  );
}
