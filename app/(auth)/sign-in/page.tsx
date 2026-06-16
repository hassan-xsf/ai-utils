import Link from "next/link";
import { SignInForm } from "./form";

export const dynamic = "force-dynamic";

export default function SignInPage() {
  return (
    <div className="panel panel-strong p-8 space-y-6">
      <div className="space-y-1">
        <div className="mono label">// AUTH.SIGN_IN</div>
        <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
        <p className="text-sm text-muted">Sign in to access your AI Utils dashboard.</p>
      </div>
      <SignInForm />
      <div className="text-xs text-muted mono text-center">
        No account? <Link href="/sign-up" className="text-[color:var(--accent)] hover:underline">Create one</Link>
      </div>
    </div>
  );
}
