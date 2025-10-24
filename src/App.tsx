import React, { useMemo, useState } from 'react';
import SelectionStep from './components/SelectionStep';
import FeatureReviewStep from './components/FeatureReviewStep';
import SummaryStep from './components/SummaryStep';
import { useComputedCharacter } from './hooks/useComputedCharacter';
import { abilities, abilityLabels } from './utils/abilities';

const steps = [
  { id: 1, title: 'Foundations' },
  { id: 2, title: 'Features' },
  { id: 3, title: 'Summary' },
];

const App: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const { stats } = useComputedCharacter();

  const stepContent = useMemo(() => {
    switch (currentStep) {
      case 1:
        return <SelectionStep />;
      case 2:
        return <FeatureReviewStep />;
      case 3:
      default:
        return <SummaryStep />;
    }
  }, [currentStep]);

  return (
    <div className="min-h-screen bg-surface-100 text-slate-100">
      <header className="border-b border-surface-400/40 bg-surface-200/30 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-100">Charcreate</h1>
            <p className="text-sm text-slate-400">Intelligent D&amp;D 5e character builder focused on transparency and speed.</p>
          </div>
          <div className="flex gap-2">
            {steps.map((step) => (
              <button
                key={step.id}
                type="button"
                onClick={() => setCurrentStep(step.id)}
                className={`rounded-full px-4 py-2 text-sm transition ${
                  currentStep === step.id
                    ? 'bg-sky-500 text-slate-900 shadow'
                    : 'bg-surface-300/60 text-slate-200 hover:bg-surface-300'
                }`}
              >
                {step.id}. {step.title}
              </button>
            ))}
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl space-y-8 px-6 py-10">
        {currentStep === 3 && (
          <div className="grid gap-4 rounded-xl border border-surface-400/40 bg-surface-200/40 p-4 md:grid-cols-3">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">Armor Class</p>
              <p className="text-lg font-semibold text-slate-100">{stats.armorClass}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">Hit Points</p>
              <p className="text-lg font-semibold text-slate-100">{stats.hitPoints}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">Proficiency Bonus</p>
              <p className="text-lg font-semibold text-slate-100">{stats.proficiencyBonus >= 0 ? `+${stats.proficiencyBonus}` : stats.proficiencyBonus}</p>
            </div>
          </div>
        )}
        {stepContent}
      </main>
      <footer className="border-t border-surface-400/40 bg-surface-200/30">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-6 md:flex-row md:items-center md:justify-between">
          <p className="text-sm text-slate-500">
            Precedence: Subclass &gt; Class &gt; Background &gt; Race. Ability scores reflect racial bonuses automatically.
          </p>
          <div className="flex flex-wrap gap-3 text-xs text-slate-400">
            {abilities.map((ability) => (
              <span key={ability} className="rounded-full border border-surface-400/40 px-3 py-1">
                {abilityLabels[ability]}
              </span>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
