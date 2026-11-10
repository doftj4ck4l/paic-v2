import type { Metadata } from "next";
import { PageHeader, PageShell } from "@/components/studio/shell";
import { requireUser } from "@/lib/auth-session";
import { listNotifications } from "@/lib/notifications";
import { NotificationList } from "./notification-list";

export const metadata: Metadata = { title: "Pemberitahuan" };

export const dynamic = "force-dynamic";

export default async function NotificationsPage() {
  const user = await requireUser();
  const items = await listNotifications(user.id);
  return (
    <PageShell className="max-w-[680px]">
      <PageHeader
        title="Pemberitahuan"
        description="Tugasan baharu, penyertaan kelas dan aktiviti pembelajaran anda."
      />
      <NotificationList items={items} />
    </PageShell>
  );
}
