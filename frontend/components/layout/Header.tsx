"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Button from "@/components/ui/Button";
import { useState } from "react";
import { Menu, X, BookOpen } from "lucide-react";

const navLinks = [
  { href: "/ideas", label: "Business Ideas" },
  { href: "/mentors", label: "Mentors" },
  { href: "/resources", label: "Resources" },
];

export default function Header() {
  const { user, logout, isLoading } = useAuth();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const dashboardHref = user?.role === "ADMIN" ? "/admin" : user?.role === "MENTOR" ? "/mentors/dashboard" : "/dashboard";

  return (
    <header className="sticky top-0 z-50 border-b border-paper-line bg-paper/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-ink text-ink rotate-[-3deg]">
            <BookOpen size={18} strokeWidth={2.2} />
          </span>
          <span className="font-display text-xl font-semibold text-ink">
            EntreSkill <span className="text-marigold">Hub</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium transition-colors hover:text-marigold ${
                pathname?.startsWith(link.href) ? "text-marigold" : "text-ink-soft"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {!isLoading && !user && (
            <>
              <Link href="/login" className="text-sm font-medium text-ink-soft hover:text-ink">
                Log in
              </Link>
              <Link href="/register">
                <Button size="sm">Get Started</Button>
              </Link>
            </>
          )}
          {!isLoading && user && (
            <>
              <Link href={dashboardHref} className="text-sm font-medium text-ink-soft hover:text-ink">
                Dashboard
              </Link>
              <Button size="sm" variant="outline" onClick={() => logout()}>
                Log out
              </Button>
            </>
          )}
        </div>

        <button className="md:hidden" onClick={() => setMobileOpen((o) => !o)} aria-label="Toggle menu">
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-paper-line bg-paper px-6 py-4 md:hidden">
          <nav className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} className="text-sm font-medium text-ink-soft" onClick={() => setMobileOpen(false)}>
                {link.label}
              </Link>
            ))}
            <hr className="border-paper-line" />
            {!user ? (
              <>
                <Link href="/login" className="text-sm font-medium text-ink-soft" onClick={() => setMobileOpen(false)}>
                  Log in
                </Link>
                <Link href="/register" onClick={() => setMobileOpen(false)}>
                  <Button size="sm" className="w-full">Get Started</Button>
                </Link>
              </>
            ) : (
              <>
                <Link href={dashboardHref} className="text-sm font-medium text-ink-soft" onClick={() => setMobileOpen(false)}>
                  Dashboard
                </Link>
                <Button size="sm" variant="outline" onClick={() => logout()}>
                  Log out
                </Button>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
