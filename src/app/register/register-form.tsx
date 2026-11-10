"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  ArrowLeft,
  ArrowRight,
  ChevronDown,
  Eye,
  EyeOff,
  GraduationCap,
  Info,
  Loader2,
  LockKeyhole,
  Mail,
  MailCheck,
  Presentation,
  ShieldCheck,
  Smile,
  User,
  UserRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SchoolPicker, type SchoolOption } from "@/components/auth/school-picker";
import { authClient } from "@/lib/auth-client";
import styles from "@/components/auth/auth-form.module.css";

const YEARS_PRIMARY = ["Tahun 1", "Tahun 2", "Tahun 3", "Tahun 4", "Tahun 5", "Tahun 6"];
const YEARS_SECONDARY = ["Tingkatan 1", "Tingkatan 2", "Tingkatan 3", "Tingkatan 4", "Tingkatan 5"];

const schema = z
  .object({
    role: z.enum(["student", "teacher"]),
    fullName: z.string().trim().min(3, "Masukkan nama penuh anda."),
    username: z
      .string()
      .trim()
      .regex(/^[a-zA-Z0-9][a-zA-Z0-9._]{2,19}$/, "ID: 3–20 aksara (huruf, nombor, titik atau garis bawah)."),
    displayName: z.string().trim().max(30, "Maksimum 30 aksara.").optional().or(z.literal("")),
    email: z.string().trim().email("Masukkan emel yang sah."),
    yearLabel: z.string(),
    password: z.string().min(8, "Kata laluan mesti sekurang-kurangnya 8 aksara."),
    confirm: z.string(),
    terms: z.literal(true, { message: "Sila terima terma penggunaan." }),
  })
  .refine((values) => values.password === values.confirm, {
    path: ["confirm"],
    message: "Kata laluan tidak sepadan.",
  })
  .refine((values) => values.role === "teacher" || values.yearLabel.trim().length > 0, {
    path: ["yearLabel"],
    message: "Pilih tahun/tingkatan anda.",
  });

type RegisterValues = z.infer<typeof schema>;

const STEP_LABELS = ["Sekolah", "Maklumat anda", "Kata laluan"];

function suggestUsername(fullName: string) {
  return fullName
    .toLowerCase()
    .replace(/\b(bin|binti|a\/l|a\/p)\b/g, " ")
    .replace(/[^a-z0-9\s]/g, "")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .join(".")
    .slice(0, 20);
}

