"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import Button from "@/components/ui/Button";

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="ledger-bg flex min-h-[calc(100vh-180px)] items-center justify-center px-6 py-16">
      <Card className="w-full max-w-md">
        <h1 className="font-display text-2xl font-semibold text-ink">Welcome back</h1>
        <p className="mt-1 text-sm text-ink-soft">Log in to continue your roadmap.</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <Input label="Email address" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
          <Input label="Password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
          {error && <p className="rounded-lg bg-clay/10 px-3 py-2 text-sm text-clay">{error}</p>}
          <Button type="submit" className="w-full" isLoading={isLoading}>Log in</Button>
        </form>

        <p className="mt-6 text-center text-sm text-ink-soft">
          New here?{" "}
          <Link href="/register" className="font-medium text-marigold hover:underline">Create an account</Link>
        </p>

        <div className="mt-6 rounded-lg bg-paper-line/40 p-3 text-xs text-ink-soft">
          <p className="font-mono">Demo accounts (seeded):</p>
          <p>user@entreskillhub.com · mentor@entreskillhub.com · admin@entreskillhub.com</p>
          <p>Password: Password1</p>
        </div>
      </Card>
    </div>
  );
}
