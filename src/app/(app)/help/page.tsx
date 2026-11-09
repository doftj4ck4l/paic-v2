import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown, CircleHelp, Mail } from "lucide-react";
import { PageHeader, PageShell } from "@/components/studio/shell";

export const metadata: Metadata = { title: "Bantuan" };

const FAQ = [
  {
    q: "Bagaimana saya menyambung buku kerja?",
    a: "Buka Buku Kerja daripada navigasi, kemudian pilih buku kerja anda. Kemajuan disimpan secara automatik apabila anda membaca sumber dan berbual dengan AI.",
  },
  {
    q: "Adakah jawapan AI boleh dipercayai?",
    a: "Jawapan AI disandarkan pada sumber yang anda pilih dan disertakan sitasi yang boleh disemak. Jika jawapan tidak berdasarkan sumber, ia dilabel dengan jelas.",
  },
  {
    q: "Bolehkah saya jana kuiz dan kad imbas sendiri?",
    a: "Ya — buka Studio dalam mana-mana buku kerja. Nota, kuiz, kad imbas, slaid, peta minda dan panduan ulang kaji boleh dijana daripada sumber anda.",
  },
  {
    q: "Siapa boleh melihat perbualan dan kemajuan saya?",
    a: "Perbualan dan kemajuan peribadi anda bersifat privasi. Guru hanya melihat perkara yang dikongsi secara jelas seperti tugasan dan bahan kelas.",
  },
  {
    q: "Bagaimana jika saya terlupa kata laluan?",
    a: "Gunakan pautan 'Lupa kata laluan?' pada halaman log masuk. Pelajar tanpa emel peribadi boleh meminta bantuan guru kelas untuk pemulihan akaun.",
  },
];

export default function HelpPage() {
  return (
    <PageShell className="max-w-[680px]">
      <PageHeader title="Bantuan" description="Soalan lazim dan cara menghubungi kami." />

      <div className="flex flex-col gap-3">
        {FAQ.map((item) => (
          <details key={item.q} className="group rounded-[20px] border border-border bg-card shadow-soft">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-4 [&::-webkit-details-marker]:hidden">
              <span className="text-sm font-bold">{item.q}</span>
              <ChevronDown className="size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" aria-hidden="true" />
            </summary>
            <p className="border-t border-border p-4 text-sm leading-relaxed text-muted-foreground">
              {item.a}
            </p>
          </details>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3 rounded-[22px] border border-border bg-card p-5 shadow-soft">
        <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-accent text-accent-foreground">
          <CircleHelp className="size-5" aria-hidden="true" />
        </span>
        <p className="min-w-0 flex-1 text-sm text-muted-foreground">
          Masih perlukan bantuan? Hubungi guru kelas anda, atau e-mel sokongan Pixelspace.
        </p>
        <span className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-border bg-card px-4 text-xs font-semibold text-muted-foreground">
          <Mail className="size-3.5" aria-hidden="true" /> support@pixelspace.my
        </span>
      </div>

      <p className="mt-4 text-xs text-muted-foreground">
        Anda juga boleh kembali ke{" "}
        <Link href="/" className="font-semibold text-[#00786a] hover:underline">
          papan pemuka
        </Link>{" "}
        untuk meneruskan pembelajaran.
      </p>
    </PageShell>
  );
}
