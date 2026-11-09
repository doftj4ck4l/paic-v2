import { LearningNav } from "@/components/home/learning-nav";
import { getDemoStudent } from "@/lib/demo-profile";

/**
 * Shared app layout — the single navbar is mounted ONCE here and persists
 * across all client-side navigation. Only the page content below it swaps.
 */
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const student = await getDemoStudent();
  return (
    <div className="flex min-h-dvh flex-col bg-background text-foreground">
      <LearningNav student={student} />
      {children}
    </div>
  );
}
