import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { DEMO_LEVEL_COOKIE } from "@/lib/demo-constants";
import { LoginForm } from "./login-form";
import { LoginShell } from "./login-shell";

export const metadata: Metadata = { title: "Log masuk" };

export default async function LoginPage() {
  const store = await cookies();
  if (store.get(DEMO_LEVEL_COOKIE)) {
    redirect("/");
  }

  return (
    <LoginShell>
      <LoginForm />
    </LoginShell>
  );
}
