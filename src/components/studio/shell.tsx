import { cn } from "@/lib/utils";

export { PageHeader, Section } from "@/components/studio/page-header";

export function PageShell({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <main
      id="main"
      className={cn("mx-auto w-full max-w-[1140px] px-4 pb-20 pt-6 sm:px-6 lg:px-8", className)}
    >
      {children}
    </main>
  );
}
