import React from 'react';
import { useCharacterState } from '../state/store';
import { useComputedCharacter } from '../hooks/useComputedCharacter';
import { Feature } from '../data/types';

const FeatureCard: React.FC<{ feature: Feature }> = ({ feature }) => (
  <div className="rounded-xl border border-surface-400/40 bg-surface-200/60 p-4">
    <div className="flex items-center justify-between">
      <h3 className="font-semibold text-slate-100">{feature.name}</h3>
      <span className="text-xs uppercase tracking-wide text-slate-400">{feature.source}</span>
    </div>
    <p className="mt-2 text-sm text-slate-300">{feature.summary}</p>
  </div>
);

const ChoiceSelector: React.FC<{ feature: Feature; effect: any }> = ({ feature, effect }) => {
  const { effectChoices, setEffectChoice } = useCharacterState((state) => ({
    effectChoices: state.effectChoices,
    setEffectChoice: state.setEffectChoice,
  }));

  if (!effect.value || typeof effect.value !== 'object') {
    return null;
  }

  if (effect.value.type === 'choice') {
    const count = effect.value.count ?? 1;
    const options: string[] = effect.value.options ?? [];
    const current = effectChoices[effect.id];
    const values = Array.isArray(current)
      ? [...current]
      : typeof current === 'string'
      ? Array.from({ length: count }, (_, index) => (index === 0 ? current : options[index] ?? options[0]))
      : Array.from({ length: count }, (_, index) => options[index] ?? options[0]);

    const handleChange = (index: number, next: string) => {
      const updated = [...values];
      updated[index] = next;
      setEffectChoice(effect.id, updated);
    };

    return (
      <div className="space-y-2">
        <p className="text-sm text-slate-200 font-medium">{feature.name} — choose {count}</p>
        <div className="grid gap-3 md:grid-cols-2">
          {Array.from({ length: count }).map((_, index) => (
            <select
              key={`${effect.id}-${index}`}
              value={values[index]}
              onChange={(event) => handleChange(index, event.target.value)}
            >
              {options.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          ))}
        </div>
      </div>
    );
  }

  if (effect.value.type === 'fighting-style-choice') {
    const options = effect.value.options ?? [];
    const current = Array.isArray(effectChoices[effect.id])
      ? (effectChoices[effect.id] as string[])[0]
      : (effectChoices[effect.id] as string | undefined);
    const selected = current ?? options[0]?.id;

    const handleStyleSelect = (styleId: string) => {
      setEffectChoice(effect.id, styleId);
    };

    return (
      <div className="space-y-2">
        <p className="text-sm text-slate-200 font-medium">{feature.name} — choose a fighting style</p>
        <div className="grid gap-3 md:grid-cols-2">
          {options.map((style: any) => (
            <label
              key={style.id}
              className={`flex flex-col gap-2 rounded-lg border p-3 transition ${
                selected === style.id
                  ? 'border-sky-400 bg-surface-300/60'
                  : 'border-surface-400/40 hover:border-sky-500/60'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-100">{style.name}</span>
                <input
                  type="radio"
                  checked={selected === style.id}
                  onChange={() => handleStyleSelect(style.id)}
                  className="accent-sky-400"
                />
              </div>
              <p className="text-sm text-slate-300">{style.summary}</p>
            </label>
          ))}
        </div>
      </div>
    );
  }

  return null;
};

const FeatureReviewStep: React.FC = () => {
  const { stats, aggregatedFeatures } = useComputedCharacter();

  const choiceEffects = aggregatedFeatures
    .flatMap((feature) => feature.effects.map((effect) => ({ feature, effect })))
    .filter(({ effect }) => effect.value && typeof effect.value === 'object' && 'type' in effect.value);

  return (
    <div className="space-y-8">
      <section className="card p-6 space-y-4">
        <div>
          <h2 className="step-title">Resolve Feature Choices</h2>
          <p className="text-sm text-slate-300">
            Some traits require decisions. Pick fighting styles, bonus languages, and other options here.
          </p>
        </div>
        <div className="space-y-6">
          {choiceEffects.length === 0 && <p className="text-sm text-slate-400">No outstanding choices.</p>}
          {choiceEffects.map(({ feature, effect }) => (
            <ChoiceSelector key={`${feature.id}-${effect.id}`} feature={feature} effect={effect} />
          ))}
        </div>
      </section>

      <section className="card p-6 space-y-4">
        <div>
          <h2 className="step-title">Feature Overview</h2>
          <p className="text-sm text-slate-300">
            Review racial, background, class, and subclass abilities applied to your character.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {aggregatedFeatures.map((feature) => (
            <FeatureCard key={feature.id} feature={feature} />
          ))}
        </div>
      </section>

      <section className="card p-6 space-y-4">
        <div>
          <h2 className="step-title">Derived Notes</h2>
          <p className="text-sm text-slate-300">Rules reminders collected from your selected features.</p>
        </div>
        <ul className="space-y-2 text-sm text-slate-300">
          {stats.notes.length === 0 && <li className="text-slate-500">No additional notes yet.</li>}
          {stats.notes.map((note, index) => (
            <li key={index} className="rounded-lg border border-surface-400/40 bg-surface-200/50 px-3 py-2">
              {note}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
};

export default FeatureReviewStep;
