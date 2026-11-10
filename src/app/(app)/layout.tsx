import { LearningNav } from "@/components/home/learning-nav";
import { VerifyEmailBanner } from "@/components/home/verify-email-banner";
import { requireUser } from "@/lib/auth-session";
import { unreadNotificationCount } from "@/lib/notifications";

/**
 * Shared app layout — the single navbar is mounted ONCE here and persists
 * across all client-side navigation. Only the page content below it swaps.
 */
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const student = await requireUser();
  const unread = await unreadNotificationCount(student.id);
  return (
    <div className="flex min-h-dvh flex-col bg-background text-foreground">
      {!student.emailVerified && <VerifyEmailBanner email={student.email} />}
      <LearningNav student={student} unreadCount={unread} />
      {children}
    </div>
  );
}
