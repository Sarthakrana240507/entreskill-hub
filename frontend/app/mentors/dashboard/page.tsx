"use client";

import { useEffect, useState } from "react";
import { useRequireAuth } from "@/lib/useRequireAuth";
import { api, apiErrorMessage } from "@/lib/api";
import { Card, StampBadge } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Input";
import { Users, MessageCircleQuestion, CalendarClock } from "lucide-react";

interface Engagement {
  totalMentees: number;
  unansweredQuestions: number;
  upcomingSessions: number;
  questions: Array<{ id: string; title: string; body: string; answer?: string | null; user: { name: string } }>;
  sessions: Array<{ id: string; scheduledAt: string; status: string; user: { name: string } }>;
}

export default function MentorDashboardPage() {
  const { user, isLoading: authLoading } = useRequireAuth(["MENTOR"]);
  const [data, setData] = useState<Engagement | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    api
      .get("/mentors/me/mentees")
      .then((res) => setData(res.data.data))
      .catch((err) => setError(apiErrorMessage(err, "Could not load your mentor dashboard. If you haven't applied yet, your application may still be pending.")))
      .finally(() => setIsLoading(false));
  }, [user]);

  async function submitAnswer(questionId: string) {
    const answer = answers[questionId];
    if (!answer?.trim()) return;
    setSubmitting(questionId);
    try {
      await api.patch(`/questions/${questionId}/answer`, { answer });
      setData((prev) =>
        prev
          ? { ...prev, questions: prev.questions.map((q) => (q.id === questionId ? { ...q, answer } : q)), unansweredQuestions: prev.unansweredQuestions - 1 }
          : prev
      );
    } catch (err) {
      setError(apiErrorMessage(err, "Could not submit your answer."));
    } finally {
      setSubmitting(null);
    }
  }

  if (authLoading || !user) return <div className="px-6 py-24 text-center text-ink-soft">Loading…</div>;

  return (
    <div className="ledger-bg min-h-[calc(100vh-180px)] px-6 py-12">
      <div className="mx-auto max-w-4xl">
        <h1 className="font-display text-3xl font-semibold text-ink">Mentor Dashboard</h1>
        <p className="mt-1 text-ink-soft">Track your mentee engagement and respond to open questions.</p>

        {error && <p className="mt-6 rounded-lg bg-clay/10 px-4 py-3 text-sm text-clay">{error}</p>}

        {isLoading ? (
          <div className="mt-8 h-32 animate-pulse rounded-card border border-paper-line bg-white" />
        ) : data && (
          <>
            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Card className="flex items-center gap-3">
                <Users className="text-marigold" />
                <div><p className="font-mono text-2xl font-semibold text-ink">{data.totalMentees}</p><p className="text-xs text-ink-soft">Total mentees</p></div>
              </Card>
              <Card className="flex items-center gap-3">
                <MessageCircleQuestion className="text-clay" />
                <div><p className="font-mono text-2xl font-semibold text-ink">{data.unansweredQuestions}</p><p className="text-xs text-ink-soft">Unanswered questions</p></div>
              </Card>
              <Card className="flex items-center gap-3">
                <CalendarClock className="text-workshop" />
                <div><p className="font-mono text-2xl font-semibold text-ink">{data.upcomingSessions}</p><p className="text-xs text-ink-soft">Upcoming sessions</p></div>
              </Card>
            </div>

            <section className="mt-10">
              <h2 className="mb-4 font-display text-xl font-semibold text-ink">Questions from mentees</h2>
              <div className="space-y-4">
                {data.questions.length === 0 ? (
                  <Card className="text-center text-ink-soft">No questions yet.</Card>
                ) : (
                  data.questions.map((q) => (
                    <Card key={q.id}>
                      <div className="flex items-center justify-between">
                        <h3 className="font-display text-base font-semibold text-ink">{q.title}</h3>
                        <StampBadge tone={q.answer ? "workshop" : "clay"}>{q.answer ? "Answered" : "Open"}</StampBadge>
                      </div>
                      <p className="mt-1 text-xs text-ink-soft">from {q.user.name}</p>
                      <p className="mt-2 text-sm text-ink-soft">{q.body}</p>
                      {q.answer ? (
                        <p className="mt-3 rounded-lg bg-workshop/10 px-3 py-2 text-sm text-workshop-dark">{q.answer}</p>
                      ) : (
                        <div className="mt-3 space-y-2">
                          <Textarea
                            rows={2}
                            placeholder="Write your answer…"
                            value={answers[q.id] || ""}
                            onChange={(e) => setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))}
                          />
                          <Button size="sm" onClick={() => submitAnswer(q.id)} isLoading={submitting === q.id}>Submit Answer</Button>
                        </div>
                      )}
                    </Card>
                  ))
                )}
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
