import type { Metadata } from "next";
import { PageHeader, PageShell } from "@/components/studio/shell";
import { QuizList } from "./quiz-list";

export const metadata: Metadata = { title: "Kuiz" };

export default function QuizzesPage() {
  return (
    <PageShell>
      <PageHeader
        title="Kuiz saya"
        description="Kuiz yang disediakan guru anda dengan AI daripada buku kerja kelas — dan kuiz yang anda jana sendiri. Tersekat? Tanya Pixel AI semasa menjawab."
      />
      <QuizList />
    </PageShell>
  );
}