export function RegisterForm() {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [showPassword, setShowPassword] = useState(false);
  const [school, setSchool] = useState<SchoolOption | null>(null);
  const [schoolError, setSchoolError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [usernameTouched, setUsernameTouched] = useState(false);
  const [sentEmail, setSentEmail] = useState<string | null>(null);
  const [resendState, setResendState] = useState<"idle" | "sending" | "sent">("idle");

  const {
    register,
    handleSubmit,
    setValue,
    setError,
    getValues,
    trigger,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterValues>({
    resolver: zodResolver(schema),
    defaultValues: { role: "student", fullName: "", username: "", displayName: "", email: "", yearLabel: "", password: "", confirm: "" },
  });

  const role = watch("role");
  const yearOptions = school?.type === "secondary" ? YEARS_SECONDARY : YEARS_PRIMARY;

  function onSchoolSelect(next: SchoolOption | null) {
    setSchool(next);
    setSchoolError(next ? null : "Pilih sekolah anda untuk meneruskan.");
    setValue("yearLabel", "");
  }

  function nextFromSchool() {
    if (!school) {
      setSchoolError("Pilih sekolah anda untuk meneruskan.");
      return;
    }
    if (role === "student" && !getValues("yearLabel")) {
      setError("yearLabel", { message: "Pilih tahun/tingkatan anda." });
      return;
    }
    setStep(2);
  }

  async function nextFromDetails() {
    const valid = await trigger(["fullName", "username", "displayName", "email"]);
    if (valid) setStep(3);
  }

  async function onSubmit(values: RegisterValues) {
    setFormError(null);
    if (!school) {
      setSchoolError("Pilih sekolah anda untuk meneruskan.");
      setStep(1);
      return;
    }
    const { error } = await authClient.signUp.email({
      email: values.email.trim(),
      password: values.password,
      name: values.fullName.trim(),
      username: values.username.trim(),
      displayName: values.displayName?.trim() || values.fullName.trim().split(" ")[0],
      schoolId: school.id,
      role: values.role,
      yearLabel: values.role === "student" ? values.yearLabel : undefined,
    });

    if (error) {
      const code = error.code ?? "";
      if (code.includes("USERNAME")) {
        setError("username", { message: "ID ini telah digunakan. Cuba yang lain." });
        setStep(2);
      } else if (code.includes("EXISTS")) {
        setError("email", { message: "Emel ini sudah didaftarkan. Cuba log masuk." });
        setStep(2);
      } else {
        setFormError("Pendaftaran gagal. Sila semak butiran anda dan cuba lagi.");
      }
      return;
    }

    // Hard verification: no session yet — the account activates once the
    // student clicks the link in the verification email.
    setSentEmail(values.email.trim());
    setStep(4);
  }

  async function resendVerification() {
    if (!sentEmail) return;
    setResendState("sending");
    await authClient.sendVerificationEmail({ email: sentEmail, callbackURL: "/home" });
    setResendState("sent");
  }

  /* ---------- Step 4: check your email ---------- */
  if (step === 4 && sentEmail) {
    return (
      <div className={styles.successBox}>
        <span className={styles.successIcon} aria-hidden="true"><MailCheck /></span>
        <h2>Semak emel anda</h2>
        <p>
          Kami menghantar pautan pengesahan ke <strong>{sentEmail}</strong>. Klik pautan itu untuk
          mengaktifkan akaun anda, kemudian log masuk.
        </p>
        <div className={styles.hintBox}>
          <ShieldCheck aria-hidden="true" />
          <span>
            Tidak jumpa emel? Semak folder spam atau promosi anda. Pautan pengesahan sah selama 1 jam
            dan boleh dihantar semula.
          </span>
        </div>
        <div className={styles.successActions}>
          {resendState === "sent" ? (
            <p className={styles.sentNote}><MailCheck aria-hidden="true" /> Pautan pengesahan baharu telah dihantar.</p>
          ) : (
            <button
              type="button"
              onClick={resendVerification}
              disabled={resendState === "sending"}
              className={styles.resendButton}
            >
              {resendState === "sending" ? (
                <><Loader2 className="size-3.5 animate-spin" aria-hidden="true" /> Sedang menghantar…</>
              ) : (
                "Hantar semula pautan pengesahan"
              )}
            </button>
          )}
        </div>
        <p className={styles.register}>
          Sudah sahkan emel? <Link href="/login">Log masuk</Link>
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className={styles.steps} aria-hidden="true">
        {[1, 2, 3].map((n) => (
          <span key={n} className={styles.stepDot} data-state={step === n ? "active" : step > n ? "done" : undefined} />
        ))}
      </div>
      <p className={styles.stepMeta}>
        <span>Langkah {step} daripada 3 · <strong>{STEP_LABELS[step - 1]}</strong></span>
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className={styles.form} noValidate aria-busy={isSubmitting}>
        {step === 1 && (
          <>
            <div className={styles.field}>
              <div className={styles.roleToggle} role="group" aria-label="Jenis akaun">
                <button
                  type="button"
                  className={styles.roleButton}
                  aria-pressed={role === "student"}
                  onClick={() => setValue("role", "student")}
                >
                  <GraduationCap aria-hidden="true" /> Pelajar
                </button>
                <button
                  type="button"
                  className={styles.roleButton}
                  aria-pressed={role === "teacher"}
                  onClick={() => {
                    setValue("role", "teacher");
                    setValue("yearLabel", "");
                  }}
                >
                  <Presentation aria-hidden="true" /> Guru
                </button>
              </div>
              {role === "teacher" && (
                <p className={styles.teacherNote}>
                  <Info aria-hidden="true" />
                  Akaun guru: cipta buku kerja, bahan pembelajaran dan kongsi dengan pelajar anda.
                </p>
              )}
            </div>

            <div className={styles.field}>
              <Label htmlFor="school-search">Sekolah</Label>
              <SchoolPicker selected={school} onSelect={onSchoolSelect} disabled={isSubmitting} />
              {schoolError && (
                <p className={styles.error} role="alert">{schoolError}</p>
              )}
              <p className={styles.hint}>Taip untuk mencari sekolah anda — pengalaman pembelajaran menyesuaikan sekolah anda.</p>
            </div>

            {role === "student" && (
              <div className={styles.field}>
                <Label htmlFor="yearLabel">{school?.type === "secondary" ? "Tingkatan" : "Tahun"}</Label>
                <div className={styles.inputWrap}>
                  <GraduationCap aria-hidden="true" />
                  <select
                    id="yearLabel"
                    disabled={!school || isSubmitting}
                    aria-invalid={!!errors.yearLabel}
                    {...register("yearLabel")}
                  >
                    <option value="">{school ? "Pilih tahun/tingkatan" : "Pilih sekolah dahulu"}</option>
                    {yearOptions.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className={styles.selectChevron} aria-hidden="true" />
                </div>
                {errors.yearLabel && (
                  <p className={styles.error} role="alert">{errors.yearLabel.message}</p>
                )}
              </div>
            )}

            <button type="button" onClick={nextFromSchool} disabled={!school} className={styles.continueButton}>
              Seterusnya <ArrowRight className="size-4" aria-hidden="true" />
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <div className={styles.field}>
              <Label htmlFor="fullName">Nama penuh</Label>
              <div className={styles.inputWrap}>
                <User aria-hidden="true" />
                <Input
                  id="fullName"
                  autoComplete="name"
                  placeholder="cth. Aiman Hakim bin Roslan"
                  aria-invalid={!!errors.fullName}
                  disabled={isSubmitting}
                  {...register("fullName", {
                    onChange: (event) => {
                      if (!usernameTouched && event.target.value.trim().length >= 3) {
                        setValue("username", suggestUsername(event.target.value));
                      }
                    },
                  })}
                />
              </div>
              {errors.fullName && (
                <p className={styles.error} role="alert">{errors.fullName.message}</p>
              )}
            </div>

            <div className={styles.field}>
              <Label htmlFor="username">{role === "student" ? "ID pelajar" : "ID guru"}</Label>
              <div className={styles.inputWrap}>
                <UserRound aria-hidden="true" />
                <Input
                  id="username"
                  autoCapitalize="none"
                  autoComplete="username"
                  spellCheck={false}
                  placeholder="cth. aiman.hakim"
                  aria-invalid={!!errors.username}
                  disabled={isSubmitting}
                  {...register("username", {
                    onChange: () => {
                      setUsernameTouched(true);
                    },
                  })}
                />
              </div>
              {errors.username ? (
                <p className={styles.error} role="alert">{errors.username.message}</p>
              ) : (
                <p className={styles.hint}>Gunakan ID ini atau emel anda untuk log masuk nanti.</p>
              )}
            </div>

            <div className={styles.field}>
              <Label htmlFor="displayName">Nama paparan (pilihan)</Label>
              <div className={styles.inputWrap}>
                <Smile aria-hidden="true" />
                <Input
                  id="displayName"
                  placeholder="Nama yang dilihat oleh orang lain"
                  aria-invalid={!!errors.displayName}
                  disabled={isSubmitting}
                  {...register("displayName")}
                />
              </div>
              {errors.displayName && (
                <p className={styles.error} role="alert">{errors.displayName.message}</p>
              )}
            </div>

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
              {errors.email ? (
                <p className={styles.error} role="alert">{errors.email.message}</p>
              ) : (
                <p className={styles.hint}>Kami akan hantar pautan pengesahan ke emel ini.</p>
              )}
            </div>

            <div className={styles.backRow}>
              <button type="button" onClick={() => setStep(1)} className={styles.backButton}>
                <ArrowLeft className="size-3.5" aria-hidden="true" /> Kembali
              </button>
              <button type="button" onClick={nextFromDetails} className={styles.continueButton} style={{ flex: 1 }}>
                Seterusnya <ArrowRight className="size-4" aria-hidden="true" />
              </button>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <div className={styles.field}>
              <Label htmlFor="password">Kata laluan</Label>
              <div className={styles.inputWrap}>
                <LockKeyhole aria-hidden="true" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Sekurang-kurangnya 8 aksara"
                  aria-invalid={!!errors.password}
                  disabled={isSubmitting}
                  className={styles.passwordInput}
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
                  placeholder="Taip semula kata laluan"
                  aria-invalid={!!errors.confirm}
                  disabled={isSubmitting}
                  {...register("confirm")}
                />
              </div>
              {errors.confirm && (
                <p className={styles.error} role="alert">{errors.confirm.message}</p>
              )}
            </div>

            <div className={styles.field}>
              <label className={styles.remember}>
                <Checkbox aria-invalid={!!errors.terms} {...register("terms")} />
                <span className={styles.hint}>
                  Saya bersetuju dengan <Link href="/terms" target="_blank" onClick={(event) => event.stopPropagation()}><strong>terma penggunaan</strong></Link> dan <Link href="/privacy" target="_blank" onClick={(event) => event.stopPropagation()}><strong>dasar privasi</strong></Link>.
                </span>
              </label>
              {errors.terms && (
                <p className={styles.error} role="alert">{errors.terms.message}</p>
              )}
            </div>

            {formError && (
              <p className={`${styles.error} ${styles.formError}`} role="alert">{formError}</p>
            )}

            <div className={styles.backRow}>
              <button type="button" onClick={() => setStep(2)} className={styles.backButton} disabled={isSubmitting}>
                <ArrowLeft className="size-3.5" aria-hidden="true" /> Kembali
              </button>
              <Button type="submit" size="lg" disabled={isSubmitting} className={styles.submit} style={{ flex: 1 }}>
                {isSubmitting ? (
                  <><Loader2 className="size-4 animate-spin" aria-hidden="true" /> Sedang mendaftar…</>
                ) : (
                  "Daftar sekarang"
                )}
              </Button>
            </div>
          </>
        )}
      </form>

      <p className={styles.register}>
        Sudah ada akaun? <Link href="/login">Log masuk</Link>
      </p>
    </div>
  );
}
