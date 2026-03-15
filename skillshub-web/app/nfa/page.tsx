import Link from 'next/link';
import TopBar from '@/components/TopBar';
import SiteFooter from '@/components/SiteFooter';
import NfaWalletPanel from '@/components/NfaWalletPanel';

const cards = [
  {
    label: 'Membership Lane',
    value: '177',
    note: 'Limited seats for the long-term Skill membership path.'
  },
  {
    label: 'Membership Price',
    value: '0.1 BNB',
    note: 'Preview pricing for the NFA lane. Mint remains closed on this page.'
  },
  {
    label: 'Single Unlock',
    value: '$10 burn',
    note: 'Individual premium skill access stays available as a lighter entry path.'
  }
];

const benefitCards = [
  {
    title: 'Dual Access Structure',
    body:
      'This page frames the two-lane model clearly: single-skill unlocks for tactical users, NFA membership for long-term holders.'
  },
  {
    title: 'Read Before Write',
    body:
      'We are shipping useful BSC read-side skills first, then layering the membership surface on top. The page reflects that order.'
  },
  {
    title: 'Wallet Readiness',
    body:
      'The first implementation solves connection and chain-readiness only. It avoids pretending mint is live before the flow is ready.'
  }
];

export default function NfaPage() {
  return (
    <main className="min-h-screen bg-bg text-text-main">
      <TopBar />

      <section className="relative overflow-hidden border-b border-white/5 pt-28">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(240,190,87,0.18),transparent_38%),radial-gradient(circle_at_bottom_right,rgba(56,189,248,0.14),transparent_30%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(240,190,87,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(240,190,87,0.04)_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-40" />

        <div className="container relative z-10 mx-auto px-6 pb-20">
          <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-gold/20 bg-gold/10 px-4 py-2 text-[11px] font-mono uppercase tracking-[0.35em] text-gold/80">
                Skill NFA Preview
              </div>
              <h1 className="mt-6 max-w-4xl font-heading text-5xl font-bold leading-[0.95] md:text-7xl">
                A separate lane for
                <span className="block bg-gradient-to-r from-gold via-[#ffd48c] to-sky-300 bg-clip-text text-transparent">
                  long-term Skill holders
                </span>
              </h1>
              <p className="mt-6 max-w-3xl text-lg leading-8 text-text-sub">
                We are not turning this into a hard-sell mint page. This route exists to make the
                membership structure legible early: `177` planned NFA seats at `0.1 BNB`, plus a
                lighter path where users unlock a single premium Skill by burning `$10` equivalent.
              </p>
              <p className="mt-4 max-w-3xl text-base leading-7 text-text-sub/80">
                The page is intentionally read-first. Wallet connection is live, network readiness
                is live, mint stays disabled until the rest of the flow is actually ready.
              </p>

              <div className="mt-10 grid gap-4 md:grid-cols-3">
                {cards.map((card) => (
                  <div
                    key={card.label}
                    className="rounded-[24px] border border-white/10 bg-panel/70 p-5 backdrop-blur"
                  >
                    <div className="text-[11px] font-mono uppercase tracking-[0.3em] text-text-sub/60">
                      {card.label}
                    </div>
                    <div className="mt-3 text-3xl font-heading font-bold text-text-main">
                      {card.value}
                    </div>
                    <p className="mt-3 text-sm leading-6 text-text-sub">{card.note}</p>
                  </div>
                ))}
              </div>
            </div>

            <NfaWalletPanel />
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="grid gap-6 lg:grid-cols-3">
            {benefitCards.map((card) => (
              <div
                key={card.title}
                className="rounded-[28px] border border-white/8 bg-panel/70 p-6"
              >
                <div className="text-[11px] font-mono uppercase tracking-[0.3em] text-gold/70">
                  Why This Page
                </div>
                <h2 className="mt-4 text-2xl font-heading font-bold text-text-main">
                  {card.title}
                </h2>
                <p className="mt-4 text-sm leading-7 text-text-sub">{card.body}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_1fr]">
            <div className="rounded-[28px] border border-gold/10 bg-panel/60 p-7">
              <div className="text-[11px] font-mono uppercase tracking-[0.35em] text-gold/70">
                Structure
              </div>
              <h2 className="mt-4 text-3xl font-heading font-bold text-text-main">
                Two access models, different commitment levels
              </h2>
              <div className="mt-6 space-y-5 text-sm leading-7 text-text-sub">
                <p>
                  `Single unlock` is for users who only need one premium Skill right now. The
                  current draft assumes a `$10` equivalent token burn per unlock.
                </p>
                <p>
                  `NFA membership` is for users who want the long-term lane. The draft structure is
                  `177` seats, `0.1 BNB` each, with the page positioned as a durable membership pass
                  rather than a speculative profile-picture drop.
                </p>
                <p>
                  Keeping both lanes matters. It prevents the premium path from becoming
                  unnecessarily all-or-nothing.
                </p>
              </div>
            </div>

            <div className="rounded-[28px] border border-white/8 bg-panel/60 p-7">
              <div className="text-[11px] font-mono uppercase tracking-[0.35em] text-gold/70">
                Current Status
              </div>
              <h2 className="mt-4 text-3xl font-heading font-bold text-text-main">
                Preview live. Mint closed.
              </h2>
              <div className="mt-6 space-y-4 text-sm leading-7 text-text-sub">
                <p>Wallet connection is available now so we can sort provider and BSC network readiness early.</p>
                <p>No contract interaction is wired in yet. No live mint call is exposed on this route.</p>
                <p>
                  This keeps the surface useful without pretending the launch flow is finished before
                  it really is.
                </p>
              </div>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/"
                  className="rounded-2xl border border-gold/20 px-5 py-3 text-sm font-mono uppercase tracking-[0.2em] text-gold transition-colors hover:border-gold hover:text-white"
                >
                  Back To Hub
                </Link>
                <a
                  href="/#skills"
                  className="rounded-2xl border border-white/10 px-5 py-3 text-sm font-mono uppercase tracking-[0.2em] text-text-sub transition-colors hover:border-gold/30 hover:text-gold"
                >
                  View Live Skills
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
