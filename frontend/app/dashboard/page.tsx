"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRequireAuth } from "@/lib/useRequireAuth";
import { api, apiErrorMessage } from "@/lib/api";
import { Card, StampBadge } from "@/components/ui/Card";
import ProgressBar from "@/components/ui/ProgressBar";
import Button from "@/components/ui/Button";
import type { UserRoadmap } from "@/lib/types";
import { Bookmark as BookmarkIcon, Map, ArrowRight } from "lucide-react";

export default function DashboardPage() {
  const { user, isLoading: authLoading } = useRequireAuth(["USER"]);
  const [roadmaps, setRoadmaps] = useState<UserRoadmap[]>([]);
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;
    async function load() {
      try {
        const [progressRes, bookmarksRes] = await Promise.all([
          api.get("/roadmaps/progress/mine"),
          api.get("/ideas/bookmarks/mine"),
        ]);
        setRoadmaps(progressRes.data.data.userRoadmaps);
        setBookmarks(bookmarksRes.data.data.bookmarks);
      } catch (err) {
        setError(apiErrorMessage(err, "Could not load your dashboard."));
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [user]);

  if (authLoading || !user) return <div className="px-6 py-24 text-center text-ink-soft">Loading…</div>;

  return (
    <div className="ledger-bg min-h-[calc(100vh-180px)] px-6 py-12">
      <div className="mx-auto max-w-5xl">
        <h1 className="font-display text-3xl font-semibold text-ink">Welcome back, {user.name.split(" ")[0]}</h1>
        <p className="mt-1 text-ink-soft">Here&apos;s where your roadmaps and saved ideas stand.</p>

        {error && <p className="mt-6 rounded-lg bg-clay/10 px-4 py-3 text-sm text-clay">{error}</p>}

        <section className="mt-10">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-display text-xl font-semibold text-ink">
              <Map size={20} className="text-marigold" /> Your Roadmaps
            </h2>
            <Link href="/ideas" className="text-sm font-medium text-marigold hover:underline">Browse more ideas</Link>
          </div>

          {isLoading ? (
            <div className="h-32 animate-pulse rounded-card border border-paper-line bg-white" />
          ) : roadmaps.length === 0 ? (
            <Card className="text-center text-ink-soft">
              You haven&apos;t started a roadmap yet.{" "}
              <Link href="/ideas?recommended=true" className="text-marigold hover:underline">Find a matched business idea</Link> to begin.
            </Card>
          ) : (
            <div className="space-y-4">
              {roadmaps.map((ur) => (
                <Card key={ur.id}>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h3 className="font-display text-lg font-semibold text-ink">{ur.roadmap.businessIdea?.title}</h3>
                      <StampBadge tone={ur.status === "COMPLETED" ? "workshop" : "marigold"} className="mt-2">
                        {ur.status.replace("_", " ")}
                      </StampBadge>
                    </div>
                    <Link href={`/roadmaps/${ur.roadmap.id}?userRoadmapId=${ur.id}`}>
                      <Button size="sm" variant="outline">
                        Continue <ArrowRight size={14} />
                      </Button>
                    </Link>
                  </div>
                  <ProgressBar value={ur.progressPct} className="mt-4" />
                </Card>
              ))}
            </div>
          )}
        </section>

        <section className="mt-12">
          <h2 className="mb-4 flex items-center gap-2 font-display text-xl font-semibold text-ink">
            <BookmarkIcon size={20} className="text-marigold" /> Saved Ideas
          </h2>
          {isLoading ? (
            <div className="h-24 animate-pulse rounded-card border border-paper-line bg-white" />
          ) : bookmarks.length === 0 ? (
            <Card className="text-center text-ink-soft">No bookmarks yet. Save ideas you&apos;re considering to find them here.</Card>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {bookmarks.map((b) => (
                <Link key={b.id} href={`/ideas/${b.businessIdea.id}`}>
                  <Card className="cursor-pointer">
                    <h3 className="font-display text-base font-semibold text-ink">{b.businessIdea.title}</h3>
                    <p className="mt-1 text-sm text-ink-soft line-clamp-1">{b.businessIdea.summary}</p>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
