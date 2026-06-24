"use client";

import Link from "next/link";
import { Card, Pill, StampBadge } from "@/components/ui/Card";
import type { BusinessIdea } from "@/lib/types";
import { Bookmark, Clock, IndianRupee } from "lucide-react";
import { useState } from "react";
import { api } from "@/lib/api";
import clsx from "clsx";

function formatCost(min: number, max: number) {
  const fmt = (n: number) => (n >= 1000 ? `₹${(n / 1000).toFixed(0)}k` : `₹${n}`);
  return `${fmt(min)} – ${fmt(max)}`;
}

const difficultyTone: Record<string, "workshop" | "marigold" | "clay"> = {
  BEGINNER: "workshop",
  INTERMEDIATE: "marigold",
  ADVANCED: "clay",
};

export default function IdeaCard({ idea, canBookmark = false }: { idea: BusinessIdea; canBookmark?: boolean }) {
  const [bookmarked, setBookmarked] = useState(Boolean(idea.isBookmarked));
  const [isToggling, setIsToggling] = useState(false);

  async function toggleBookmark(e: React.MouseEvent) {
    e.preventDefault();
    if (isToggling) return;
    setIsToggling(true);
    try {
      const { data } = await api.post(`/ideas/${idea.id}/bookmark`);
      setBookmarked(data.data.bookmarked);
    } catch {
      // silently ignore — bookmark is a non-critical nicety
    } finally {
      setIsToggling(false);
    }
  }

  return (
    <Link href={`/ideas/${idea.id}`}>
      <Card className="relative h-full cursor-pointer">
        {canBookmark && (
          <button
            onClick={toggleBookmark}
            className="absolute right-5 top-5 text-ink-soft transition-colors hover:text-marigold"
            aria-label={bookmarked ? "Remove bookmark" : "Add bookmark"}
          >
            <Bookmark size={20} className={clsx(bookmarked && "fill-marigold text-marigold")} />
          </button>
        )}

        {typeof idea.matchScore === "number" && (
          <div className="mb-3">
            <StampBadge tone="workshop">{idea.matchScore}% Match</StampBadge>
          </div>
        )}

        <h3 className="font-display text-xl font-semibold text-ink pr-8">{idea.title}</h3>
        <p className="mt-2 text-sm text-ink-soft line-clamp-2">{idea.summary}</p>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Pill>{idea.category}</Pill>
          <span className={clsx("text-xs font-mono font-medium", `text-${difficultyTone[idea.difficulty]}-dark`)}>
            {idea.difficulty}
          </span>
        </div>

        <div className="mt-4 flex items-center gap-4 border-t border-paper-line pt-4 text-xs text-ink-soft">
          <span className="flex items-center gap-1"><IndianRupee size={14} /> {formatCost(idea.estimatedCostMin, idea.estimatedCostMax)}</span>
          <span className="flex items-center gap-1"><Clock size={14} /> ~{idea.timeToLaunchDays} days to launch</span>
        </div>
      </Card>
    </Link>
  );
}
