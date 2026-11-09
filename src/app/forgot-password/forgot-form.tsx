"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowRight, Loader2, Mail, MailCheck, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";
import styles from "@/components/auth/auth-form.module.css";

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
      <div className={styles.successBox}>
        <span className={styles.successIcon} aria-hidden="true"><MailCheck /></span>
        <h2>Semak emel anda</h2>
        <p>
          Jika <strong>{sentTo}</strong> berdaftar, pautan tetapan semula kata laluan akan dihantar
          tidak lama lagi. Pautan itu sah selama 30 minit dan hanya boleh digunakan sekali.
        </p>
        <div className={styles.hintBox}>
          <ShieldCheck aria-hidden="true" />
          <span>Tidak jumpa emel? Semak folder spam atau promosi anda sebelum meminta pautan baharu.</span>
        </div>
        <div className={styles.successActions}>
          <Button asChild variant="dark" className={styles.resendButton}>
            <Link href="/login">Kembali ke log masuk</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)} className={styles.form} noValidate aria-busy={isSubmitting}>
        <div className={styles.field}>
          <Label htmlFor="email">Emel</Label>
          <div className={styles.inputWrap}>
            <Mail aria-hidden="true" />
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="nama@sekolah.edu.my"
              aria-invalid={!!errors.email}
              disabled={isSubmitting}
              {...register("email")}
            />
          </div>
          {errors.email && (
            <p className={styles.error} role="alert">{errors.email.message}</p>
          )}
        </div>

        <Button type="submit" size="lg" disabled={isSubmitting} className={styles.submit}>
          {isSubmitting ? (
            <><Loader2 className="size-4 animate-spin" aria-hidden="true" /> Sedang menghantar…</>
          ) : (
            <><span>Hantar pautan</span><ArrowRight className="size-4" aria-hidden="true" /></>
          )}
        </Button>
      </form>

      <p className={styles.register}>
        Ingat kata laluan anda? <Link href="/login">Log masuk</Link>
      </p>
    </div>
  );
}
