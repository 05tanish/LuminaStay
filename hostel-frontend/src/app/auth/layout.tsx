import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-zinc-950 via-zinc-900 to-indigo-950">
      {/* Header */}
      <header className="w-full px-6 py-5 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-white tracking-tight">
          LuminaStay<span className="text-indigo-400">.</span>
        </Link>
        <ThemeToggle />
      </header>

      {/* Centered form area */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          {children}
        </div>
      </main>

      <footer className="py-6 text-center text-xs text-zinc-600">
        &copy; 2026 LuminaStay. All rights reserved.
      </footer>
    </div>
  );
}
