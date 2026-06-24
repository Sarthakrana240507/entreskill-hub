"use client";

import { useEffect, useState } from "react";
import { api, apiErrorMessage } from "@/lib/api";
import { Card, Pill } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { Input, Select, Textarea } from "@/components/ui/Input";
import type { BusinessIdea } from "@/lib/types";

export default function AdminIdeasPage() {
  const [ideas, setIdeas] = useState<BusinessIdea[]>([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState({
    title: "",
    summary: "",
    description: "",
    difficulty: "BEGINNER",
    estimatedCostMin: 1000,
    estimatedCostMax: 10000,
    timeToLaunchDays: 30,
    category: "",
  });

  async function loadIdeas() {
    setIsLoading(true);
    try {
      const { data } = await api.get("/ideas", { params: { limit: 50 } });
      setIdeas(data.data.ideas);
    } catch (err) {
      setError(apiErrorMessage(err, "Could not load business ideas."));
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadIdeas();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsSubmitting(true);
    try {
      await api.post("/ideas", { ...form, skillIds: [], interestIds: [] });
      setSuccess("Business idea created.");
      setShowForm(false);
      setForm({ title: "", summary: "", description: "", difficulty: "BEGINNER", estimatedCostMin: 1000, estimatedCostMax: 10000, timeToLaunchDays: 30, category: "" });
      loadIdeas();
    } catch (err) {
      setError(apiErrorMessage(err, "Could not create this idea."));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this business idea? This cannot be undone.")) return;
    try {
      await api.delete(`/ideas/${id}`);
      setIdeas((prev) => prev.filter((i) => i.id !== id));
    } catch (err) {
      setError(apiErrorMessage(err, "Could not delete this idea."));
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">Business Ideas</h1>
          <p className="mt-1 text-ink-soft">Curate the idea catalogue users see in their recommendations.</p>
        </div>
        <Button onClick={() => setShowForm((s) => !s)}>{showForm ? "Cancel" : "+ New Idea"}</Button>
      </div>

      {error && <p className="mt-4 rounded-lg bg-clay/10 px-4 py-3 text-sm text-clay">{error}</p>}
      {success && <p className="mt-4 rounded-lg bg-workshop/10 px-4 py-3 text-sm text-workshop-dark">{success}</p>}

      {showForm && (
        <Card className="mt-6">
          <form onSubmit={handleCreate} className="space-y-4">
            <Input label="Title" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            <Input label="Summary (short)" required value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} />
            <Textarea label="Full description" required rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <Select label="Difficulty" value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value })}>
                <option value="BEGINNER">Beginner</option>
                <option value="INTERMEDIATE">Intermediate</option>
                <option value="ADVANCED">Advanced</option>
              </Select>
              <Input label="Category" required value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
              <Input label="Min cost (₹)" type="number" value={form.estimatedCostMin} onChange={(e) => setForm({ ...form, estimatedCostMin: Number(e.target.value) })} />
              <Input label="Max cost (₹)" type="number" value={form.estimatedCostMax} onChange={(e) => setForm({ ...form, estimatedCostMax: Number(e.target.value) })} />
            </div>
            <Button type="submit" isLoading={isSubmitting}>Create Idea</Button>
          </form>
        </Card>
      )}

      <div className="mt-6 space-y-3">
        {isLoading ? (
          <div className="h-24 animate-pulse rounded-card border border-paper-line bg-white" />
        ) : (
          ideas.map((idea) => (
            <Card key={idea.id} className="flex items-center justify-between gap-4">
              <div>
                <h3 className="font-display text-base font-semibold text-ink">{idea.title}</h3>
                <p className="text-sm text-ink-soft line-clamp-1">{idea.summary}</p>
                <div className="mt-1 flex gap-2"><Pill>{idea.category}</Pill><Pill>{idea.difficulty}</Pill></div>
              </div>
              <Button size="sm" variant="danger" onClick={() => handleDelete(idea.id)}>Delete</Button>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
