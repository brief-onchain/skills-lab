import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getSkillById } from '@/lib/server/catalog';

interface Props {
  params: {
    id: string;
  };
}

export default function SkillDetailPage({ params }: Props) {
  const skill = getSkillById(params.id);

  if (!skill) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-bg text-text-main">
      <div className="container mx-auto px-6 py-12">
        <Link href="/" className="text-gold font-mono text-sm hover:text-white transition-colors">
          ← Back to Skills Index
        </Link>

        <section className="mt-6 p-8 bg-panel border border-gold/20 rounded-xl">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className="text-xs font-mono px-2 py-1 border border-gold/30 rounded text-gold uppercase">
              {skill.category}
            </span>
            <span className="text-xs font-mono px-2 py-1 border border-white/10 rounded text-text-sub uppercase">
              {skill.mode || 'live'}
            </span>
            <span className="text-xs font-mono text-text-sub">v{skill.version}</span>
          </div>

          <h1 className="text-3xl md:text-4xl font-heading font-bold mb-4">{skill.name}</h1>
          <p className="text-text-sub mb-8 max-w-3xl">{skill.description}</p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="p-5 bg-bg border border-white/10 rounded-lg">
              <h2 className="text-gold font-mono text-xs uppercase tracking-wider mb-3">Install Command</h2>
              <pre className="text-sm font-mono overflow-x-auto">{skill.installCommand || 'npx @skillsbrain/your-skill'}</pre>
            </div>

            <div className="p-5 bg-bg border border-white/10 rounded-lg">
              <h2 className="text-gold font-mono text-xs uppercase tracking-wider mb-3">Example Input</h2>
              <pre className="text-sm font-mono overflow-x-auto">
                {JSON.stringify(skill.inputExample || {}, null, 2)}
              </pre>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href={`/#playground`}
              className="px-5 py-3 bg-gold text-bg font-bold rounded hover:bg-gold-dark transition-colors"
            >
              Try in Playground
            </Link>
            <Link
              href="/"
              className="px-5 py-3 border border-gold/30 text-gold rounded hover:border-gold transition-colors"
            >
              View All Skills
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
