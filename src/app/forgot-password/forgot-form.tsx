"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Mail, MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Object3D } from "@/components/learning/object3d";
import { authClient } from "@/lib/auth-client";

const schema = z.object({
  email: z.string().trim().email("Masukkan emel yang sah."),
});

type ForgotValues = z.infer<typeof schema>;

export function ForgotForm() {
  const [sentTo, setSentTo] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "" },
  });

  async function onSubmit(values: ForgotValues) {
    // Always show the same confirmation — never reveal whether an account exists.
    await authClient
      .requestPasswordReset({ email: values.email.trim(), redirectTo: "/reset-password" })
      .catch(() => null);
    setSentTo(values.email.trim());
  }

  if (sentTo) {
    return (
      <div className="flex flex-col items-center text-center">
        <span className="grid size-24 place-items-center rounded-2xl bg-[#E7F6F4]">
          <Object3D src="/assets/thiings/books.png" size={70} />
        </span>
        <h2 className="mt-4 text-xl font-extrabold tracking-tight">Semak emel anda</h2>
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
          Jika <span className="font-semibold text-foreground">{sentTo}</span> berdaftar,
          pautan tetapan semula kata laluan akan dihantar tidak lama lagi. Pautan itu sah
          selama 30 minit dan hanya boleh digunakan sekali.
        </p>
        <div className="mt-4 flex w-full items-center gap-2.5 rounded-xl bg-[#E7F6F4] px-4 py-3 text-left">
          <MailCheck className="size-4 shrink-0 text-teal" aria-hidden="true" />
          <p className="text-xs text-slate-600">
            Mod pembangunan: jika SMTP belum dikonfigurasi, pautan boleh dilihat dalam konsol
            pelayan.
          </p>
        </div>
        <Button asChild variant="dark" className="mt-5 w-full">
          <Link href="/login">Kembali ke log masuk</Link>
        </Button>
      </div>
    );
  }

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate aria-busy={isSubmitting}>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">Emel</Label>
          <div className="relative">
            <Mail
              className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="nama@sekolah.edu.my"
              aria-invalid={!!errors.email}
              className="pl-10"
              disabled={isSubmitting}
              {...register("email")}
            />
          </div>
          {errors.email && (
            <p className="text-xs font-medium text-destructive" role="alert">
              {errors.email.message}
            </p>
          )}
        </div>

        <Button type="submit" size="lg" disabled={isSubmitting} className="w-full">
          {isSubmitting ? (
            <>
              <Loader2 className="size-4 animate-spin" /> Sedang menghantar…
            </>
          ) : (
            "Hantar pautan tetapan semula"
          )}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm">
        <span className="text-muted-foreground">Ingat kata laluan anda? </span>
        <Link href="/login" className="font-semibold text-teal hover:underline">
          Log masuk
        </Link>
      </p>
    </div>
  );
}
