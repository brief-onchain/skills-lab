import type { Skill } from './types';

export type SkillSectionKey = 'binance' | 'fourMeme' | 'bap578' | 'ecosystem';

const FOUR_MEME_RELATED_IDS = new Set([
  'erc8004-fast-auth',
  'finclaw-meme-monitor-playbook'
]);

export const SKILL_SECTION_ORDER: SkillSectionKey[] = [
  'binance',
  'fourMeme',
  'bap578',
  'ecosystem'
];

export function getSkillSectionKey(skill: Skill): SkillSectionKey {
  if (skill.libraryId === 'lib-1-binance-market') {
    return 'binance';
  }

  if (skill.libraryId === 'lib-2-bap578-dev') {
    return 'bap578';
  }

  if (skill.id.startsWith('four-meme') || FOUR_MEME_RELATED_IDS.has(skill.id)) {
    return 'fourMeme';
  }

  return 'ecosystem';
}

export function groupSkillsBySection(skills: Skill[]) {
  return SKILL_SECTION_ORDER.map((key) => ({
    key,
    skills: skills.filter((skill) => getSkillSectionKey(skill) === key)
  })).filter((section) => section.skills.length > 0);
}
