import Link from "next/link";
import { SignUpForm } from "./form";

export const dynamic = "force-dynamic";

export default function SignUpPage() {
  return (
    <div className="panel panel-strong p-8 space-y-6">
      <div className="space-y-1">
        <div className="mono label">// AUTH.SIGN_UP</div>
        <h1 className="text-2xl font-semibold tracking-tight">Create account</h1>
        <p className="text-sm text-muted">Join AI Utils. Start with Token Maxxer.</p>
      </div>
      <SignUpForm />
      <div className="text-xs text-muted mono text-center">
        Already have one? <Link href="/sign-in" className="text-[color:var(--accent)] hover:underline">Sign in</Link>
      </div>
    </div>
  );
}
