import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-paper-line bg-paper">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-4">
          <div>
            <h3 className="font-display text-lg font-semibold text-ink">EntreSkill Hub</h3>
            <p className="mt-2 text-sm text-ink-soft">
              Helping skilled individuals turn a craft into a sustainable micro-business — one roadmap at a time.
            </p>
          </div>
          <div>
            <h4 className="text-xs font-mono uppercase tracking-wider text-ink-soft">Platform</h4>
            <ul className="mt-3 space-y-2 text-sm">
              <li><Link href="/ideas" className="text-ink-soft hover:text-marigold">Business Ideas</Link></li>
              <li><Link href="/resources" className="text-ink-soft hover:text-marigold">Learning Resources</Link></li>
              <li><Link href="/mentors" className="text-ink-soft hover:text-marigold">Find a Mentor</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-mono uppercase tracking-wider text-ink-soft">Get Involved</h4>
            <ul className="mt-3 space-y-2 text-sm">
              <li><Link href="/register" className="text-ink-soft hover:text-marigold">Create an Account</Link></li>
              <li><Link href="/mentors/apply" className="text-ink-soft hover:text-marigold">Become a Mentor</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-mono uppercase tracking-wider text-ink-soft">Reference</h4>
            <ul className="mt-3 space-y-2 text-sm text-ink-soft">
              <li>Unified Mentor</li>
              <li>U.S. Small Business Administration (SBA)</li>
            </ul>
          </div>
        </div>
        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-paper-line pt-6 text-xs text-ink-soft/70 md:flex-row">
          <span>© {new Date().getFullYear()} EntreSkill Hub. Built for aspiring micro-entrepreneurs.</span>
          <span className="font-mono">v1.0.0</span>
        </div>
      </div>
    </footer>
  );
}
