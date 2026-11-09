import Link from "next/link";
import { Compass } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-background px-6 text-center text-foreground">
      <span className="grid size-20 place-items-center rounded-3xl bg-[#E7F6F4]">
        <Compass className="size-9 text-[#00786a]" aria-hidden="true" />
      </span>
      <h1 className="text-2xl font-extrabold tracking-tight">Halaman tidak dijumpai</h1>
      <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
        Halaman yang anda cari mungkin telah dipindahkan atau tidak wujud dalam binaan demo ini.
      </p>
      <Link
        href="/"
        className="focus-ring inline-flex h-11 items-center rounded-xl bg-gradient-to-r from-[#007a66] to-[#00856f] px-6 text-sm font-semibold text-white shadow-soft"
      >
        Kembali ke Utama
      </Link>
    </div>
  );
}
