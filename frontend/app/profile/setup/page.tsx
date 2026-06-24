"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, apiErrorMessage } from "@/lib/api";
import { useRequireAuth } from "@/lib/useRequireAuth";
import { Card } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { Select, Textarea } from "@/components/ui/Input";
import type { Skill, Interest } from "@/lib/types";
import clsx from "clsx";

const BUDGET_OPTIONS = [
  { value: "UNDER_5000", label: "Under ₹5,000" },
  { value: "5000_25000", label: "₹5,000 – ₹25,000" },
  { value: "25000_100000", label: "₹25,000 – ₹1,00,000" },
  { value: "ABOVE_100000", label: "Above ₹1,00,000" },
];

export default function ProfileSetupPage() {
  const { user, isLoading: authLoading } = useRequireAuth();
  const router = useRouter();

  const [skills, setSkills] = useState<Skill[]>([]);
  const [interests, setInterests] = useState<Interest[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<Record<string, number>>({});
  const [selectedInterests, setSelectedInterests] = useState<Set<string>>(new Set());
  const [experienceLevel, setExperienceLevel] = useState("BEGINNER");
  const [availableHours, setAvailableHours] = useState(10);
  const [budgetRange, setBudgetRange] = useState("UNDER_5000");
  const [location, setLocation] = useState("");
  const [bio, setBio] = useState("");
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [catalogLoading, setCatalogLoading] = useState(true);

  useEffect(() => {
    async function loadCatalog() {
      try {
        const [skillsRes, interestsRes] = await Promise.all([api.get("/profile/skills"), api.get("/profile/interests")]);
        setSkills(skillsRes.data.data.skills);
        setInterests(interestsRes.data.data.interests);
      } catch (err) {
        setError(apiErrorMessage(err, "Could not load the skill catalogue."));
      } finally {
        setCatalogLoading(false);
      }
    }
    loadCatalog();
  }, []);

  function toggleSkill(skillId: string) {
    setSelectedSkills((prev) => {
      const next = { ...prev };
      if (skillId in next) delete next[skillId];
      else next[skillId] = 3;
      return next;
    });
  }

  function setProficiency(skillId: string, value: number) {
    setSelectedSkills((prev) => ({ ...prev, [skillId]: value }));
  }

  function toggleInterest(interestId: string) {
    setSelectedInterests((prev) => {
      const next = new Set(prev);
      if (next.has(interestId)) next.delete(interestId);
      else next.add(interestId);
      return next;
    });
  }

  async function handleSubmit() {
    setError("");
    if (Object.keys(selectedSkills).length === 0) {
      setError("Please select at least one skill so we can match business ideas to you.");
      return;
    }
    setIsSaving(true);
    try {
      await api.put("/profile/me", {
        experienceLevel,
        availableHours,
        budgetRange,
        location: location || undefined,
        bio: bio || undefined,
        skills: Object.entries(selectedSkills).map(([skillId, proficiency]) => ({ skillId, proficiency })),
        interestIds: Array.from(selectedInterests),
      });
      router.push("/ideas?recommended=true");
    } catch (err) {
      setError(apiErrorMessage(err, "Could not save your profile."));
    } finally {
      setIsSaving(false);
    }
  }

  if (authLoading || !user) return <div className="px-6 py-24 text-center text-ink-soft">Loading…</div>;

  const groupedSkills = skills.reduce<Record<string, Skill[]>>((acc, s) => {
    acc[s.category] = acc[s.category] || [];
    acc[s.category].push(s);
    return acc;
  }, {});

  return (
    <div className="ledger-bg min-h-[calc(100vh-180px)] px-6 py-16">
      <div className="mx-auto max-w-3xl">
        <h1 className="font-display text-3xl font-semibold text-ink">Tell us what you&apos;re good at</h1>
        <p className="mt-2 text-ink-soft">This builds your skill profile — the basis for every recommendation you&apos;ll see.</p>

        {catalogLoading ? (
          <p className="mt-10 text-ink-soft">Loading skill catalogue…</p>
        ) : (
          <div className="mt-8 space-y-6">
            <Card>
              <h2 className="font-display text-lg font-semibold text-ink">1. Pick your skills</h2>
              <p className="mt-1 text-sm text-ink-soft">Select all that apply, then rate your proficiency 1 (just learning) to 5 (very confident).</p>
              <div className="mt-4 space-y-5">
                {Object.entries(groupedSkills).map(([category, items]) => (
                  <div key={category}>
                    <h3 className="text-xs font-mono uppercase tracking-wider text-ink-soft">{category}</h3>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {items.map((skill) => {
                        const isSelected = skill.id in selectedSkills;
                        return (
                          <div key={skill.id} className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => toggleSkill(skill.id)}
                              className={clsx(
                                "rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
                                isSelected ? "border-marigold bg-marigold/10 text-marigold-dark" : "border-paper-line text-ink-soft hover:border-ink"
                              )}
                            >
                              {skill.name}
                            </button>
                            {isSelected && (
                              <select
                                value={selectedSkills[skill.id]}
                                onChange={(e) => setProficiency(skill.id, Number(e.target.value))}
                                className="rounded-md border border-paper-line bg-white px-2 py-1 text-xs"
                                aria-label={`Proficiency in ${skill.name}`}
                              >
                                {[1, 2, 3, 4, 5].map((v) => (
                                  <option key={v} value={v}>{v}/5</option>
                                ))}
                              </select>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card>
              <h2 className="font-display text-lg font-semibold text-ink">2. What draws you to running a business?</h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {interests.map((interest) => (
                  <button
                    key={interest.id}
                    type="button"
                    onClick={() => toggleInterest(interest.id)}
                    className={clsx(
                      "rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
                      selectedInterests.has(interest.id) ? "border-workshop bg-workshop/10 text-workshop-dark" : "border-paper-line text-ink-soft hover:border-ink"
                    )}
                  >
                    {interest.name}
                  </button>
                ))}
              </div>
            </Card>

            <Card>
              <h2 className="font-display text-lg font-semibold text-ink">3. A bit more context</h2>
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Select label="Experience level" value={experienceLevel} onChange={(e) => setExperienceLevel(e.target.value)}>
                  <option value="BEGINNER">Beginner — just starting out</option>
                  <option value="INTERMEDIATE">Intermediate — some experience</option>
                  <option value="ADVANCED">Advanced — confident and experienced</option>
                </Select>
                <Select label="Starting budget" value={budgetRange} onChange={(e) => setBudgetRange(e.target.value)}>
                  {BUDGET_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </Select>
                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-sm font-medium text-ink">Hours available per week: {availableHours}</label>
                  <input
                    type="range"
                    min={1}
                    max={60}
                    value={availableHours}
                    onChange={(e) => setAvailableHours(Number(e.target.value))}
                    className="w-full accent-marigold"
                  />
                </div>
                <div className="sm:col-span-2">
                  <Textarea label="A little about your situation (optional)" value={bio} onChange={(e) => setBio(e.target.value)} rows={3} placeholder="e.g. I help my mother with tailoring and want to start something of my own from home." />
                </div>
              </div>
            </Card>

            {error && <p className="rounded-lg bg-clay/10 px-4 py-3 text-sm text-clay">{error}</p>}

            <Button size="lg" className="w-full" onClick={handleSubmit} isLoading={isSaving}>
              See My Matched Business Ideas
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
