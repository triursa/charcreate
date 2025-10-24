import React, { useMemo } from 'react';
import { useCharacterState } from '../state/store';
import { useComputedCharacter } from '../hooks/useComputedCharacter';
import { races } from '../data/races';
import { backgrounds } from '../data/backgrounds';
import { classes } from '../data/classes';
import { abilities, abilityLabels } from '../utils/abilities';
import { allSkills, skillAbilities } from '../utils/skills';
import DiceRoller from './DiceRoller';

const fighter = classes.find((klass) => klass.id === 'fighter')!;

const formatMod = (value: number) => (value >= 0 ? `+${value}` : value.toString());

const SummaryStep: React.FC = () => {
  const { name, level, raceId, backgroundId, subclassId } = useCharacterState((state) => ({
    name: state.name,
    level: state.level,
    raceId: state.raceId,
    backgroundId: state.backgroundId,
    subclassId: state.subclassId,
  }));

  const { stats, context } = useComputedCharacter();

  const race = useMemo(() => races.find((item) => item.id === raceId) ?? null, [raceId]);
  const background = useMemo(() => backgrounds.find((item) => item.id === backgroundId) ?? null, [backgroundId]);
  const subclass = useMemo(() => fighter.subclasses.find((item) => item.id === subclassId) ?? null, [subclassId]);

  const auditTargets: Array<{ key: string; label: string }> = [
    { key: 'hp.max', label: 'Hit Points' },
    { key: 'ac.base', label: 'Armor Class' },
    { key: 'speed.walk', label: 'Speed (Walk)' },
    { key: 'speed.fly', label: 'Speed (Fly)' },
    { key: 'languages', label: 'Languages' },
  ];

  return (
    <div className="space-y-8">
      <section className="card p-6 space-y-4">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="step-title">Character Summary</h2>
            <p className="text-sm text-slate-300">
              {name} • Level {level} {race ? race.name : 'Unassigned'} {context.klass.name}
              {background ? ` • ${background.name}` : ''}
            </p>
          </div>
          <div className="text-xs uppercase tracking-wide text-slate-400">
            {subclass ? `${subclass.name} Archetype` : 'No subclass chosen'}
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          <div className="rounded-lg border border-surface-400/40 bg-surface-200/50 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-400">Proficiency Bonus</p>
            <p className="text-2xl font-semibold text-slate-100">{formatMod(stats.proficiencyBonus)}</p>
          </div>
          <div className="rounded-lg border border-surface-400/40 bg-surface-200/50 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-400">Armor Class</p>
            <p className="text-2xl font-semibold text-slate-100">{stats.armorClass}</p>
          </div>
          <div className="rounded-lg border border-surface-400/40 bg-surface-200/50 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-400">Hit Points</p>
            <p className="text-2xl font-semibold text-slate-100">{stats.hitPoints}</p>
          </div>
          <div className="rounded-lg border border-surface-400/40 bg-surface-200/50 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-400">Speed</p>
            <p className="text-2xl font-semibold text-slate-100">
              {stats.speed.walk} ft{stats.speed.fly ? ` / Fly ${stats.speed.fly} ft` : ''}
            </p>
          </div>
        </div>
      </section>

      <section className="card p-6 space-y-4">
        <h2 className="step-title">Ability Scores</h2>
        <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-6">
          {abilities.map((ability) => (
            <div key={ability} className="rounded-lg border border-surface-400/40 bg-surface-200/40 p-3 text-center">
              <p className="text-xs uppercase tracking-wide text-slate-400">{abilityLabels[ability]}</p>
              <p className="text-xl font-semibold text-slate-100">{stats.abilityScores[ability]}</p>
              <p className="text-sm text-slate-300">{formatMod(stats.abilityModifiers[ability])}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="card p-6 space-y-4">
        <h2 className="step-title">Saving Throws</h2>
        <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-6">
          {abilities.map((ability) => (
            <div key={ability} className="rounded-lg border border-surface-400/40 bg-surface-200/40 p-3 text-center">
              <p className="text-xs uppercase tracking-wide text-slate-400">{abilityLabels[ability]}</p>
              <p className="text-xl font-semibold text-slate-100">{formatMod(stats.saves[ability])}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="card p-6 space-y-4">
        <h2 className="step-title">Skills</h2>
        <div className="grid gap-3 md:grid-cols-3">
          {allSkills.map((skill) => (
            <div key={skill} className="rounded-lg border border-surface-400/40 bg-surface-200/40 p-3">
              <p className="text-xs uppercase tracking-wide text-slate-400">{skill}</p>
              <p className="text-lg font-semibold text-slate-100">{formatMod(stats.skills[skill])}</p>
              <p className="text-xs text-slate-500">Based on {abilityLabels[skillAbilities[skill]]}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="card p-6 space-y-4">
        <div className="flex flex-col gap-2 md:flex-row md:justify-between md:items-center">
          <div>
            <h2 className="step-title">Languages</h2>
            <p className="text-sm text-slate-300">Combined from ancestry and upbringing.</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {stats.languages.map((language) => (
            <span
              key={language}
              className="rounded-full border border-surface-400/40 bg-surface-200/60 px-3 py-1 text-sm text-slate-200"
            >
              {language}
            </span>
          ))}
          {stats.languages.length === 0 && <span className="text-sm text-slate-500">No languages selected.</span>}
        </div>
      </section>

      <section className="card p-6 space-y-4">
        <h2 className="step-title">Audit Trail</h2>
        <p className="text-sm text-slate-300">
          Every derived value lists its contributing sources. Higher-precedence features replace or override lower-precedence
          ones automatically.
        </p>
        <div className="space-y-3">
          {auditTargets.map(({ key, label }) => {
            const entries = stats.audit[key] ?? [];
            if (!entries.length) return null;
            return (
              <details key={key} className="rounded-lg border border-surface-400/40 bg-surface-200/50 p-3">
                <summary className="cursor-pointer text-sm font-semibold text-slate-200">{label}</summary>
                <ul className="mt-3 space-y-2 text-sm text-slate-300">
                  {entries.map((entry) => (
                    <li key={entry.id} className="rounded border border-surface-400/40 bg-surface-100/40 p-2">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-100">{entry.sourceName}</span>
                        <span className="text-xs uppercase tracking-wide text-slate-500">{entry.sourceType}</span>
                      </div>
                      <p className="text-xs text-slate-400">{entry.detail}</p>
                    </li>
                  ))}
                </ul>
              </details>
            );
          })}
        </div>
      </section>

      <DiceRoller />
    </div>
  );
};

export default SummaryStep;
