"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { api, apiErrorMessage } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import IdeaCard from "@/components/ideas/IdeaCard";
import { Select, Input } from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import type { BusinessIdea } from "@/lib/types";

export default function IdeasPage() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [ideas, setIdeas] = useState<BusinessIdea[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [category, setCategory] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [search, setSearch] = useState("");
  const [recommended, setRecommended] = useState(searchParams.get("recommended") === "true");

  const fetchIdeas = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const params: Record<string, string> = { limit: "20" };
      if (recommended && user) params.recommended = "true";
      if (category) params.category = category;
      if (difficulty) params.difficulty = difficulty;
      if (search) params.search = search;

      const { data } = await api.get("/ideas", { params });
      setIdeas(data.data.ideas);
    } catch (err) {
      setError(apiErrorMessage(err, "Could not load business ideas."));
    } finally {
      setIsLoading(false);
    }
  }, [recommended, user, category, difficulty, search]);

  useEffect(() => {
    fetchIdeas();
  }, [fetchIdeas]);

  return (
    <div className="ledger-bg min-h-[calc(100vh-180px)] px-6 py-12">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col gap-2">
          <h1 className="font-display text-3xl font-semibold text-ink">Business Ideas</h1>
          <p className="text-ink-soft">
            {recommended && user
              ? "Ranked for you based on your skill profile."
              : "Browse all curated micro-business ideas, or build a profile for personalized matches."}
          </p>
        </div>

        <div className="mb-8 flex flex-wrap items-end gap-3 rounded-card border border-paper-line bg-white p-4">
          <div className="min-w-[180px] flex-1">
            <Input placeholder="Search ideas…" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div className="min-w-[160px]">
            <Select value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="">All categories</option>
              <option value="Apparel">Apparel</option>
              <option value="Food">Food</option>
              <option value="Repair">Repair</option>
              <option value="Digital">Digital</option>
              <option value="Craft">Craft</option>
            </Select>
          </div>
          <div className="min-w-[160px]">
            <Select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
              <option value="">Any difficulty</option>
              <option value="BEGINNER">Beginner</option>
              <option value="INTERMEDIATE">Intermediate</option>
              <option value="ADVANCED">Advanced</option>
            </Select>
          </div>
          {user && (
            <Button
              variant={recommended ? "primary" : "outline"}
              onClick={() => setRecommended((r) => !r)}
              type="button"
            >
              {recommended ? "Showing: For You" : "Show Matches For Me"}
            </Button>
          )}
        </div>

        {error && <p className="mb-6 rounded-lg bg-clay/10 px-4 py-3 text-sm text-clay">{error}</p>}

        {isLoading ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 animate-pulse rounded-card border border-paper-line bg-white" />
            ))}
          </div>
        ) : ideas.length === 0 ? (
          <div className="rounded-card border border-paper-line bg-white p-12 text-center text-ink-soft">
            No business ideas match these filters yet. Try widening your search.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {ideas.map((idea) => (
              <IdeaCard key={idea.id} idea={idea} canBookmark={Boolean(user)} />
            ))}
          </div>
        )}

        {recommended && user && (
          <p className="mt-8 text-center text-xs text-ink-soft">
            Match scores combine skill overlap, stated interests, and feasibility (difficulty + budget fit).{" "}
            <a href="/profile/setup" className="text-marigold hover:underline">Update your profile</a> to refine these.
          </p>
        )}
      </div>
    </div>
  );
}
