import { useEffect, useState } from 'react';
import { useCharacterBuilder } from '@/state/character-builder';

export type Background = {
  id: string;
  name: string;
  entries?: any;
  skillProficiencies?: any;
  toolProficiencies?: any;
  languages?: any;
  feature?: any;
  source?: string;
};

export function BackgroundSelector() {
  const {
    state: { backgroundId },
    actions,
  } = useCharacterBuilder();
  const [backgrounds, setBackgrounds] = useState<Background[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchBackgrounds() {
      try {
        const res = await fetch('/api/backgrounds');
        if (!res.ok) throw new Error('Failed to fetch backgrounds');
        const data = await res.json();
        setBackgrounds(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchBackgrounds();
  }, []);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Background</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Choose a background to gain skills, tools, languages, and features.
          </p>
        </div>
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {loading ? (
          <div>Loading backgrounds...</div>
        ) : error ? (
          <div className="text-red-500">Error: {error}</div>
        ) : (
          backgrounds.map((bg) => (
            <div
              key={bg.id}
              className={`border rounded-lg p-4 cursor-pointer ${backgroundId === bg.id ? 'border-indigo-500 bg-indigo-50 dark:border-indigo-400 dark:bg-indigo-950' : 'border-slate-300 bg-transparent dark:border-slate-600'}`}
              onClick={() => actions.setBackground(bg)}
            >
              <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100">{bg.name}</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">{bg.source}</p>
              <div className="mt-2">
                <span className="font-semibold">Skills:</span>
                <ul className="ml-2">
                  {Array.isArray(bg.skillProficiencies) && bg.skillProficiencies.map((skill: any, i: number) => (
                    <li key={i}>{typeof skill === 'string' ? skill : JSON.stringify(skill)}</li>
                  ))}
                </ul>
              </div>
              <div className="mt-2">
                <span className="font-semibold">Tools:</span>
                <ul className="ml-2">
                  {Array.isArray(bg.toolProficiencies) && bg.toolProficiencies.map((tool: any, i: number) => (
                    <li key={i}>{typeof tool === 'string' ? tool : JSON.stringify(tool)}</li>
                  ))}
                </ul>
              </div>
              <div className="mt-2">
                <span className="font-semibold">Languages:</span>
                <ul className="ml-2">
                  {Array.isArray(bg.languages) && bg.languages.map((lang: any, i: number) => (
                    <li key={i}>{typeof lang === 'string' ? lang : JSON.stringify(lang)}</li>
                  ))}
                </ul>
              </div>
              <div className="mt-2">
                <span className="font-semibold">Feature:</span>
                <div className="ml-2 text-xs">
                  {bg.feature ? (typeof bg.feature === 'string' ? bg.feature : JSON.stringify(bg.feature)) : '—'}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
