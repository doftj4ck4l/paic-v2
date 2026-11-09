import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthLayout } from "@/components/auth/auth-layout";
import { getCurrentUser } from "@/lib/auth-session";
import { LoginForm } from "./login-form";
import { LoginHeader } from "./login-header";

export const metadata: Metadata = { title: "Log masuk" };

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) {
    redirect("/home");
  }

  return (
    <AuthLayout header={<LoginHeader />}>
      <LoginForm />
    </AuthLayout>
  );
}
