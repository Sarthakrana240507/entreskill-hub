import Link from "next/link";
import Button from "@/components/ui/Button";
import { Card, StampBadge } from "@/components/ui/Card";
import { Compass, Map, Users, Scissors, ChefHat, Wrench, Laptop } from "lucide-react";

const categories = [
  { icon: Scissors, label: "Tailoring & Apparel", color: "text-marigold" },
  { icon: ChefHat, label: "Food & Baking", color: "text-clay" },
  { icon: Wrench, label: "Repair Services", color: "text-workshop" },
  { icon: Laptop, label: "Digital Skills", color: "text-ink" },
];

export default function HomePage() {
  return (
    <div>
      {/* ---- Hero: ledger-ruled paper backdrop, hand-stamped headline ---- */}
      <section className="ledger-bg relative overflow-hidden border-b border-paper-line px-6 py-24">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-6 flex justify-center">
            <StampBadge tone="marigold">Skill-to-Startup Enablement</StampBadge>
          </div>
          <h1 className="font-display text-5xl font-semibold leading-[1.1] text-ink md:text-6xl">
            You already have the skill.
            <br />
            <span className="text-marigold">We&apos;ll help you write the business plan.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-ink-soft">
            Tell us what you&apos;re good at — tailoring, baking, repair, design, anything —
            and get matched business ideas, a step-by-step roadmap, and a mentor who&apos;s done it before.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link href="/register"><Button size="lg">Find My Business Idea</Button></Link>
            <Link href="/mentors/apply"><Button size="lg" variant="outline">Become a Mentor</Button></Link>
          </div>
        </div>
      </section>

      {/* ---- How it works: numbered like ledger entries, since it IS a real sequence ---- */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center font-display text-3xl font-semibold text-ink">From skill to storefront, in three entries</h2>
          <div className="mt-14 grid grid-cols-1 gap-8 md:grid-cols-3">
            {[
              { icon: Compass, num: "01", title: "Profile your skills", body: "Tell us your skills, available hours, and budget. Takes about three minutes." },
              { icon: Map, num: "02", title: "Get a matched roadmap", body: "See ranked business ideas with an explainable match score, then follow a phased launch roadmap." },
              { icon: Users, num: "03", title: "Learn from a mentor", body: "Ask questions or book a session with someone who has actually run a business like yours." },
            ].map((step) => (
              <Card key={step.num} className="relative">
                <span className="font-mono text-xs text-marigold">{step.num}</span>
                <step.icon className="mt-3 h-8 w-8 text-ink" strokeWidth={1.75} />
                <h3 className="mt-4 font-display text-xl font-semibold text-ink">{step.title}</h3>
                <p className="mt-2 text-sm text-ink-soft">{step.body}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ---- Category showcase ---- */}
      <section className="border-t border-paper-line bg-white px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center font-display text-3xl font-semibold text-ink">Built for the skills people already have</h2>
          <div className="mt-12 grid grid-cols-2 gap-6 md:grid-cols-4">
            {categories.map((cat) => (
              <div key={cat.label} className="flex flex-col items-center gap-3 rounded-card border border-paper-line p-8 text-center transition-transform hover:-translate-y-1">
                <cat.icon className={`h-9 w-9 ${cat.color}`} strokeWidth={1.75} />
                <span className="text-sm font-medium text-ink">{cat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---- CTA ---- */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-3xl rounded-card border-2 border-ink bg-ink px-10 py-14 text-center text-paper">
          <h2 className="font-display text-3xl font-semibold">Ready to open your ledger?</h2>
          <p className="mt-3 text-paper/80">Join for free. No credit card, no funding pitch — just a clear next step.</p>
          <div className="mt-8">
            <Link href="/register"><Button size="lg">Create Your Free Account</Button></Link>
          </div>
        </div>
      </section>
    </div>
  );
}
