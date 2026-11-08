import Link from "next/link";
import { Check } from "lucide-react";
import { Object3D } from "@/components/learning/object3d";

/**
 * Web-first auth shell in the Learning Studio language:
 * - Desktop (lg+): bright tinted panel with headline, feature list and a
 *   large floating 3D object; clean form column on the right.
 * - Mobile: compact brand row, object accent and the form in a soft card.
 */
export function AuthShell({
  object,
  headline,
  points,
  title,
  subtitle,
  children,
}: {
  object: string;
  headline: string;
  points: string[];
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[1.05fr_1fr]">
      {/* Illustration panel — desktop only */}
      <aside className="relative hidden flex-col overflow-hidden bg-[#E7F6F4] p-10 xl:p-14 lg:flex">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="grid size-9 place-items-center rounded-lg bg-teal text-sm font-black text-white">
            &gt;&gt;
          </span>
          <span className="text-base font-bold tracking-tight">Pixelspace AI Classroom</span>
        </Link>

        <div className="relative z-10 mt-14 max-w-md">
          <h2 className="text-3xl font-extrabold leading-[1.15] tracking-tight xl:text-4xl">
            {headline}
          </h2>
          <ul className="mt-6 flex flex-col gap-3">
            {points.map((point) => (
              <li key={point} className="flex items-center gap-3 text-sm font-medium text-slate-600">
                <span className="grid size-6 shrink-0 place-items-center rounded-full bg-white text-teal shadow-soft">
                  <Check className="size-3.5" />
                </span>
                {point}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative mt-auto flex items-end justify-center pt-12">
          <span
            aria-hidden="true"
            className="absolute bottom-2 left-1/2 size-64 -translate-x-1/2 rounded-full bg-white/70 xl:size-72"
          />
          <Object3D src={object} size={224} float className="relative" />
        </div>

        <p className="mt-8 text-xs text-slate-500">© 2026 Pixelspace · Demo build</p>
      </aside>

      {/* Form column */}
      <main className="flex min-h-dvh flex-col items-center justify-center bg-background px-5 py-10 lg:px-10">
        <div className="w-full max-w-[440px]">
          <Link href="/" className="mb-6 flex items-center gap-2.5 lg:hidden">
            <span className="grid size-9 place-items-center rounded-lg bg-teal text-sm font-black text-white">
              &gt;&gt;
            </span>
            <span className="text-base font-bold tracking-tight">Pixelspace AI Classroom</span>
          </Link>

          <div className="rounded-2xl border border-border bg-card p-6 shadow-soft lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none">
            <div className="mb-6 flex justify-center lg:hidden">
              <span className="grid size-24 place-items-center rounded-2xl bg-[#E7F6F4]">
                <Object3D src={object} size={74} />
              </span>
            </div>

            <h1 className="text-2xl font-extrabold tracking-tight lg:text-3xl">{title}</h1>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{subtitle}</p>
            <div className="mt-6">{children}</div>
          </div>

          <p className="mt-6 text-center text-xs text-muted-foreground lg:hidden">
            © 2026 Pixelspace · Demo build
          </p>
        </div>
      </main>
    </div>
  );
}
