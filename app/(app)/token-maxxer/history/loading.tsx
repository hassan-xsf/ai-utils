import { Spinner, Skeleton } from "@/app/components/spinner";
export default function Loading() {
  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center gap-2 text-muted">
        <Spinner size={16} /> <span className="text-sm">Loading run history…</span>
      </div>
      <Skeleton className="h-8 w-64" />
      <div className="panel p-2 space-y-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-10" />
        ))}
      </div>
    </div>
  );
}
