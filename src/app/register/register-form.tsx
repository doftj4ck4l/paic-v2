"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Loader2, Lock, Mail, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { setDemoLevelCookie } from "@/lib/demo-session";

const schema = z.object({
  fullName: z.string().min(3, "Masukkan nama penuh anda."),
  email: z.string().email("Masukkan emel yang sah."),
  password: z.string().min(8, "Kata laluan mesti sekurang-kurangnya 8 aksara."),
  terms: z.literal(true, { message: "Sila terima terma penggunaan." }),
});

type RegisterValues = z.infer<typeof schema>;

export function RegisterForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterValues>({
    resolver: zodResolver(schema),
    defaultValues: { fullName: "", email: "", password: "" },
  });

  async function onSubmit() {
    // Demo build: creates the demo session instead of a real account (Phase 1).
    await new Promise((r) => setTimeout(r, 600));
    setDemoLevelCookie("primary");
    router.push("/");
  }

  return (
    <div>
      <div className="rounded-xl bg-[#E7F6F4] px-4 py-3">
        <p className="text-xs font-bold text-teal">Mod demo</p>
        <p className="mt-0.5 text-xs leading-relaxed text-slate-600">
          Pendaftaran sebenar disambung dalam Fasa 1. Daftar dengan sebarang butiran yang sah
          untuk membuka profil demo.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-4 flex flex-col gap-3.5" noValidate>
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
              {...register("fullName")}
            />
          </div>
          {errors.fullName && (
            <p className="text-xs font-medium text-destructive" role="alert">
              {errors.fullName.message}
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
          {errors.email && (
            <p className="text-xs font-medium text-destructive" role="alert">
              {errors.email.message}
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
          <label className="flex items-start gap-2.5 text-sm leading-snug">
            <Checkbox className="mt-0.5" aria-invalid={!!errors.terms} {...register("terms")} />
            <span className="text-muted-foreground">
              Saya bersetuju dengan{" "}
              <span className="font-semibold text-teal underline underline-offset-2">
                terma penggunaan
              </span>{" "}
              dan{" "}
              <span className="font-semibold text-teal underline underline-offset-2">
                dasar privasi
              </span>
              .
            </span>
          </label>
          {errors.terms && (
            <p className="text-xs font-medium text-destructive" role="alert">
              {errors.terms.message}
            </p>
          )}
        </div>

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
