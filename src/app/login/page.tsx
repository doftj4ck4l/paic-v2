import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth-session";
import { LoginForm } from "./login-form";
import { LoginShell } from "./login-shell";

export const metadata: Metadata = { title: "Log masuk" };

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) {
    redirect("/");
  }

  return (
    <LoginShell>
      <LoginForm />
    </LoginShell>
  );
}
