"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api, apiErrorMessage } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Card, Pill, StampBadge } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import RoadmapStepList from "@/components/ideas/RoadmapStepList";
import type { BusinessIdea } from "@/lib/types";
import { IndianRupee, Clock, Bookmark, FileText, Video, ListChecks } from "lucide-react";
import clsx from "clsx";

const resourceIcon = { VIDEO: Video, ARTICLE: FileText, CHECKLIST: ListChecks };

export default function IdeaDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [idea, setIdea] = useState<BusinessIdea | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isStarting, setIsStarting] = useState(false);
  const [startedMessage, setStartedMessage] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const { data } = await api.get(`/ideas/${params.id}`);
        setIdea(data.data.idea);
      } catch (err) {
        setError(apiErrorMessage(err, "Could not load this business idea."));
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [params.id]);

  async function handleStartRoadmap() {
    if (!user) {
      router.push("/login");
      return;
    }
    if (!idea?.roadmap) return;
    setIsStarting(true);
    try {
      await api.post(`/roadmaps/${idea.roadmap.id}/start`);
      setStartedMessage("Roadmap started! Track your progress from your dashboard.");
    } catch (err) {
      setError(apiErrorMessage(err, "Could not start this roadmap."));
    } finally {
      setIsStarting(false);
    }
  }

  if (isLoading) return <div className="px-6 py-24 text-center text-ink-soft">Loading…</div>;
  if (error || !idea) return <div className="px-6 py-24 text-center text-clay">{error || "Idea not found."}</div>;

  return (
    <div className="ledger-bg min-h-[calc(100vh-180px)] px-6 py-12">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            {typeof idea.matchScore === "number" && (
              <div className="mb-3"><StampBadge tone="workshop">{idea.matchScore}% Match for You</StampBadge></div>
            )}
            <h1 className="font-display text-4xl font-semibold text-ink">{idea.title}</h1>
            <p className="mt-2 max-w-2xl text-ink-soft">{idea.summary}</p>
          </div>
        </div>

        <div className="mb-8 flex flex-wrap gap-3">
          <Pill>{idea.category}</Pill>
          <Pill>{idea.difficulty}</Pill>
          <Pill><IndianRupee size={12} className="mr-1 inline" />{idea.estimatedCostMin}–{idea.estimatedCostMax}</Pill>
          <Pill><Clock size={12} className="mr-1 inline" />~{idea.timeToLaunchDays} days</Pill>
        </div>

        <Card className="mb-8">
          <h2 className="font-display text-xl font-semibold text-ink">About this business</h2>
          <p className="mt-3 text-sm leading-relaxed text-ink-soft">{idea.description}</p>

          {idea.ideaSkills && idea.ideaSkills.length > 0 && (
            <div className="mt-5 border-t border-paper-line pt-4">
              <h3 className="text-xs font-mono uppercase tracking-wider text-ink-soft">Skills used</h3>
              <div className="mt-2 flex flex-wrap gap-2">
                {idea.ideaSkills.map((s) => <Pill key={s.skill.id}>{s.skill.name}</Pill>)}
              </div>
            </div>
          )}
        </Card>

        {idea.roadmap && (
          <Card className="mb-8">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl font-semibold text-ink">{idea.roadmap.title}</h2>
              <Button size="sm" onClick={handleStartRoadmap} isLoading={isStarting}>Start This Roadmap</Button>
            </div>
            {startedMessage && <p className="mt-3 rounded-lg bg-workshop/10 px-3 py-2 text-sm text-workshop-dark">{startedMessage}</p>}
            <div className="mt-6">
              <RoadmapStepList steps={idea.roadmap.steps} />
            </div>
          </Card>
        )}

        {idea.resources && idea.resources.length > 0 && (
          <Card>
            <h2 className="font-display text-xl font-semibold text-ink">Learning resources</h2>
            <div className="mt-4 space-y-3">
              {idea.resources.map((r) => {
                const Icon = resourceIcon[r.type];
                return (
                  <a
                    key={r.id}
                    href={r.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 rounded-lg border border-paper-line p-3 transition-colors hover:border-marigold"
                  >
                    <Icon size={18} className="text-marigold" />
                    <div>
                      <p className="text-sm font-medium text-ink">{r.title}</p>
                      {r.description && <p className="text-xs text-ink-soft">{r.description}</p>}
                    </div>
                  </a>
                );
              })}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
