"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CheckCircle2, Eye, EyeOff, Loader2, LockKeyhole, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";
import styles from "@/components/auth/auth-form.module.css";

const schema = z
  .object({
    password: z.string().min(8, "Kata laluan mesti sekurang-kurangnya 8 aksara."),
    confirm: z.string(),
  })
  .refine((values) => values.password === values.confirm, {
    path: ["confirm"],
    message: "Kata laluan tidak sepadan.",
  });

type ResetValues = z.infer<typeof schema>;

function ResetFormInner() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const linkError = searchParams.get("error");
  const [showPassword, setShowPassword] = useState(false);
  const [done, setDone] = useState(false);
  const [tokenError, setTokenError] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetValues>({
    resolver: zodResolver(schema),
    defaultValues: { password: "", confirm: "" },
  });

  if (!token || linkError || tokenError) {
    return (
      <div className={styles.successBox}>
        <span className={styles.successIcon} style={{ background: "#ffe9e9", color: "#b3383e" }} aria-hidden="true">
          <ShieldAlert />
        </span>
        <h2>Pautan tidak sah atau telah tamat</h2>
        <p>
          Pautan tetapan semula hanya sah selama 30 minit dan sekali guna. Minta pautan baharu untuk
          meneruskan.
        </p>
        <div className={styles.successActions}>
          <Button asChild variant="dark" className={styles.resendButton}>
            <Link href="/forgot-password">Minta pautan baharu</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (done) {
    return (
      <div className={styles.successBox}>
        <span className={styles.successIcon} aria-hidden="true"><CheckCircle2 /></span>
        <h2>Kata laluan dikemas kini</h2>
        <p>Semua sesi lain telah ditamatkan. Log masuk dengan kata laluan baharu anda.</p>
        <div className={styles.successActions}>
          <Button asChild variant="dark" className={styles.resendButton}>
            <Link href="/login">Log masuk</Link>
          </Button>
        </div>
      </div>
    );
  }

  async function onSubmit(values: ResetValues) {
    setFormError(null);
    const { error } = await authClient.resetPassword({ newPassword: values.password, token: token! });
    if (error) {
      if ((error.code ?? "").includes("INVALID_TOKEN") || (error.status ?? 0) === 400) {
        setTokenError(true);
        return;
      }
      setFormError("Tetapan semula gagal. Sila cuba lagi.");
      return;
    }
    setDone(true);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={styles.form} noValidate aria-busy={isSubmitting}>
      <div className={styles.field}>
        <Label htmlFor="password">Kata laluan baharu</Label>
        <div className={styles.inputWrap}>
          <LockKeyhole aria-hidden="true" />
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            placeholder="Sekurang-kurangnya 8 aksara"
            aria-invalid={!!errors.password}
            className={styles.passwordInput}
            disabled={isSubmitting}
            {...register("password")}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className={styles.passwordToggle}
            aria-label={showPassword ? "Sembunyikan kata laluan" : "Tunjukkan kata laluan"}
          >
            {showPassword ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
          </button>
        </div>
        {errors.password && (
          <p className={styles.error} role="alert">{errors.password.message}</p>
        )}
      </div>

      <div className={styles.field}>
        <Label htmlFor="confirm">Sahkan kata laluan</Label>
        <div className={styles.inputWrap}>
          <LockKeyhole aria-hidden="true" />
          <Input
            id="confirm"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            placeholder="Taip semula kata laluan baharu"
            aria-invalid={!!errors.confirm}
            disabled={isSubmitting}
            {...register("confirm")}
          />
        </div>
        {errors.confirm && (
          <p className={styles.error} role="alert">{errors.confirm.message}</p>
        )}
      </div>

      {formError && (
        <p className={`${styles.error} ${styles.formError}`} role="alert">{formError}</p>
      )}

      <Button type="submit" size="lg" disabled={isSubmitting} className={styles.submit}>
        {isSubmitting ? (
          <><Loader2 className="size-4 animate-spin" aria-hidden="true" /> Sedang menyimpan…</>
        ) : (
          "Simpan kata laluan"
        )}
      </Button>
    </form>
  );
}

export function ResetForm() {
  return (
    <Suspense fallback={null}>
      <ResetFormInner />
    </Suspense>
  );
}
