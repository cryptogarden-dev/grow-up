"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/app/lib/auth-actions";

const links = [
  { href: "/", label: "Dashboard", icon: "\ud83c\udfe0" },
  { href: "/checkin", label: "Check-in", icon: "\u2705" },
  { href: "/goals", label: "Goals", icon: "\ud83c\udfaf" },
  { href: "/history", label: "History", icon: "\ud83d\udcc8" },
  { href: "/settings", label: "Pengaturan", icon: "\u2699\ufe0f" },
];

export function NavBar() {
  const pathname = usePathname();

  if (pathname === "/login") {
    return null;
  }

  return (
    <header className="safe-top sticky top-0 z-30 border-b border-zinc-200/70 bg-white/80 backdrop-blur-md dark:border-zinc-800/70 dark:bg-zinc-950/80">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold text-zinc-900 dark:text-zinc-50">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-linear-to-br from-emerald-400 to-emerald-600 text-base shadow-sm transition-transform hover:scale-105">
            🌱
          </span>
          <span className="hidden bg-linear-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent sm:inline dark:from-emerald-400 dark:to-teal-300">
            Grow Up
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <nav className="flex gap-1 text-sm">
            {links.map((link) => {
              const active =
                link.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 font-medium transition-all duration-200 ${
                    active
                      ? "bg-emerald-600 text-white shadow-sm shadow-emerald-600/30"
                      : "text-zinc-600 hover:scale-105 hover:bg-zinc-900/5 dark:text-zinc-300 dark:hover:bg-white/5"
                  }`}
                >
                  <span aria-hidden>{link.icon}</span>
                  <span className="hidden sm:inline">{link.label}</span>
                </Link>
              );
            })}
          </nav>
          <form action={logout}>
            <button
              type="submit"
              className="rounded-full border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-500 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
            >
              Keluar
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
