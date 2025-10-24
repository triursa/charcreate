import React, { useMemo } from 'react';
import { races } from '../data/races';
import { backgrounds } from '../data/backgrounds';
import { classes } from '../data/classes';
import { abilities, abilityLabels } from '../utils/abilities';
import { rollAbilityArray } from '../utils/dice';
import { useCharacterState } from '../state/store';
import { Ability } from '../data/types';

const fighter = classes.find((klass) => klass.id === 'fighter')!;

const SelectionStep: React.FC = () => {
  const {
    name,
    level,
    raceId,
    backgroundId,
    subclassId,
    abilityScores,
    selectedSkills,
    raceAbilityOptionId,
    raceAbilityAssignments,
    notes,
    setName,
    setLevel,
    setRace,
    setBackground,
    setSubclass,
    setAbilityScore,
    setAbilityScores,
    setSelectedSkills,
    setRaceAbilityOption,
    setRaceAbilityAssignments,
    setNotes,
  } = useCharacterState((state) => ({
    name: state.name,
    level: state.level,
    raceId: state.raceId,
    backgroundId: state.backgroundId,
    subclassId: state.subclassId,
    abilityScores: state.abilityScores,
    selectedSkills: state.selectedSkills,
    raceAbilityOptionId: state.raceAbilityOptionId,
    raceAbilityAssignments: state.raceAbilityAssignments,
    notes: state.notes,
    setName: state.setName,
    setLevel: state.setLevel,
    setRace: state.setRace,
    setBackground: state.setBackground,
    setSubclass: state.setSubclass,
    setAbilityScore: state.setAbilityScore,
    setAbilityScores: state.setAbilityScores,
    setSelectedSkills: state.setSelectedSkills,
    setRaceAbilityOption: state.setRaceAbilityOption,
    setRaceAbilityAssignments: state.setRaceAbilityAssignments,
    setNotes: state.setNotes,
  }));

  const race = useMemo(() => races.find((item) => item.id === raceId) ?? null, [raceId]);
  const background = useMemo(() => backgrounds.find((item) => item.id === backgroundId) ?? null, [backgroundId]);
  const subclass = useMemo(() => fighter.subclasses.find((item) => item.id === subclassId) ?? null, [subclassId]);

  const raceAbilityOption = useMemo(
    () => race?.abilityOptions.find((option) => option.id === raceAbilityOptionId) ?? null,
    [race, raceAbilityOptionId],
  );

  const choiceDescriptors = useMemo(() => {
    if (!raceAbilityOption) return [] as Array<{ key: string; abilities: Ability[]; amount: number }>;
    const descriptors: Array<{ key: string; abilities: Ability[]; amount: number }> = [];
    raceAbilityOption.boosts.forEach((boost, index) => {
      if (boost.type === 'choice') {
        const available = boost.abilities === 'any' ? abilities : boost.abilities;
        for (let i = 0; i < boost.count; i += 1) {
          descriptors.push({ key: `${raceAbilityOption.id}-${index}-${i}`, abilities: available, amount: boost.amount });
        }
      }
    });
    return descriptors;
  }, [raceAbilityOption]);

  const currentAssignments = raceAbilityOption
    ? (raceAbilityAssignments[raceAbilityOption.id] && raceAbilityAssignments[raceAbilityOption.id].length
        ? raceAbilityAssignments[raceAbilityOption.id]
        : Array.from({ length: choiceDescriptors.length }, () => abilities[0]))
    : [];

  const handleRaceChange = (id: typeof raceId) => {
    setRace(id);
    setRaceAbilityOption(null);
  };

  const handleAbilityOptionChange = (optionId: string) => {
    setRaceAbilityOption(optionId);
    const nextOption = race?.abilityOptions.find((option) => option.id === optionId);
    if (nextOption) {
      const defaults: Ability[] = [];
      nextOption.boosts.forEach((boost) => {
        if (boost.type === 'choice') {
          const available = boost.abilities === 'any' ? abilities : boost.abilities;
          for (let i = 0; i < boost.count; i += 1) {
            defaults.push(available[0]);
          }
        }
      });
      setRaceAbilityAssignments(optionId, defaults);
    }
  };

  const handleAssignmentChange = (index: number, ability: Ability) => {
    if (!raceAbilityOption) return;
    const assignments = [...currentAssignments];
    assignments[index] = ability;
    setRaceAbilityAssignments(raceAbilityOption.id, assignments);
  };

  const toggleSkill = (skill: string) => {
    const limit = fighter.skills.choose;
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter((item) => item !== skill));
    } else if (selectedSkills.length < limit) {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  const rollAbilities = () => {
    const rolls = rollAbilityArray();
    const updated = { ...abilityScores };
    abilities.forEach((ability, index) => {
      updated[ability] = rolls[index] ?? updated[ability];
    });
    setAbilityScores(updated);
  };

  return (
    <div className="space-y-8">
      <section className="card p-6 space-y-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <h2 className="step-title">Identity</h2>
            <p className="text-sm text-slate-300">Name your hero and choose their starting level.</p>
          </div>
          <div className="flex flex-col gap-2 md:flex-row md:items-center">
            <label className="text-xs uppercase tracking-wide text-slate-400">Character Name</label>
            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="px-3 py-2"
            />
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-xs uppercase tracking-wide text-slate-400">Level: {level}</label>
          <input
            type="range"
            min={1}
            max={20}
            value={level}
            onChange={(event) => setLevel(Number(event.target.value))}
            className="accent-sky-400"
          />
        </div>
      </section>

      <section className="card p-6 space-y-6">
        <div>
          <h2 className="step-title">Ancestry</h2>
          <p className="text-sm text-slate-300">Select a race to unlock innate traits and ability boosts.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {races.map((option) => (
            <button
              type="button"
              key={option.id}
              onClick={() => handleRaceChange(option.id)}
              className={`text-left p-4 rounded-xl border transition ${
                raceId === option.id ? 'border-sky-400 bg-surface-300/60' : 'border-surface-400/40 hover:border-sky-500/70'
              }`}
            >
              <h3 className="font-semibold text-slate-100">{option.name}</h3>
              <p className="text-sm text-slate-300 mt-1">{option.description}</p>
              <p className="mt-2 text-xs uppercase tracking-wide text-slate-400">
                Speed: {option.speed.walk} ft{option.speed.fly ? `, Fly ${option.speed.fly} ft` : ''}
              </p>
            </button>
          ))}
        </div>
        {race && (
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-slate-200">Ability Boosts</h3>
              <p className="text-sm text-slate-400">Choose how your heritage shapes your physical and mental talents.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              {race.abilityOptions.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => handleAbilityOptionChange(option.id)}
                  className={`px-4 py-2 rounded-lg border text-sm transition ${
                    raceAbilityOptionId === option.id
                      ? 'border-sky-400 bg-surface-300/60 text-sky-200'
                      : 'border-surface-400/40 hover:border-sky-500/60'
                  }`}
                >
                  {option.description}
                </button>
              ))}
            </div>
            {raceAbilityOption && choiceDescriptors.length > 0 && (
              <div className="grid gap-3 md:grid-cols-2">
                {choiceDescriptors.map((descriptor, index) => (
                  <div key={descriptor.key} className="flex flex-col gap-2">
                    <label className="text-xs uppercase tracking-wide text-slate-400">
                      Select ability for +{descriptor.amount}
                    </label>
                    <select
                      value={currentAssignments[index] ?? descriptor.abilities[0]}
                      onChange={(event) => handleAssignmentChange(index, event.target.value as Ability)}
                    >
                      {descriptor.abilities.map((ability) => (
                        <option key={ability} value={ability}>
                          {abilityLabels[ability]}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </section>

      <section className="card p-6 space-y-6">
        <div>
          <h2 className="step-title">Background</h2>
          <p className="text-sm text-slate-300">Your past life grants proficiencies, languages, and gear.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {backgrounds.map((option) => (
            <button
              type="button"
              key={option.id}
              onClick={() => setBackground(option.id)}
              className={`text-left p-4 rounded-xl border transition ${
                backgroundId === option.id
                  ? 'border-sky-400 bg-surface-300/60'
                  : 'border-surface-400/40 hover:border-sky-500/70'
              }`}
            >
              <h3 className="font-semibold text-slate-100">{option.name}</h3>
              <p className="text-sm text-slate-300 mt-1">{option.description}</p>
              <p className="mt-2 text-xs uppercase tracking-wide text-slate-400">
                Skills: {option.skillProficiencies.join(', ')}
              </p>
            </button>
          ))}
        </div>
      </section>

      <section className="card p-6 space-y-6">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="step-title">Martial Training</h2>
            <p className="text-sm text-slate-300">Fighters choose a martial archetype at 3rd level.</p>
          </div>
          <div className="flex gap-3">
            {fighter.subclasses.map((option) => (
              <button
                type="button"
                key={option.id}
                onClick={() => setSubclass(option.id)}
                className={`px-4 py-2 rounded-lg border text-sm transition ${
                  subclassId === option.id
                    ? 'border-sky-400 bg-surface-300/60 text-sky-200'
                    : 'border-surface-400/40 hover:border-sky-500/70'
                }`}
              >
                {option.name}
              </button>
            ))}
          </div>
        </div>
        {subclass && (
          <p className="text-sm text-slate-300">{subclass.description}</p>
        )}
      </section>

      <section className="card p-6 space-y-6">
        <div className="flex flex-col gap-2 md:flex-row md:justify-between md:items-center">
          <div>
            <h2 className="step-title">Ability Scores</h2>
            <p className="text-sm text-slate-300">Assign ability scores or roll using 4d6 drop lowest.</p>
          </div>
          <button type="button" className="primary" onClick={rollAbilities}>
            Roll Ability Scores
          </button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {abilities.map((ability) => (
            <div key={ability} className="flex flex-col gap-2">
              <label className="text-xs uppercase tracking-wide text-slate-400">
                {abilityLabels[ability]}
              </label>
              <input
                type="number"
                min={3}
                max={20}
                value={abilityScores[ability]}
                onChange={(event) => setAbilityScore(ability, Number(event.target.value))}
              />
            </div>
          ))}
        </div>
      </section>

      <section className="card p-6 space-y-6">
        <div>
          <h2 className="step-title">Class Skill Proficiencies</h2>
          <p className="text-sm text-slate-300">
            Choose {fighter.skills.choose} skills from the fighter list. Background proficiencies are already included.
          </p>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {fighter.skills.options.map((skill) => {
            const isChecked = selectedSkills.includes(skill);
            const limitReached = !isChecked && selectedSkills.length >= fighter.skills.choose;
            return (
              <label
                key={skill}
                className={`flex items-center gap-3 rounded-lg border px-3 py-2 transition ${
                  isChecked
                    ? 'border-sky-400 bg-surface-300/60'
                    : limitReached
                    ? 'border-surface-500/40 opacity-60'
                    : 'border-surface-400/40 hover:border-sky-500/60'
                }`}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  disabled={limitReached}
                  onChange={() => toggleSkill(skill)}
                  className="w-4 h-4 accent-sky-400"
                />
                <span>{skill}</span>
              </label>
            );
          })}
        </div>
      </section>

      <section className="card p-6 space-y-4">
        <h2 className="step-title">Notes</h2>
        <textarea
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          rows={4}
          placeholder="Track story hooks, equipment ideas, or houserules."
        />
      </section>
    </div>
  );
};

export default SelectionStep;
