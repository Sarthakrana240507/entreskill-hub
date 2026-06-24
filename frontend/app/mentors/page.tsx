"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api, apiErrorMessage } from "@/lib/api";
import { Card, Pill, StampBadge } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import type { MentorProfile } from "@/lib/types";
import { Award } from "lucide-react";

export default function MentorsPage() {
  const [mentors, setMentors] = useState<MentorProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const { data } = await api.get("/mentors");
        setMentors(data.data.mentors);
      } catch (err) {
        setError(apiErrorMessage(err, "Could not load mentors."));
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="ledger-bg min-h-[calc(100vh-180px)] px-6 py-12">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-semibold text-ink">Find a Mentor</h1>
            <p className="mt-1 text-ink-soft">People who&apos;ve already built what you&apos;re trying to build.</p>
          </div>
          <Link href="/mentors/apply"><Button variant="outline">Become a Mentor</Button></Link>
        </div>

        {error && <p className="mt-6 rounded-lg bg-clay/10 px-4 py-3 text-sm text-clay">{error}</p>}

        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
          {isLoading ? (
            [1, 2].map((i) => <div key={i} className="h-40 animate-pulse rounded-card border border-paper-line bg-white" />)
          ) : mentors.length === 0 ? (
            <Card className="text-center text-ink-soft md:col-span-2">No approved mentors yet. Check back soon.</Card>
          ) : (
            mentors.map((mentor) => (
              <Card key={mentor.id}>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-display text-lg font-semibold text-ink">{mentor.user.name}</h3>
                    <p className="text-sm text-ink-soft">{mentor.headline}</p>
                  </div>
                  <StampBadge tone="workshop"><Award size={12} /> {mentor.yearsExperience}y exp</StampBadge>
                </div>
                <p className="mt-3 text-sm text-ink-soft line-clamp-3">{mentor.bio}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {mentor.expertise.map((e) => <Pill key={e.skill.id}>{e.skill.name}</Pill>)}
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
