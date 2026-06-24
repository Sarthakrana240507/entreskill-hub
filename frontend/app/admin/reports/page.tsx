"use client";

import { useEffect, useState } from "react";
import { api, apiErrorMessage } from "@/lib/api";
import { Card, StampBadge } from "@/components/ui/Card";
import Button from "@/components/ui/Button";

interface Report {
  id: string;
  targetType: string;
  targetId: string;
  reason: string;
  status: string;
  filedBy: { name: string; email: string };
  createdAt: string;
}

export default function AdminReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    api
      .get("/admin/reports", { params: { status: "OPEN" } })
      .then((res) => setReports(res.data.data.reports))
      .catch((err) => setError(apiErrorMessage(err, "Could not load reports.")))
      .finally(() => setIsLoading(false));
  }, []);

  async function resolve(id: string, status: "RESOLVED" | "DISMISSED") {
    setProcessingId(id);
    try {
      await api.patch(`/admin/reports/${id}`, { status });
      setReports((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      setError(apiErrorMessage(err, "Could not update this report."));
    } finally {
      setProcessingId(null);
    }
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-ink">Reports & Moderation</h1>
      <p className="mt-1 text-ink-soft">Open reports filed by users about content, mentors, or other users.</p>

      {error && <p className="mt-4 rounded-lg bg-clay/10 px-4 py-3 text-sm text-clay">{error}</p>}

      <div className="mt-6 space-y-4">
        {isLoading ? (
          <div className="h-24 animate-pulse rounded-card border border-paper-line bg-white" />
        ) : reports.length === 0 ? (
          <Card className="text-center text-ink-soft">No open reports. All clear.</Card>
        ) : (
          reports.map((r) => (
            <Card key={r.id}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <StampBadge tone="clay">{r.targetType}</StampBadge>
                  <p className="mt-2 text-sm text-ink">{r.reason}</p>
                  <p className="mt-1 text-xs text-ink-soft">Filed by {r.filedBy.name} ({r.filedBy.email})</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => resolve(r.id, "RESOLVED")} isLoading={processingId === r.id}>Resolve</Button>
                  <Button size="sm" variant="outline" onClick={() => resolve(r.id, "DISMISSED")} isLoading={processingId === r.id}>Dismiss</Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
