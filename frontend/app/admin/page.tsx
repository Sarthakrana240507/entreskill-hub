"use client";

import { useEffect, useState } from "react";
import { api, apiErrorMessage } from "@/lib/api";
import { Card } from "@/components/ui/Card";
import { Users, Award, Lightbulb, FileCheck, Flag, TrendingUp } from "lucide-react";

interface Summary {
  totalUsers: number;
  totalMentors: number;
  pendingMentors: number;
  totalIdeas: number;
  pendingResources: number;
  openReports: number;
  totalRoadmapsStarted: number;
  roadmapCompletionRate: number;
}

export default function AdminOverviewPage() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/admin/dashboard")
      .then((res) => setSummary(res.data.data))
      .catch((err) => setError(apiErrorMessage(err, "Could not load dashboard summary.")));
  }, []);

  const stats = summary
    ? [
        { icon: Users, label: "Total Users", value: summary.totalUsers, color: "text-marigold" },
        { icon: Award, label: "Approved Mentors", value: summary.totalMentors, color: "text-workshop" },
        { icon: Award, label: "Pending Mentor Applications", value: summary.pendingMentors, color: "text-clay" },
        { icon: Lightbulb, label: "Business Ideas", value: summary.totalIdeas, color: "text-ink" },
        { icon: FileCheck, label: "Pending Content Approvals", value: summary.pendingResources, color: "text-clay" },
        { icon: Flag, label: "Open Reports", value: summary.openReports, color: "text-clay" },
        { icon: TrendingUp, label: "Roadmaps Started", value: summary.totalRoadmapsStarted, color: "text-marigold" },
        { icon: TrendingUp, label: "Roadmap Completion Rate", value: `${summary.roadmapCompletionRate}%`, color: "text-workshop" },
      ]
    : [];

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-ink">Platform Overview</h1>
      <p className="mt-1 text-ink-soft">A snapshot of engagement across EntreSkill Hub.</p>

      {error && <p className="mt-6 rounded-lg bg-clay/10 px-4 py-3 text-sm text-clay">{error}</p>}

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {summary ? (
          stats.map((stat) => (
            <Card key={stat.label}>
              <stat.icon className={stat.color} size={20} />
              <p className="mt-3 font-mono text-3xl font-semibold text-ink">{stat.value}</p>
              <p className="mt-1 text-xs text-ink-soft">{stat.label}</p>
            </Card>
          ))
        ) : (
          [1, 2, 3, 4].map((i) => <div key={i} className="h-28 animate-pulse rounded-card border border-paper-line bg-white" />)
        )}
      </div>
    </div>
  );
}
