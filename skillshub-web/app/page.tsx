'use client';

import { useEffect } from 'react';
import { ApiClient } from '@/lib/api';
import TopBar from '@/components/TopBar';
import Hero from '@/components/Hero';
import StrategyPanel from '@/components/StrategyPanel';
import SkillsGrid from '@/components/SkillsGrid';
import ResearchRadar from '@/components/ResearchRadar';
import Playground from '@/components/Playground';
import OssIntake from '@/components/OssIntake';
import InstallGuide from '@/components/InstallGuide';
import SiteFooter from '@/components/SiteFooter';

export default function Home() {
  useEffect(() => {
    // Initial health check
    ApiClient.checkHealth().then(res => {
      console.log('System Health:', res);
    });
  }, []);

  return (
    <main className="min-h-screen flex flex-col">
      <TopBar />
      <Hero />
      <StrategyPanel />
      <SkillsGrid />
      <ResearchRadar />
      <Playground />
      <OssIntake />
      <InstallGuide />

      <SiteFooter />
    </main>
  );
}
