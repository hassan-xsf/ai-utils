import { Spinner, Skeleton } from "@/app/components/spinner";
export default function Loading() {
  return (
    <div className="p-8 max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-2 text-muted">
        <Spinner size={16} /> <span className="text-sm">Loading settings…</span>
      </div>
      <Skeleton className="h-40" />
      <Skeleton className="h-24" />
    </div>
  );
}
