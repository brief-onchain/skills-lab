'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { ApiClient } from '@/lib/api';
import { Skill } from '@/lib/types';
import gsap from 'gsap';
import { staggerReveal, hoverLift } from '@/lib/animations';
import { useTranslation } from '@/lib/i18n';
import { groupSkillsBySection, SkillSectionKey } from '@/lib/skillSections';

interface SectionViewModel {
  key: SkillSectionKey;
  eyebrow: string;
  title: string;
  subtitle: string;
  trackCardClassName: string;
  headerClassName: string;
  accentClassName: string;
  skills: Skill[];
}

export default function SkillsGrid() {
  const { t } = useTranslation();
  const [skills, setSkills] = useState<Skill[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const repoBase = process.env.NEXT_PUBLIC_SKILLS_GITHUB_REPO || '';

  const provenanceLabel = (skill: Skill) => {
    switch (skill.provenance) {
      case 'curated':
        return t.skills.provenanceCurated;
      case 'adapted':
        return t.skills.provenanceAdapted;
      default:
        return t.skills.provenanceOriginal;
    }
  };

  const sectionMeta = (key: SkillSectionKey) => {
    switch (key) {
      case 'binance':
        return {
          eyebrow: t.skills.sectionBinanceEyebrow,
          title: t.skills.sectionBinanceTitle,
          subtitle: t.skills.sectionBinanceSubtitle,
          trackCardClassName:
            'border-gold/20 bg-gradient-to-br from-gold/15 via-panel to-bg',
          headerClassName:
            'border-gold/20 bg-[radial-gradient(circle_at_top_left,rgba(240,190,87,0.22),transparent_45%),linear-gradient(135deg,rgba(240,190,87,0.08),rgba(9,8,7,0.92))]',
          accentClassName: 'bg-gold/70'
        };
      case 'fourMeme':
        return {
          eyebrow: t.skills.sectionFourMemeEyebrow,
          title: t.skills.sectionFourMemeTitle,
          subtitle: t.skills.sectionFourMemeSubtitle,
          trackCardClassName:
            'border-[#ff9a62]/20 bg-gradient-to-br from-[#ff9a62]/15 via-panel to-bg',
          headerClassName:
            'border-[#ff9a62]/20 bg-[radial-gradient(circle_at_top_left,rgba(255,154,98,0.22),transparent_45%),linear-gradient(135deg,rgba(255,154,98,0.08),rgba(9,8,7,0.92))]',
          accentClassName: 'bg-[#ff9a62]'
        };
      case 'bap578':
        return {
          eyebrow: t.skills.sectionBap578Eyebrow,
          title: t.skills.sectionBap578Title,
          subtitle: t.skills.sectionBap578Subtitle,
          trackCardClassName:
            'border-sky-400/20 bg-gradient-to-br from-sky-400/15 via-panel to-bg',
          headerClassName:
            'border-sky-400/20 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.22),transparent_45%),linear-gradient(135deg,rgba(56,189,248,0.08),rgba(9,8,7,0.92))]',
          accentClassName: 'bg-sky-400'
        };
      case 'ecosystem':
      default:
        return {
          eyebrow: t.skills.sectionEcosystemEyebrow,
          title: t.skills.sectionEcosystemTitle,
          subtitle: t.skills.sectionEcosystemSubtitle,
          trackCardClassName:
            'border-emerald-400/20 bg-gradient-to-br from-emerald-400/15 via-panel to-bg',
          headerClassName:
            'border-emerald-400/20 bg-[radial-gradient(circle_at_top_left,rgba(52,211,153,0.22),transparent_45%),linear-gradient(135deg,rgba(52,211,153,0.08),rgba(9,8,7,0.92))]',
          accentClassName: 'bg-emerald-400'
        };
    }
  };

  const sections: SectionViewModel[] = groupSkillsBySection(skills).map((section) => ({
    key: section.key,
    ...sectionMeta(section.key),
    skills: section.skills
  }));

  const scrollToSection = (key: SkillSectionKey) => {
    const target = document.getElementById(`skill-track-${key}`);
    target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  useEffect(() => {
    ApiClient.getSkills().then(setSkills);
  }, []);

  useEffect(() => {
    if (skills.length > 0 && containerRef.current) {
      const trigger = containerRef.current || undefined;
      const ctx = gsap.context(() => {
        const trackCards = gsap.utils.toArray<HTMLElement>('.skill-track-card');
        const cards = gsap.utils.toArray<HTMLElement>('.skill-card');
        if (trackCards.length) {
          staggerReveal(trackCards, trigger);
          trackCards.forEach(card => hoverLift(card));
        }
        staggerReveal(cards, trigger);
        cards.forEach(card => hoverLift(card));
      }, containerRef);
      return () => ctx.revert();
    }
  }, [skills]);

  return (
    <section id="skills" className="py-24 bg-bg relative" ref={containerRef}>
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <div>
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-text-main mb-4">
              {t.skills.title}
            </h2>
            <p className="text-text-sub max-w-xl">
              {t.skills.subtitle}
            </p>
          </div>
          <div className="text-right hidden md:block">
            <div className="text-gold font-mono text-xl font-bold">{skills.length} {t.skills.modulesLabel}</div>
            <div className="text-text-sub/50 text-xs uppercase tracking-wider">{t.skills.availableNow}</div>
          </div>
        </div>

        <div className="mb-10 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {sections.map((section) => (
            <button
              key={section.key}
              type="button"
              onClick={() => scrollToSection(section.key)}
              className={`skill-track-card rounded-[24px] border p-5 text-left opacity-0 transition-colors ${section.trackCardClassName}`}
            >
              <div className="text-[11px] font-mono uppercase tracking-[0.35em] text-gold/70">
                {section.eyebrow}
              </div>
              <div className="mt-5 flex items-end justify-between gap-3">
                <h3 className="text-2xl font-heading font-bold text-text-main">
                  {section.title}
                </h3>
                <span className="text-4xl font-heading leading-none text-gold">
                  {section.skills.length}
                </span>
              </div>
              <p className="mt-3 min-h-[3.75rem] text-sm text-text-sub">
                {section.subtitle}
              </p>
              <div className="mt-5 flex items-center justify-between text-[11px] font-mono uppercase tracking-[0.25em] text-text-sub/55">
                <span>{t.skills.trackOverview}</span>
                <span>{t.skills.availableNow}</span>
              </div>
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-8">
          {sections.map((section) => (
            <div
              key={section.key}
              id={`skill-track-${section.key}`}
              className="rounded-[28px] border border-gold/10 bg-panel/60 p-4 md:p-6"
            >
              <div className={`relative overflow-hidden rounded-[22px] border p-6 ${section.headerClassName}`}>
                <div className={`mb-4 h-1.5 w-24 rounded-full ${section.accentClassName}`} />
                <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
                  <div className="max-w-2xl">
                    <div className="text-[11px] font-mono uppercase tracking-[0.35em] text-text-sub/60">
                      {section.eyebrow}
                    </div>
                    <h3 className="mt-3 text-3xl font-heading font-bold text-text-main">
                      {section.title}
                    </h3>
                    <p className="mt-3 text-text-sub">
                      {section.subtitle}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="rounded-full border border-white/10 px-3 py-1 text-xs font-mono uppercase tracking-[0.2em] text-text-sub/70">
                      {section.skills.length} {t.skills.modulesLabel}
                    </span>
                    <span className="rounded-full border border-white/10 px-3 py-1 text-xs font-mono uppercase tracking-[0.2em] text-text-sub/70">
                      {t.skills.availableNow}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {section.skills.map((skill) => {
                  const repoUrl =
                    repoBase && skill.repoPath
                      ? `${repoBase.replace(/\/$/, '')}/tree/main/${skill.repoPath}`
                      : '';

                  return (
                    <div
                      key={skill.id}
                      className="skill-card p-8 bg-panel border border-gold/10 relative group overflow-hidden opacity-0"
                    >
                      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <svg width="64" height="64" viewBox="0 0 24 24" fill="currentColor" className="text-gold">
                          <path d="M12 2L2 7l10 5 10-5-10-5zm0 9l2.5-1.25L12 8.5l-2.5 1.25L12 11zm0 2.5l-5-2.5-5 2.5L12 22l10-8.5-5-2.5-5 2.5z"/>
                        </svg>
                      </div>

                      <div className="mb-6">
                        <span className="text-gold/80 text-xs font-mono border border-gold/20 px-2 py-1 rounded uppercase mr-2">
                          {skill.category}
                        </span>
                        <span className="text-text-sub/70 text-xs font-mono border border-white/10 px-2 py-1 rounded uppercase">
                          {skill.mode || 'live'}
                        </span>
                        <span className="ml-2 text-text-sub/70 text-xs font-mono border border-white/10 px-2 py-1 rounded uppercase">
                          {provenanceLabel(skill)}
                        </span>
                      </div>

                      <h3 className="text-2xl font-bold text-text-main mb-3 font-heading group-hover:text-gold transition-colors">
                        {skill.name}
                      </h3>

                      <p className="text-text-sub text-sm mb-6 min-h-[3rem]">
                        {skill.description}
                      </p>

                      {skill.provenance !== 'original' ? (
                        <div className="mb-6 flex flex-col gap-1">
                          <span className="text-[11px] text-text-sub/60 font-mono uppercase">
                            {t.skills.source}: {skill.sourceAttribution || 'Community Open-Source'}
                          </span>
                          {skill.sourceXHandle ? (
                            <span className="text-[11px] text-text-sub/50 font-mono uppercase">
                              {t.skills.xProfile}:{' '}
                              {skill.sourceXUrl ? (
                                <a
                                  href={skill.sourceXUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-gold hover:text-white transition-colors"
                                >
                                  {skill.sourceXHandle}
                                </a>
                              ) : (
                                skill.sourceXHandle
                              )}
                            </span>
                          ) : null}
                          <span className="text-[11px] text-text-sub/50 font-mono uppercase">
                            {t.skills.maintainedBy}: {skill.maintainedBy || 'SkillsHub'}
                          </span>
                        </div>
                      ) : null}

                      <div className="flex items-center justify-between pt-6 border-t border-white/5">
                        <span className="text-text-sub/40 font-mono text-xs">v{skill.version}</span>
                        <span className="text-text-sub/40 font-mono text-[10px] truncate max-w-[12rem]">
                          {skill.installCommand || ''}
                        </span>
                        <div className="flex items-center gap-3">
                          {repoUrl ? (
                            <a
                              href={repoUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-gold text-sm font-bold hover:text-white transition-colors"
                            >
                              {t.skills.github}
                            </a>
                          ) : null}
                          <Link
                            href={`/skills/${skill.id}`}
                            className="text-gold text-sm font-bold hover:text-white transition-colors"
                          >
                            {t.skills.details}
                          </Link>
                          <button
                            className="text-gold text-sm font-bold hover:text-white transition-colors flex items-center gap-2"
                            onClick={() => {
                              const playground = document.getElementById('playground');
                              playground?.scrollIntoView({ behavior: 'smooth' });
                            }}
                          >
                            {t.skills.tryIt} <span className="text-lg">→</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
