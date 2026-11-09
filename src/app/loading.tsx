export default function Loading() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-background" role="status" aria-label="Memuatkan halaman">
      <span className="size-10 animate-spin rounded-full border-[3px] border-[#d5d9ea] border-t-[#00b6a2]" aria-hidden="true" />
      <p className="text-sm font-semibold text-muted-foreground">Memuatkan…</p>
    </div>
  );
}
