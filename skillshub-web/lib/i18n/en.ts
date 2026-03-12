const en = {
  // TopBar
  topbar: {
    brand: 'SKILLS',
    brandHighlight: 'BRAIN',
    navStrategies: 'STRATEGIES',
    navSkills: 'SKILLS',
    navPlayground: 'PLAYGROUND',
    navOss: 'OSS',
    navRoadmap: 'ROADMAP',
    systemOnline: 'SYSTEM ONLINE',
  },

  // Hero
  hero: {
    badge: 'Skills Marketplace for BSC Builders',
    titleLine1: 'INTELLIGENCE',
    titleLine2: 'UNLEASHED',
    subtitle: 'A single hub for original SkillsHub modules and curated open-source skills.',
    subtitleLine2: 'Find, install, and run what your team needs in one place.',
    ctaPlayground: 'LAUNCH PLAYGROUND',
  },

  // StrategyPanel
  strategy: {
    title: 'DIFFERENTIATED LAUNCH TRACKS',
    subtitle: 'Skills excluded from the initial launch to maintain differentiation. Planned for Phase-2.',
    phaseTag: 'PHASE-2',
  },

  // SkillsGrid
  skills: {
    title: 'SKILL MARKETPLACE',
    subtitle: 'Original builds plus curated open-source skills, organized for practical BSC use.',
    modulesLabel: 'MODULES',
    availableNow: 'Available Now',
    trackOverview: 'Track Overview',
    github: 'GITHUB',
    details: 'DETAILS',
    tryIt: 'TRY IT',
    source: 'Source',
    xProfile: 'X',
    maintainedBy: 'Maintained by',
    provenanceOriginal: 'ORIGINAL',
    provenanceCurated: 'CURATED',
    provenanceAdapted: 'ADAPTED',
    sectionBinanceEyebrow: 'Binance Market Track',
    sectionBinanceTitle: 'Binance Signals',
    sectionBinanceSubtitle: 'Spot, futures, onchain-risk, and microstructure utilities for daily market reads.',
    sectionFourMemeEyebrow: 'Four.Meme Launch Track',
    sectionFourMemeTitle: 'Four.Meme Ops',
    sectionFourMemeSubtitle: 'Launch, trade, mempool watch, and migration workflows with explicit guardrails.',
    sectionBap578Eyebrow: 'BAP578 Builder Track',
    sectionBap578Title: 'BAP578 Dev Kit',
    sectionBap578Subtitle: 'Adapter design, vault safety, deployment, and test scaffolding for builder teams.',
    sectionEcosystemEyebrow: 'BSC Ecosystem Track',
    sectionEcosystemTitle: 'BSC Extensions',
    sectionEcosystemSubtitle: 'NFT, prediction-market, registry, cluster, and multi-platform expansion modules.',
  },

  // Playground
  playground: {
    title: 'SKILL PLAYGROUND',
    subtitle: 'Configure parameters, execute skills, and inspect outputs — all in your browser.',
    selectSkill: 'Select Skill',
    apiBase: 'API Base (Optional)',
    apiPath: 'API Path',
    apiKey: 'API Key (Optional)',
    install: 'Install',
    inputJson: 'Input JSON',
    runSkill: 'Run Skill',
    processing: 'Processing...',
    outputConsole: 'Output Console',
    success: 'SUCCESS',
    error: 'ERROR',
    readyToExecute: 'Ready to execute...',
  },

  // InstallGuide
  install: {
    title: 'START BUILDING LOCALLY',
    subtitle: 'Every skill runs standalone via npx. No setup required — just pick a module and go.',
    copied: 'Copied!',
    clickToCopy: 'Click to Copy',
    step1: 'Pick Skill',
    step2: 'Run with npx',
    step3: 'Fork & Extend',
  },

  // OssIntake
  oss: {
    title: 'OPEN SOURCE INTAKE',
    subtitle: 'Curated open-source projects being adapted for the BSC skill ecosystem.',
    intakeTrack: 'Internal Intake Track',
    viewRepo: 'VIEW REPO',
  },

  research: {
    eyebrow: 'Web Research Radar',
    title: 'Fresh Module Radar',
    subtitle: 'Web-sourced modules that fit the current Binance, BNB Chain, and agent-tooling roadmap. Shown as a separate frontend block before deeper intake work.',
    modulesLabel: 'MODULES',
    researched: 'researched',
    whyNow: 'WHY NOW',
    defaultNote: 'Recent fit discovered via repo research for the current roadmap.',
    viewSource: 'VIEW SOURCE',
  },

  // SkillDetail page
  skillDetail: {
    backToIndex: '← Back to Skills Index',
    installCommand: 'Install Command',
    exampleInput: 'Example Input',
    provenance: 'Provenance',
    source: 'Source',
    xProfile: 'X',
    license: 'License',
    maintainedBy: 'Maintained by',
    tryInPlayground: 'Try in Playground',
    openInGithub: 'Open in GitHub',
    viewAllSkills: 'View All Skills',
  },

  // Footer
  footer: {
    copyright: 'SKILLSHUB. ALL SYSTEMS OPERATIONAL.',
  },

  // Language switcher
  lang: {
    switchLabel: 'EN / 中',
  },
};

export type TranslationKeys = typeof en;
export default en;
