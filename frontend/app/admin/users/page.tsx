"use client";

import { useEffect, useState } from "react";
import { api, apiErrorMessage } from "@/lib/api";
import { Card, StampBadge } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  async function load() {
    setIsLoading(true);
    try {
      const { data } = await api.get("/admin/users", { params: search ? { search } : {} });
      setUsers(data.data.users);
    } catch (err) {
      setError(apiErrorMessage(err, "Could not load users."));
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [search]);

  async function toggleActive(userId: string, current: boolean) {
    try {
      await api.patch(`/admin/users/${userId}/status`, { isActive: !current });
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, isActive: !current } : u)));
    } catch (err) {
      setError(apiErrorMessage(err, "Could not update user status."));
    }
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-ink">User Management</h1>
      <p className="mt-1 text-ink-soft">Search, review, and manage user and mentor accounts.</p>

      <div className="mt-6 max-w-sm">
        <Input placeholder="Search by name or email…" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {error && <p className="mt-4 rounded-lg bg-clay/10 px-4 py-3 text-sm text-clay">{error}</p>}

      <Card className="mt-6 overflow-x-auto">
        {isLoading ? (
          <p className="text-ink-soft">Loading…</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-paper-line text-xs font-mono uppercase text-ink-soft">
                <th className="pb-3">Name</th>
                <th className="pb-3">Email</th>
                <th className="pb-3">Role</th>
                <th className="pb-3">Status</th>
                <th className="pb-3"></th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-paper-line/60">
                  <td className="py-3 font-medium text-ink">{u.name}</td>
                  <td className="py-3 text-ink-soft">{u.email}</td>
                  <td className="py-3"><StampBadge tone="ink">{u.role}</StampBadge></td>
                  <td className="py-3">
                    <StampBadge tone={u.isActive ? "workshop" : "clay"}>{u.isActive ? "Active" : "Disabled"}</StampBadge>
                  </td>
                  <td className="py-3 text-right">
                    <Button size="sm" variant={u.isActive ? "danger" : "outline"} onClick={() => toggleActive(u.id, u.isActive)}>
                      {u.isActive ? "Deactivate" : "Activate"}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
