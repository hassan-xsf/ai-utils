import { requireUser } from "@/lib/dal";

export default async function SettingsPage() {
  const user = await requireUser();
  return (
    <div className="p-8 max-w-3xl mx-auto space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted">Your account details.</p>
      </header>
      <div className="panel p-6 space-y-3">
        <h2 className="text-base font-semibold">Account</h2>
        <div className="grid grid-cols-[120px_1fr] gap-3 text-sm">
          <span className="text-muted">Email</span><span>{user.email}</span>
          <span className="text-muted">User ID</span><span className="truncate">{user.id}</span>
          <span className="text-muted">Joined</span><span>{new Date(user.created_at).toLocaleString()}</span>
        </div>
      </div>
      <div className="panel p-6">
        <h2 className="text-base font-semibold mb-2">Coming soon</h2>
        <p className="text-sm text-muted">Profile, API keys, and notification preferences.</p>
      </div>
    </div>
  );
}
