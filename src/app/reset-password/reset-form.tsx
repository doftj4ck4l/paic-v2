"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CheckCircle2, Eye, EyeOff, Loader2, Lock, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";

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
      <div className="flex flex-col items-center text-center">
        <span className="grid size-16 place-items-center rounded-2xl bg-[#FFE9E9] text-[#b3383e]">
          <ShieldAlert className="size-8" aria-hidden="true" />
        </span>
        <h2 className="mt-4 text-lg font-extrabold tracking-tight">
          {token || linkError || tokenError ? "Pautan tidak sah atau telah tamat" : "Pautan tidak lengkap"}
        </h2>
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
          Pautan tetapan semula hanya sah selama 30 minit dan sekali guna. Minta pautan baharu
          untuk meneruskan.
        </p>
        <Button asChild variant="dark" className="mt-5 w-full">
          <Link href="/forgot-password">Minta pautan baharu</Link>
        </Button>
      </div>
    );
  }

  if (done) {
    return (
      <div className="flex flex-col items-center text-center">
        <span className="grid size-16 place-items-center rounded-2xl bg-[#E7F6F4] text-teal">
          <CheckCircle2 className="size-8" aria-hidden="true" />
        </span>
        <h2 className="mt-4 text-lg font-extrabold tracking-tight">Kata laluan dikemas kini</h2>
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
          Semua sesi lain telah ditamatkan. Log masuk dengan kata laluan baharu anda.
        </p>
        <Button asChild variant="dark" className="mt-5 w-full">
          <Link href="/login">Log masuk</Link>
        </Button>
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
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate aria-busy={isSubmitting}>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="password">Kata laluan baharu</Label>
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
            disabled={isSubmitting}
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
          placeholder="Taip semula kata laluan baharu"
          aria-invalid={!!errors.confirm}
          disabled={isSubmitting}
          {...register("confirm")}
        />
        {errors.confirm && (
          <p className="text-xs font-medium text-destructive" role="alert">
            {errors.confirm.message}
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
            <Loader2 className="size-4 animate-spin" /> Sedang menyimpan…
          </>
        ) : (
          "Simpan kata laluan baharu"
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
