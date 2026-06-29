"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { useRequireAuth } from "@/lib/useRequireAuth";
import { api, apiErrorMessage } from "@/lib/api";
import { Card } from "@/components/ui/Card";
import ProgressBar from "@/components/ui/ProgressBar";
import RoadmapStepList from "@/components/ideas/RoadmapStepList";
import type { UserRoadmap } from "@/lib/types";

export default function RoadmapProgressPage() {
  const { user, isLoading: authLoading } = useRequireAuth();
  const params = useParams();
  const searchParams = useSearchParams();
  const userRoadmapId = searchParams.get("userRoadmapId");

  const [userRoadmap, setUserRoadmap] = useState<UserRoadmap | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;
    async function load() {
      try {
        const { data } = await api.get("/roadmaps/progress/mine");
        const match = data.data.userRoadmaps.find(
          (ur: UserRoadmap) => ur.id === userRoadmapId || ur.roadmap.id === params.roadmapId
        );
        setUserRoadmap(match || null);
      } catch (err) {
        setError(apiErrorMessage(err, "Could not load roadmap progress."));
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [user, userRoadmapId, params.roadmapId]);

  async function handleToggleStep(stepId: string, isComplete: boolean) {
    if (!userRoadmap) return;
    try {
      const { data } = await api.patch(`/roadmaps/progress/${userRoadmap.id}/steps/${stepId}`, { isComplete });
      setUserRoadmap(data.data.userRoadmap);
    } catch (err) {
      setError(apiErrorMessage(err, "Could not update this step."));
    }
  }

  if (authLoading || isLoading) return <div className="px-6 py-24 text-center text-ink-soft">Loading…</div>;
  if (error) return <div className="px-6 py-24 text-center text-clay">{error}</div>;
  if (!userRoadmap) return <div className="px-6 py-24 text-center text-ink-soft">Roadmap progress not found. Start it from the idea page first.</div>;

  const steps = userRoadmap.roadmap.steps || [];
  const completedStepIds = new Set(userRoadmap.stepProgress.filter((sp) => sp.isComplete).map((sp) => sp.roadmapStepId));

  return (
    <div className="ledger-bg min-h-[calc(100vh-180px)] px-6 py-12">
      <div className="mx-auto max-w-3xl">
        <h1 className="font-display text-3xl font-semibold text-ink">{userRoadmap.roadmap.businessIdea?.title}</h1>
        <p className="mt-1 text-ink-soft">{userRoadmap.roadmap.title}</p>

        <Card className="mt-6">
          <ProgressBar value={userRoadmap.progressPct} label="Overall progress" tone="workshop" />
        </Card>

        <Card className="mt-6">
          <h2 className="mb-4 font-display text-lg font-semibold text-ink">Tap a step to mark it complete</h2>
          <RoadmapStepList
            steps={steps}
            completedStepIds={completedStepIds}
            onToggleStep={handleToggleStep}
          />
        </Card>
      </div>
    </div>
  );
}