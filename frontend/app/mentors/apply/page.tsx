"use client";

import { useEffect, useState } from "react";
import { useRequireAuth } from "@/lib/useRequireAuth";
import { api, apiErrorMessage } from "@/lib/api";
import { Card } from "@/components/ui/Card";
import { Input, Textarea } from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import type { Skill } from "@/lib/types";
import clsx from "clsx";

export default function MentorApplyPage() {
  const { user, isLoading: authLoading } = useRequireAuth();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [headline, setHeadline] = useState("");
  const [bio, setBio] = useState("");
  const [yearsExperience, setYearsExperience] = useState(1);
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [expertiseIds, setExpertiseIds] = useState<Set<string>>(new Set());
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    api.get("/profile/skills").then((res) => setSkills(res.data.data.skills)).catch(() => {});
  }, []);

  function toggleExpertise(skillId: string) {
    setExpertiseIds((prev) => {
      const next = new Set(prev);
      if (next.has(skillId)) next.delete(skillId);
      else next.add(skillId);
      return next;
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (expertiseIds.size === 0) {
      setError("Select at least one area of expertise.");
      return;
    }
    setIsSubmitting(true);
    try {
      await api.post("/mentors/apply", {
        headline,
        bio,
        yearsExperience,
        linkedinUrl: linkedinUrl || undefined,
        expertiseSkillIds: Array.from(expertiseIds),
      });
      setSuccess(true);
    } catch (err) {
      setError(apiErrorMessage(err, "Could not submit your application."));
    } finally {
      setIsSubmitting(false);
    }
  }

  if (authLoading || !user) return <div className="px-6 py-24 text-center text-ink-soft">Loading…</div>;

  if (success) {
    return (
      <div className="ledger-bg flex min-h-[calc(100vh-180px)] items-center justify-center px-6">
        <Card className="max-w-md text-center">
          <h1 className="font-display text-2xl font-semibold text-ink">Application submitted</h1>
          <p className="mt-2 text-ink-soft">An admin will review your application. You&apos;ll get a notification once it&apos;s approved.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="ledger-bg min-h-[calc(100vh-180px)] px-6 py-12">
      <div className="mx-auto max-w-2xl">
        <h1 className="font-display text-3xl font-semibold text-ink">Apply to mentor</h1>
        <p className="mt-1 text-ink-soft">Share your experience so we can match you with the right mentees.</p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <Card>
            <Input label="Headline" required value={headline} onChange={(e) => setHeadline(e.target.value)} placeholder="e.g. Boutique owner & textile entrepreneur, 12 years" />
            <div className="mt-4">
              <Textarea label="Your story" required rows={5} value={bio} onChange={(e) => setBio(e.target.value)} placeholder="What have you built? What can you help others avoid or do faster?" />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <Input label="Years of experience" type="number" min={0} required value={yearsExperience} onChange={(e) => setYearsExperience(Number(e.target.value))} />
              <Input label="LinkedIn (optional)" value={linkedinUrl} onChange={(e) => setLinkedinUrl(e.target.value)} placeholder="https://linkedin.com/in/…" />
            </div>
          </Card>

          <Card>
            <h2 className="font-display text-lg font-semibold text-ink">Areas of expertise</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {skills.map((skill) => (
                <button
                  key={skill.id}
                  type="button"
                  onClick={() => toggleExpertise(skill.id)}
                  className={clsx(
                    "rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
                    expertiseIds.has(skill.id) ? "border-marigold bg-marigold/10 text-marigold-dark" : "border-paper-line text-ink-soft hover:border-ink"
                  )}
                >
                  {skill.name}
                </button>
              ))}
            </div>
          </Card>

          {error && <p className="rounded-lg bg-clay/10 px-4 py-3 text-sm text-clay">{error}</p>}

          <Button type="submit" size="lg" className="w-full" isLoading={isSubmitting}>Submit Application</Button>
        </form>
      </div>
    </div>
  );
}
