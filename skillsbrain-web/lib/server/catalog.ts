import fs from 'node:fs';
import path from 'node:path';
import type {
  CatalogPayload,
  ExcludedDirection,
  OpenSourceCandidate,
  Skill,
  SkillLibrary
} from '@/lib/types';

interface LibraryFile {
  libraryId: string;
  name: string;
  version: string;
  description?: string;
  skills?: Skill[];
  excludedDirections?: ExcludedDirection[];
  openSourceCandidates?: OpenSourceCandidate[];
}

const SKILLS_ROOT = path.join(process.cwd(), 'skills');

function readJson<T>(filePath: string): T {
  return JSON.parse(fs.readFileSync(filePath, 'utf8')) as T;
}

function dedupeBy<T>(items: T[], keyFn: (item: T) => string): T[] {
  const map = new Map<string, T>();
  for (const item of items) {
    map.set(keyFn(item), item);
  }
  return Array.from(map.values());
}

function listLibraryFiles() {
  if (!fs.existsSync(SKILLS_ROOT)) {
    return [] as string[];
  }

  return fs
    .readdirSync(SKILLS_ROOT, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && entry.name.startsWith('lib-'))
    .map((entry) => path.join(SKILLS_ROOT, entry.name, 'library.json'))
    .filter((p) => fs.existsSync(p));
}

function loadLibraries(): { libraries: SkillLibrary[]; skills: Skill[]; excludedDirections: ExcludedDirection[]; openSourceCandidates: OpenSourceCandidate[] } {
  const files = listLibraryFiles();

  const libraries: SkillLibrary[] = [];
  const skills: Skill[] = [];
  const excludedDirections: ExcludedDirection[] = [];
  const openSourceCandidates: OpenSourceCandidate[] = [];

  for (const file of files) {
    const parsed = readJson<LibraryFile>(file);

    libraries.push({
      libraryId: parsed.libraryId,
      name: parsed.name,
      version: parsed.version,
      description: parsed.description,
      localPath: path.relative(process.cwd(), path.dirname(file))
    });

    for (const skill of parsed.skills || []) {
      skills.push({
        ...skill,
        libraryId: parsed.libraryId,
        libraryName: parsed.name
      });
    }

    excludedDirections.push(...(parsed.excludedDirections || []));
    openSourceCandidates.push(...(parsed.openSourceCandidates || []));
  }

  return {
    libraries,
    skills,
    excludedDirections: dedupeBy(excludedDirections, (x) => x.slug),
    openSourceCandidates: dedupeBy(openSourceCandidates, (x) => x.repo)
  };
}

export function loadCatalogPayload(): CatalogPayload {
  const loaded = loadLibraries();

  return {
    generatedAt: new Date().toISOString(),
    libraries: loaded.libraries,
    skills: loaded.skills,
    excludedDirections: loaded.excludedDirections,
    openSourceCandidates: loaded.openSourceCandidates
  };
}

export function loadSkillIds(): Set<string> {
  const payload = loadCatalogPayload();
  return new Set(payload.skills.map((x) => x.id));
}
