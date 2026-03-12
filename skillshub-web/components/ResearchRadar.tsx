'use client';

import { useEffect, useState } from 'react';
import { ApiClient } from '@/lib/api';
import { OpenSourceCandidate } from '@/lib/types';
import { useTranslation } from '@/lib/i18n';

export default function ResearchRadar() {
  const { t } = useTranslation();
  const [modules, setModules] = useState<OpenSourceCandidate[]>([]);

  useEffect(() => {
    ApiClient.getCatalog().then((catalog) => {
      setModules((catalog.openSourceCandidates || []).filter((item) => item.featuredModule));
    });
  }, []);

  if (!modules.length) {
    return null;
  }

  return (
    <section className="py-20 bg-panel border-y border-gold/5">
      <div className="container mx-auto px-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between mb-10">
          <div className="max-w-3xl">
            <div className="text-[11px] font-mono uppercase tracking-[0.35em] text-gold/70">
              {t.research.eyebrow}
            </div>
            <h2 className="mt-3 text-3xl md:text-4xl font-heading font-bold text-text-main">
              {t.research.title}
            </h2>
            <p className="mt-3 text-text-sub">
              {t.research.subtitle}
            </p>
          </div>
          <div className="rounded-full border border-gold/20 px-4 py-2 text-xs font-mono uppercase tracking-[0.25em] text-gold">
            {modules.length} {t.research.modulesLabel}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {modules.map((item) => (
            <div
              key={item.name}
              className="rounded-[24px] border border-gold/15 bg-bg/60 p-6 transition-colors hover:border-gold/40"
            >
              <div className="flex items-start justify-between gap-4 mb-5">
                <div>
                  <div className="text-[11px] font-mono uppercase tracking-[0.3em] text-text-sub/55">
                    {item.sourceTag}
                  </div>
                  <h3 className="mt-2 text-2xl font-heading font-bold text-text-main">
                    {item.name}
                  </h3>
                </div>
                <span className="rounded-full border border-white/10 px-3 py-1 text-[10px] font-mono uppercase tracking-[0.25em] text-text-sub/70">
                  {t.research.researched}
                </span>
              </div>

              <p className="text-sm text-text-sub min-h-[4.5rem]">
                {item.adaptation}
              </p>

              <div className="mt-5 rounded-2xl border border-white/8 bg-white/[0.02] p-4">
                <div className="text-[11px] font-mono uppercase tracking-[0.25em] text-gold/80">
                  {t.research.whyNow}
                </div>
                <p className="mt-2 text-sm text-text-sub">
                  {item.researchNote || t.research.defaultNote}
                </p>
              </div>

              {item.repo ? (
                <div className="mt-5 flex justify-end">
                  <a
                    href={item.repo}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm font-mono uppercase tracking-[0.2em] text-gold hover:text-white transition-colors"
                  >
                    {t.research.viewSource}
                  </a>
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
