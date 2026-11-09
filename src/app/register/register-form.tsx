"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Loader2, Lock, Mail, User, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SchoolPicker, type SchoolOption } from "@/components/auth/school-picker";
import { authClient } from "@/lib/auth-client";

const YEARS_PRIMARY = ["Tahun 1", "Tahun 2", "Tahun 3", "Tahun 4", "Tahun 5", "Tahun 6"];
const YEARS_SECONDARY = ["Tingkatan 1", "Tingkatan 2", "Tingkatan 3", "Tingkatan 4", "Tingkatan 5"];

const schema = z
  .object({
    fullName: z.string().trim().min(3, "Masukkan nama penuh anda."),
    username: z
      .string()
      .trim()
      .regex(/^[a-zA-Z0-9][a-zA-Z0-9._]{2,19}$/, "ID pelajar: 3–20 aksara (huruf, nombor, titik atau garis bawah)."),
    displayName: z.string().trim().max(30, "Maksimum 30 aksara.").optional().or(z.literal("")),
    email: z.string().trim().email("Masukkan emel yang sah."),
    yearLabel: z.string().min(1, "Pilih tahun/tingkatan anda."),
    password: z.string().min(8, "Kata laluan mesti sekurang-kurangnya 8 aksara."),
    confirm: z.string(),
    terms: z.literal(true, { message: "Sila terima terma penggunaan." }),
  })
  .refine((values) => values.password === values.confirm, {
    path: ["confirm"],
    message: "Kata laluan tidak sepadan.",
  });

