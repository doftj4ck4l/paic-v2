import type { Metadata } from "next";
import { PageHeader, PageShell } from "@/components/studio/shell";
import { CreationsLibrary } from "./creations-library";

export const metadata: Metadata = { title: "Hasil Karya" };

export default function CreationsPage() {
  return (
    <PageShell>
      <PageHeader
        title="Hasil karya saya"
        description="Semua bahan pembelajaran yang dijana AI daripada buku kerja anda — nota, kuiz, kad imbas, slaid dan banyak lagi."
      />
      <CreationsLibrary />
    </PageShell>
  );
}
