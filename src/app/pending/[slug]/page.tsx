import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Object3D } from "@/components/learning/object3d";
import { LearningNav } from "@/components/home/learning-nav";
import { getDemoStudent } from "@/lib/demo-profile";

export const metadata: Metadata = { title: "Sedang dibina" };

const SECTION_NAMES: Record<string, string> = {
  "buku-kerja": "Buku Kerja",
  tugasan: "Tugasan",
  kemajuan: "Kemajuan",
  jelajah: "Jelajah",
  profil: "Profil",
  tetapan: "Tetapan",
  "tanya-ai": "Tanya Pixel AI",
  "quiz-kitaran-air": "Kuiz Kitaran Air",
  "quiz-pecahan": "Kuiz Pecahan Setara",
  "quiz-cerita": "Kuiz Cerita Rakyat",
  pengumuman: "Pengumuman sekolah",
};

export default async function PendingPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ soalan?: string | string[] }>;
}) {
  const { slug } = await params;
  const query = await searchParams;
  const question = slug === "tanya-ai" && typeof query.soalan === "string"
    ? query.soalan.trim().slice(0, 1000)
    : "";
  const student = await getDemoStudent();
  const name = SECTION_NAMES[slug] ?? slug.replaceAll("-", " ");

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <LearningNav student={student} />
      <main className="flex flex-1 items-center justify-center p-5 lg:p-10">
        <div className="flex w-full max-w-lg flex-col items-center rounded-2xl border border-border bg-card p-8 text-center shadow-soft">
          <span className="grid size-24 place-items-center rounded-2xl bg-[#E7F6F4]">
            <Object3D src="/assets/thiings/clipboard.png" size={68} />
          </span>
          <span className="mt-5 rounded-full bg-[#EEF2FF] px-3 py-1 text-[11px] font-semibold text-[#4f46e5]">
            Binaan validasi reka bentuk · Fasa 0
          </span>
          <h1 className="mt-3 text-2xl font-extrabold tracking-tight">
            “{name}” akan dibina seterusnya
          </h1>
          <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
            Buat masa ini kami membina dan mengesahkan reka bentuk papan pemuka utama. Bahagian
            ini menyusul selepas reka bentuk asas diluluskan.
          </p>
          {question && (
            <div className="mt-5 w-full rounded-xl border border-border bg-secondary/60 p-4 text-left">
              <p className="text-xs font-semibold text-muted-foreground">Soalan anda</p>
              <p className="mt-1 break-words text-sm leading-relaxed">{question}</p>
            </div>
          )}
          <Button asChild className="mt-6">
            <Link href="/">
              Kembali ke Utama <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </main>
    </div>
  );
}