type RegisterValues = z.infer<typeof schema>;

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
  const [showPassword, setShowPassword] = useState(false);
  const [school, setSchool] = useState<SchoolOption | null>(null);
  const [schoolError, setSchoolError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [usernameTouched, setUsernameTouched] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterValues>({
    resolver: zodResolver(schema),
    defaultValues: { fullName: "", username: "", displayName: "", email: "", yearLabel: "", password: "", confirm: "" },
  });

  const yearOptions = school?.type === "secondary" ? YEARS_SECONDARY : YEARS_PRIMARY;

  function onSchoolSelect(next: SchoolOption | null) {
    setSchool(next);
    setSchoolError(next ? null : "Pilih sekolah anda untuk meneruskan.");
    setValue("yearLabel", "");
  }

  async function onSubmit(values: RegisterValues) {
    setFormError(null);
    if (!school) {
      setSchoolError("Pilih sekolah anda untuk meneruskan.");
      return;
    }
    const { error } = await authClient.signUp.email({
      email: values.email.trim(),
      password: values.password,
      name: values.fullName.trim(),
      username: values.username.trim(),
      displayName: values.displayName?.trim() || values.fullName.trim().split(" ")[0],
      schoolId: school.id,
      yearLabel: values.yearLabel,
    });

    if (error) {
      const code = error.code ?? "";
      if (code.includes("USERNAME")) {
        setError("username", { message: "ID pelajar ini telah digunakan. Cuba yang lain." });
      } else if (code.includes("EXISTS")) {
        setError("email", { message: "Emel ini sudah didaftarkan. Cuba log masuk." });
      } else {
        setFormError("Pendaftaran gagal. Sila semak butiran anda dan cuba lagi.");
      }
      return;
    }

    // Hard navigation: guarantees fresh server state with the new session.
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination -- full reload required so the client router cannot replay the signed-out redirect cache
    window.location.assign("/");
  }

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3.5" noValidate aria-busy={isSubmitting}>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="school-search">Sekolah</Label>
          <SchoolPicker selected={school} onSelect={onSchoolSelect} disabled={isSubmitting} />
          {schoolError && (
            <p className="text-xs font-medium text-destructive" role="alert">
              {schoolError}
            </p>
          )}
          <p className="text-[11px] leading-relaxed text-muted-foreground">
            Taip untuk mencari sekolah anda — pengalaman pembelajaran menyesuaikan sekolah anda.
          </p>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="fullName">Nama penuh</Label>
          <div className="relative">
            <User
              className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              id="fullName"
              autoComplete="name"
              placeholder="cth. Aiman Hakim bin Roslan"
              aria-invalid={!!errors.fullName}
              className="pl-10"
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
            <p className="text-xs font-medium text-destructive" role="alert">
              {errors.fullName.message}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="username">ID pelajar</Label>
          <div className="relative">
            <UserRound
              className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              id="username"
              autoCapitalize="none"
              autoComplete="username"
              spellCheck={false}
              placeholder="cth. aiman.hakim"
              aria-invalid={!!errors.username}
              className="pl-10"
              {...register("username", {
                onChange: () => {
                  setUsernameTouched(true);
                },
              })}
            />
          </div>
          {errors.username ? (
            <p className="text-xs font-medium text-destructive" role="alert">
              {errors.username.message}
            </p>
          ) : (
            <p className="text-[11px] text-muted-foreground">Gunakan ID ini atau emel anda untuk log masuk nanti.</p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="displayName">Nama paparan (pilihan)</Label>
          <Input
            id="displayName"
            placeholder="Nama yang dilihat rakan di Komuniti"
            aria-invalid={!!errors.displayName}
            {...register("displayName")}
          />
          {errors.displayName && (
            <p className="text-xs font-medium text-destructive" role="alert">
              {errors.displayName.message}
            </p>
          )}
        </div>

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
              {...register("email")}
            />
          </div>
          {errors.email ? (
            <p className="text-xs font-medium text-destructive" role="alert">
              {errors.email.message}
            </p>
          ) : (
            <p className="text-[11px] text-muted-foreground">
              Emel digunakan untuk pemulihan akaun dan pengesahan.
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="yearLabel">{school?.type === "secondary" ? "Tingkatan" : "Tahun"}</Label>
          <select
            id="yearLabel"
            disabled={!school || isSubmitting}
            aria-invalid={!!errors.yearLabel}
            className="h-11 w-full rounded-xl border border-input bg-card px-3.5 text-sm shadow-soft outline-none transition-shadow focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-60"
            {...register("yearLabel")}
          >
            <option value="">{school ? "Pilih tahun/tingkatan" : "Pilih sekolah dahulu"}</option>
            {yearOptions.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
          {errors.yearLabel && (
            <p className="text-xs font-medium text-destructive" role="alert">
              {errors.yearLabel.message}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="password">Kata laluan</Label>
          <div className="relative">
            <Lock
              className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Sekurang-kurangnya 8 aksara"
              aria-invalid={!!errors.password}
              className="pl-10 pr-11"
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute inset-y-0 right-0 grid w-11 place-items-center text-muted-foreground hover:text-foreground"
              aria-label={showPassword ? "Sembunyikan kata laluan" : "Tunjukkan kata laluan"}
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
          {errors.password && (
            <p className="text-xs font-medium text-destructive" role="alert">
              {errors.password.message}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="confirm">Sahkan kata laluan</Label>
          <Input
            id="confirm"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            placeholder="Taip semula kata laluan"
            aria-invalid={!!errors.confirm}
            {...register("confirm")}
          />
          {errors.confirm && (
            <p className="text-xs font-medium text-destructive" role="alert">
              {errors.confirm.message}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="flex items-start gap-2.5 text-sm leading-snug">
            <Checkbox className="mt-0.5" aria-invalid={!!errors.terms} {...register("terms")} />
            <span className="text-muted-foreground">
              Saya bersetuju dengan{" "}
              <span className="font-semibold text-teal underline underline-offset-2">terma penggunaan</span> dan{" "}
              <span className="font-semibold text-teal underline underline-offset-2">dasar privasi</span>.
            </span>
          </label>
          {errors.terms && (
            <p className="text-xs font-medium text-destructive" role="alert">
              {errors.terms.message}
            </p>
          )}
        </div>

        {formError && (
          <p className="rounded-xl bg-[#fff0ef] px-4 py-3 text-xs font-semibold text-[#be3139]" role="alert">
            {formError}
          </p>
        )}

        <Button type="submit" size="lg" disabled={isSubmitting} className="w-full">
          {isSubmitting ? (
            <>
              <Loader2 className="size-4 animate-spin" /> Sedang mendaftar…
            </>
          ) : (
            "Daftar sekarang"
          )}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm">
        <span className="text-muted-foreground">Sudah ada akaun? </span>
        <Link href="/login" className="font-semibold text-teal hover:underline">
          Log masuk
        </Link>
      </p>
    </div>
  );
}
