"use client";

import { useEffect, useState } from "react";
import { api, apiErrorMessage } from "@/lib/api";
import { Card, Pill } from "@/components/ui/Card";
import { Select } from "@/components/ui/Input";
import type { Resource } from "@/lib/types";
import { Video, FileText, ListChecks } from "lucide-react";

const typeConfig = {
  VIDEO: { icon: Video, label: "Video", color: "text-clay" },
  ARTICLE: { icon: FileText, label: "Article", color: "text-marigold" },
  CHECKLIST: { icon: ListChecks, label: "Checklist", color: "text-workshop" },
};

export default function ResourcesPage() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [type, setType] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      try {
        const { data } = await api.get("/resources", { params: type ? { type } : {} });
        setResources(data.data.resources);
      } catch (err) {
        setError(apiErrorMessage(err, "Could not load resources."));
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [type]);

  return (
    <div className="ledger-bg min-h-[calc(100vh-180px)] px-6 py-12">
      <div className="mx-auto max-w-4xl">
        <h1 className="font-display text-3xl font-semibold text-ink">Learning Resources</h1>
        <p className="mt-1 text-ink-soft">Free videos, articles, and checklists curated by mentors and the EntreSkill Hub team.</p>

        <div className="mt-6 max-w-xs">
          <Select value={type} onChange={(e) => setType(e.target.value)}>
            <option value="">All types</option>
            <option value="VIDEO">Videos</option>
            <option value="ARTICLE">Articles</option>
            <option value="CHECKLIST">Checklists</option>
          </Select>
        </div>

        {error && <p className="mt-6 rounded-lg bg-clay/10 px-4 py-3 text-sm text-clay">{error}</p>}

        <div className="mt-6 space-y-3">
          {isLoading ? (
            [1, 2, 3].map((i) => <div key={i} className="h-20 animate-pulse rounded-card border border-paper-line bg-white" />)
          ) : resources.length === 0 ? (
            <Card className="text-center text-ink-soft">No resources available for this filter yet.</Card>
          ) : (
            resources.map((r) => {
              const config = typeConfig[r.type];
              const Icon = config.icon;
              return (
                <a key={r.id} href={r.url} target="_blank" rel="noopener noreferrer">
                  <Card className="flex items-center gap-4">
                    <Icon size={22} className={config.color} />
                    <div className="flex-1">
                      <h3 className="font-display text-base font-semibold text-ink">{r.title}</h3>
                      {r.description && <p className="text-sm text-ink-soft">{r.description}</p>}
                    </div>
                    <Pill>{config.label}</Pill>
                  </Card>
                </a>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
