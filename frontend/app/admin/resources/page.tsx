"use client";

import { useEffect, useState } from "react";
import { api, apiErrorMessage } from "@/lib/api";
import { Card, Pill } from "@/components/ui/Card";
import Button from "@/components/ui/Button";

interface PendingResource {
  id: string;
  title: string;
  type: string;
  url: string;
  description?: string | null;
  businessIdea?: { title: string } | null;
}

export default function AdminResourcesPage() {
  const [resources, setResources] = useState<PendingResource[]>([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    api
      .get("/admin/resources/pending")
      .then((res) => setResources(res.data.data.resources))
      .catch((err) => setError(apiErrorMessage(err, "Could not load pending resources.")))
      .finally(() => setIsLoading(false));
  }, []);

  async function review(id: string, status: "APPROVED" | "REJECTED") {
    setProcessingId(id);
    try {
      await api.patch(`/resources/${id}/review`, { status });
      setResources((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      setError(apiErrorMessage(err, "Could not process this resource."));
    } finally {
      setProcessingId(null);
    }
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-ink">Content Approval</h1>
      <p className="mt-1 text-ink-soft">Review training content uploaded by mentors before it goes live.</p>

      {error && <p className="mt-4 rounded-lg bg-clay/10 px-4 py-3 text-sm text-clay">{error}</p>}

      <div className="mt-6 space-y-4">
        {isLoading ? (
          <div className="h-24 animate-pulse rounded-card border border-paper-line bg-white" />
        ) : resources.length === 0 ? (
          <Card className="text-center text-ink-soft">No content awaiting approval.</Card>
        ) : (
          resources.map((r) => (
            <Card key={r.id}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-display text-base font-semibold text-ink">{r.title}</h3>
                    <Pill>{r.type}</Pill>
                  </div>
                  {r.description && <p className="mt-1 text-sm text-ink-soft">{r.description}</p>}
                  <a href={r.url} target="_blank" rel="noopener noreferrer" className="mt-1 block text-xs text-marigold hover:underline">
                    {r.url}
                  </a>
                  {r.businessIdea && <p className="mt-1 text-xs text-ink-soft">Linked to: {r.businessIdea.title}</p>}
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => review(r.id, "APPROVED")} isLoading={processingId === r.id}>Approve</Button>
                  <Button size="sm" variant="danger" onClick={() => review(r.id, "REJECTED")} isLoading={processingId === r.id}>Reject</Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
