import type { Metadata } from "next";
import { PageHeader, PageShell } from "@/components/studio/shell";
import { NotificationList } from "./notification-list";

export const metadata: Metadata = { title: "Pemberitahuan" };

export default function NotificationsPage() {
  return (
    <PageShell className="max-w-[680px]">
      <PageHeader
        title="Pemberitahuan"
        description="Tugasan baharu, pengumuman kelas dan penjanaan bahan anda."
      />
      <NotificationList />
    </PageShell>
  );
}
