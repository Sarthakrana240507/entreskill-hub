"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRequireAuth } from "@/lib/useRequireAuth";
import { LayoutDashboard, Users, Award, FileCheck, Flag, Lightbulb } from "lucide-react";
import clsx from "clsx";

const navItems = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/mentors", label: "Mentor Applications", icon: Award },
  { href: "/admin/resources", label: "Content Approval", icon: FileCheck },
  { href: "/admin/ideas", label: "Business Ideas", icon: Lightbulb },
  { href: "/admin/reports", label: "Reports", icon: Flag },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useRequireAuth(["ADMIN"]);
  const pathname = usePathname();

  if (isLoading || !user) return <div className="px-6 py-24 text-center text-ink-soft">Loading…</div>;

  return (
    <div className="min-h-[calc(100vh-180px)] bg-paper">
      <div className="mx-auto flex max-w-6xl gap-8 px-6 py-10">
        <aside className="w-56 shrink-0">
          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={clsx(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive ? "bg-ink text-paper" : "text-ink-soft hover:bg-paper-line/60"
                  )}
                >
                  <item.icon size={16} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>
        <div className="flex-1">{children}</div>
      </div>
    </div>
  );
}
