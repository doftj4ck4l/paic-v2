"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowRight, Eye, EyeOff, Info, Loader2, LockKeyhole, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { setDemoLevelCookie } from "@/lib/demo-session";
import styles from "./login.module.css";

const schema = z.object({
  identifier: z.string().trim().min(4, "Masukkan emel atau ID pelajar yang sah."),
  password: z.string().min(8, "Kata laluan mesti sekurang-kurangnya 8 aksara."),
});

type LoginValues = z.infer<typeof schema>;

export function LoginForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(schema),
    defaultValues: { identifier: "", password: "" },
  });

  async function onSubmit(values: LoginValues) {
    setFormError(null);
    // Demo only: preserve the existing simulated success and failure flows.
    await new Promise((r) => setTimeout(r, 600));
    if (values.password === "password123") {
      setFormError("Emel atau kata laluan tidak sah. Sila cuba lagi.");
      return;
    }
    setDemoLevelCookie("primary", remember);
    router.push("/");
  }

  return (
    <div>
      <div className={styles.demo}>
        <Info aria-hidden="true" />
        <div>
          <span className={styles.demoTitle}>Mod demo</span>
          <p>Log masuk dengan sebarang emel atau ID pelajar dan kata laluan (8+ aksara) untuk membuka profil demo.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className={styles.form} noValidate aria-busy={isSubmitting}>
        <div className={styles.field}>
          <Label htmlFor="identifier">Emel atau ID pelajar</Label>
          <div className={styles.inputWrap}>
            <UserRound aria-hidden="true" />
            <Input
              id="identifier"
              autoComplete="username"
              autoCapitalize="none"
              spellCheck={false}
              placeholder="nama@sekolah.edu.my"
              disabled={isSubmitting}
              aria-invalid={!!errors.identifier}
              aria-describedby={errors.identifier ? "identifier-error" : undefined}
              {...register("identifier")}
            />
          </div>
          {errors.identifier && (
            <p id="identifier-error" className={styles.error} role="alert">{errors.identifier.message}</p>
          )}
        </div>

        <div className={styles.field}>
          <Label htmlFor="password">Kata laluan</Label>
          <div className={styles.inputWrap}>
            <LockKeyhole aria-hidden="true" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="Masukkan kata laluan"
              disabled={isSubmitting}
              aria-invalid={!!errors.password}
              aria-describedby={errors.password ? "password-error" : undefined}
              className={styles.passwordInput}
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className={styles.passwordToggle}
              aria-label={showPassword ? "Sembunyikan kata laluan" : "Tunjukkan kata laluan"}
              aria-pressed={showPassword}
            >
              {showPassword ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
            </button>
          </div>
          {errors.password && (
            <p id="password-error" className={styles.error} role="alert">{errors.password.message}</p>
          )}
        </div>

        <div className={styles.formOptions}>
          <label className={styles.remember}>
            <input type="checkbox" checked={remember} onChange={(event) => setRemember(event.target.checked)} disabled={isSubmitting} />
            Ingat saya
          </label>
          <Link href="/forgot-password">Lupa kata laluan?</Link>
        </div>

        {formError && (
          <p className={`${styles.error} ${styles.formError}`} role="alert">{formError}</p>
        )}

        <Button type="submit" size="lg" disabled={isSubmitting} className={styles.submit}>
          {isSubmitting ? (
            <><Loader2 className="size-4 animate-spin" aria-hidden="true" /> Sedang log masuk…</>
          ) : (
            <><span>Log masuk</span><ArrowRight className="size-4" aria-hidden="true" /></>
          )}
        </Button>
      </form>

      <div className={styles.divider} aria-hidden="true">ATAU</div>
      <div className={styles.socialOptions}>
        <Button variant="white" type="button" disabled className={styles.socialButton} aria-describedby="social-hint">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path fill="#4285F4" d="M21.6 12.2c0-.7-.1-1.4-.2-2.1H12v4h5.4a4.6 4.6 0 0 1-2 3v2.5h3.2c1.9-1.8 3-4.3 3-7.4Z" />
            <path fill="#34A853" d="M12 22c2.7 0 5-.9 6.6-2.4l-3.2-2.5c-.9.6-2 1-3.4 1-2.6 0-4.8-1.8-5.6-4.1H3.1v2.6A10 10 0 0 0 12 22Z" />
            <path fill="#FBBC05" d="M6.4 14a6 6 0 0 1 0-4V7.4H3.1a10 10 0 0 0 0 9.2L6.4 14Z" />
            <path fill="#EA4335" d="M12 5.9c1.5 0 2.8.5 3.8 1.5l2.9-2.9A9.6 9.6 0 0 0 12 2a10 10 0 0 0-8.9 5.4L6.4 10c.8-2.3 3-4.1 5.6-4.1Z" />
          </svg>
          Google
        </Button>
        <Button variant="white" type="button" disabled className={styles.socialButton} aria-describedby="social-hint">
          <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="11" fill="#1877F2" /><path d="M13.7 22v-8.9h3l.5-3.4h-3.5V7.6c0-1 .3-1.7 1.8-1.7h1.9v-3c-.3 0-1.5-.1-2.8-.1-2.8 0-4.7 1.7-4.7 4.8v2.1H7v3.4h2.9V22Z" fill="white" /></svg>
          Facebook
        </Button>
      </div>
      <p id="social-hint" className={styles.socialHint}>Log masuk sosial akan datang.</p>
      <p className={styles.register}>Tiada akaun? <Link href="/register">Daftar di sini</Link></p>
    </div>
  );
}
