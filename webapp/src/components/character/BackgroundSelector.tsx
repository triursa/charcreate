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
    <div className="grid gap-4 md:grid-cols-2">
      {loading ? (
        <div>Loading backgrounds...</div>
      ) : error ? (
        <div className="text-red-500">Error: {error}</div>
      ) : (
        backgrounds.map((bg) => {
          // Parse skill proficiencies
          const skillProfs = (() => {
            if (!bg.skillProficiencies || !Array.isArray(bg.skillProficiencies)) return [];
            return bg.skillProficiencies.map((skill: any) => {
              if (typeof skill === 'string') return skill;
              if (typeof skill === 'object' && skill !== null) {
                if (skill.choose && skill.from) {
                  const count = skill.choose.count || 1;
                  const options = Array.isArray(skill.from) ? skill.from.join(', ') : 'Any';
                  return `Choose ${count} from: ${options}`;
                }
                if (skill.name) return skill.name;
                return Object.keys(skill).join(', ');
              }
              return 'Unknown skill';
            }).filter(Boolean);
          })();

          // Parse tool proficiencies
          const toolProfs = (() => {
            if (!bg.toolProficiencies || !Array.isArray(bg.toolProficiencies)) return [];
            return bg.toolProficiencies.map((tool: any) => {
              if (typeof tool === 'string') return tool;
              if (typeof tool === 'object' && tool !== null) {
                if (tool.choose && tool.from) {
                  const count = tool.choose.count || 1;
                  const options = Array.isArray(tool.from) ? tool.from.join(', ') : 'Any';
                  return `Choose ${count} from: ${options}`;
                }
                if (tool.name) return tool.name;
                return Object.keys(tool).join(', ');
              }
              return 'Unknown tool';
            }).filter(Boolean);
          })();

          // Parse languages
          const languages = (() => {
            if (!bg.languages || !Array.isArray(bg.languages)) return [];
            return bg.languages.map((lang: any) => {
              if (typeof lang === 'string') return lang;
              if (typeof lang === 'object' && lang !== null) {
                if (lang.choose && lang.from) {
                  const count = lang.choose.count || 1;
                  const options = Array.isArray(lang.from) ? lang.from.join(', ') : 'Any';
                  return `Choose ${count} from: ${options}`;
                }
                if (lang.name) return lang.name;
                return 'Choose any language';
              }
              return 'Unknown language';
            }).filter(Boolean);
          })();

          // Parse feature
          const feature = (() => {
            if (!bg.feature) return null;
            if (typeof bg.feature === 'string') return bg.feature;
            if (typeof bg.feature === 'object' && bg.feature !== null) {
              if (bg.feature.name) return bg.feature.name;
              if (bg.feature.entries && Array.isArray(bg.feature.entries)) {
                return bg.feature.entries.map((entry: any) => 
                  typeof entry === 'string' ? entry : JSON.stringify(entry)
                ).join(' ');
              }
            }
            return null;
          })();

          return (
            <div
              key={bg.id}
              className={`border rounded-lg p-4 cursor-pointer ${backgroundId === bg.id ? 'border-indigo-500 bg-indigo-50 dark:border-indigo-400 dark:bg-indigo-950' : 'border-slate-300 bg-transparent dark:border-slate-600'}`}
              onClick={() => actions.setBackground(bg)}
            >
              <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100">{bg.name}</h3>
              {bg.source && <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">{bg.source}</p>}
              
              {/* Skills - only show if there are any */}
              {skillProfs.length > 0 && (
                <div className="mt-2">
                  <span className="font-semibold text-sm">Skills:</span>
                  <div className="ml-2 text-sm">
                    {skillProfs.map((skill, i) => (
                      <div key={i} className="text-slate-700 dark:text-slate-300">{skill}</div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tools - only show if there are any */}
              {toolProfs.length > 0 && (
                <div className="mt-2">
                  <span className="font-semibold text-sm">Tools:</span>
                  <div className="ml-2 text-sm">
                    {toolProfs.map((tool, i) => (
                      <div key={i} className="text-slate-700 dark:text-slate-300">{tool}</div>
                    ))}
                  </div>
                </div>
              )}

              {/* Languages - only show if there are any */}
              {languages.length > 0 && (
                <div className="mt-2">
                  <span className="font-semibold text-sm">Languages:</span>
                  <div className="ml-2 text-sm">
                    {languages.map((lang, i) => (
                      <div key={i} className="text-slate-700 dark:text-slate-300">{lang}</div>
                    ))}
                  </div>
                </div>
              )}

              {/* Feature - only show if there is one */}
              {feature && (
                <div className="mt-2">
                  <span className="font-semibold text-sm">Feature:</span>
                  <div className="ml-2 text-sm text-slate-700 dark:text-slate-300">
                    {feature}
                  </div>
                </div>
              )}
            </div>
          );
        })
        )}
    </div>
  );
}
