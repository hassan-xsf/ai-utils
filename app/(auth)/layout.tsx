import Link from "next/link";
import { LogoWordmark } from "@/app/components/logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative z-10 min-h-screen flex flex-col">
      <header className="px-6 py-5 border-b border-border">
        <Link href="/"><LogoWordmark /></Link>
      </header>
      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">{children}</div>
      </main>
    </div>
  );
}
