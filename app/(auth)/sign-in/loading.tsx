import { Spinner } from "@/app/components/spinner";
export default function Loading() {
  return (
    <div className="panel panel-strong p-8 flex items-center justify-center gap-2 text-muted">
      <Spinner size={16} /> <span className="text-sm">Loading…</span>
    </div>
  );
}
