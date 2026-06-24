"use client";

import { useEffect, useState } from "react";
import { api, apiErrorMessage } from "@/lib/api";
import { Card, Pill } from "@/components/ui/Card";
import Button from "@/components/ui/Button";

interface Application {
  id: string;
  headline: string;
  bio: string;
  yearsExperience: number;
  user: { name: string; email: string };
  expertise: Array<{ skill: { id: string; name: string } }>;
}

export default function AdminMentorApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    api
      .get("/mentors/applications/pending")
      .then((res) => setApplications(res.data.data.applications))
      .catch((err) => setError(apiErrorMessage(err, "Could not load applications.")))
      .finally(() => setIsLoading(false));
  }, []);

  async function review(id: string, status: "APPROVED" | "REJECTED") {
    setProcessingId(id);
    try {
      await api.patch(`/mentors/${id}/review`, { status, rejectionReason: status === "REJECTED" ? "Does not meet current criteria" : undefined });
      setApplications((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      setError(apiErrorMessage(err, "Could not process this application."));
    } finally {
      setProcessingId(null);
    }
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-ink">Mentor Applications</h1>
      <p className="mt-1 text-ink-soft">Review pending applications before they appear in the public mentor directory.</p>

      {error && <p className="mt-4 rounded-lg bg-clay/10 px-4 py-3 text-sm text-clay">{error}</p>}

      <div className="mt-6 space-y-4">
        {isLoading ? (
          <div className="h-32 animate-pulse rounded-card border border-paper-line bg-white" />
        ) : applications.length === 0 ? (
          <Card className="text-center text-ink-soft">No pending applications.</Card>
        ) : (
          applications.map((app) => (
            <Card key={app.id}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="font-display text-lg font-semibold text-ink">{app.user.name}</h3>
                  <p className="text-xs text-ink-soft">{app.user.email}</p>
                  <p className="mt-2 text-sm font-medium text-ink">{app.headline}</p>
                  <p className="mt-1 text-sm text-ink-soft">{app.bio}</p>
                  <p className="mt-2 text-xs text-ink-soft">{app.yearsExperience} years of experience</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {app.expertise.map((e) => <Pill key={e.skill.id}>{e.skill.name}</Pill>)}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => review(app.id, "APPROVED")} isLoading={processingId === app.id}>Approve</Button>
                  <Button size="sm" variant="danger" onClick={() => review(app.id, "REJECTED")} isLoading={processingId === app.id}>Reject</Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
