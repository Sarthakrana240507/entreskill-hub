"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import type { Role } from "@/lib/types";

/**
 * Redirects to /login if no user is present, or to the homepage if the user's
 * role is not in `allowedRoles`. Returns { user, isLoading } so pages can
 * render a loading state without flashing protected content.
 */
export function useRequireAuth(allowedRoles?: Role[]) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.push("/login");
      return;
    }
    if (allowedRoles && !allowedRoles.includes(user.role)) {
      router.push("/");
    }
  }, [user, isLoading, allowedRoles, router]);

  return { user, isLoading };
}
