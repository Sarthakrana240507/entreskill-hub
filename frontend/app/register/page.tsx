"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import clsx from "clsx";

export default function RegisterPage() {
  const { register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"USER" | "MENTOR">("USER");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      await register(name, email, password, role);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="ledger-bg flex min-h-[calc(100vh-180px)] items-center justify-center px-6 py-16">
      <Card className="w-full max-w-md">
        <h1 className="font-display text-2xl font-semibold text-ink">Open your account</h1>
        <p className="mt-1 text-sm text-ink-soft">It takes about a minute.</p>

        <div className="mt-5 grid grid-cols-2 gap-2 rounded-lg bg-paper-line/40 p-1">
          {(["USER", "MENTOR"] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRole(r)}
              className={clsx(
                "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                role === r ? "bg-white text-ink shadow-sm" : "text-ink-soft"
              )}
            >
              {r === "USER" ? "I want to start a business" : "I want to mentor"}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <Input label="Full name" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
          <Input label="Email address" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
          <Input
            label="Password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 8 characters"
            minLength={8}
          />
          <p className="text-xs text-ink-soft">Must include at least one uppercase letter and one number.</p>
          {error && <p className="rounded-lg bg-clay/10 px-3 py-2 text-sm text-clay">{error}</p>}
          <Button type="submit" className="w-full" isLoading={isLoading}>Create account</Button>
        </form>

        <p className="mt-6 text-center text-sm text-ink-soft">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-marigold hover:underline">Log in</Link>
        </p>
      </Card>
    </div>
  );
}
