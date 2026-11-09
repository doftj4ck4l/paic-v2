import type { Metadata } from "next";
import { PageHeader, PageShell } from "@/components/studio/shell";
import { Explorer } from "./explorer";

export const metadata: Metadata = { title: "Jelajah" };

export default function ExplorePage() {
  return (
    <PageShell>
      <PageHeader
        title="Jelajah"
        description="Temui topik, subjek dan buku kerja yang dikongsi untuk memperluas pembelajaran anda."
      />
      <Explorer />
    </PageShell>
  );
}
