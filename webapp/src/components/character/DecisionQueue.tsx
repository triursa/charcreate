'use client'

import { useEffect, useMemo, useState } from 'react'

import { abilityList } from '@/lib/abilities'
import { feats } from '@/data/feats'
import type { Ability, Decision, Skill } from '@/types/character'
import { useCharacterBuilder } from '@/state/character-builder'
import type { ResolvedDecisionValue } from '@/state/character-builder'

interface AsiDraft {
  type: 'asi'
  mode: 'ability' | 'feat'
  abilities: (Ability | '')[]
  featId?: string
  abilitySelection?: Ability | ''
}

interface SkillDraft {
  type: 'choose-skill'
  skills: Skill[]
}

interface LanguageDraft {
  type: 'choose-language'
  languages: string[]
}

interface ToolDraft {
  type: 'choose-tool'
  tools: string[]
}

type Draft = SkillDraft | AsiDraft | LanguageDraft | ToolDraft

export function DecisionQueue() {
  const {
    pendingDecisions,
    state: { resolvedDecisions },
    actions
  } = useCharacterBuilder()

  const [drafts, setDrafts] = useState<Record<string, Draft>>({})
  const [errors, setErrors] = useState<Record<string, string | undefined>>({})

  const featById = useMemo(() => Object.fromEntries(feats.map((feat) => [feat.id, feat])), [])

  useEffect(() => {
    setDrafts((current) => {
      const next: Record<string, Draft> = {}
      for (const decision of pendingDecisions) {
        if (decision.type === 'choose-skill') {
          const existing = current[decision.id] as SkillDraft | undefined
          if (existing) {
            next[decision.id] = existing
            continue
          }
          const resolved = resolvedDecisions[decision.id] as ResolvedDecisionValue | undefined
          if (resolved && resolved.type === 'choose-skill') {
            next[decision.id] = { type: 'choose-skill', skills: [...resolved.choices] }
          } else {
            next[decision.id] = { type: 'choose-skill', skills: [] }
          }
        } else if (decision.type === 'choose-language') {
          const existing = current[decision.id] as LanguageDraft | undefined
          if (existing) {
            next[decision.id] = existing
            continue
          }
          const resolved = resolvedDecisions[decision.id] as ResolvedDecisionValue | undefined
          if (resolved && resolved.type === 'choose-language') {
            next[decision.id] = { type: 'choose-language', languages: [...resolved.choices] }
          } else {
            next[decision.id] = { type: 'choose-language', languages: [] }
          }
        } else if (decision.type === 'choose-tool') {
          const existing = current[decision.id] as ToolDraft | undefined
          if (existing) {
            next[decision.id] = existing
            continue
          }
          const resolved = resolvedDecisions[decision.id] as ResolvedDecisionValue | undefined
          if (resolved && resolved.type === 'choose-tool') {
            next[decision.id] = { type: 'choose-tool', tools: [...resolved.choices] }
          } else {
            next[decision.id] = { type: 'choose-tool', tools: [] }
          }
        } else if (decision.type === 'asi') {
          const existing = current[decision.id] as AsiDraft | undefined
          if (existing) {
            next[decision.id] = existing
            continue
          }
          const resolved = resolvedDecisions[decision.id] as ResolvedDecisionValue | undefined
          if (resolved && resolved.type === 'asi') {
            if (resolved.mode === 'ability') {
              next[decision.id] = {
                type: 'asi',
                mode: 'ability',
                abilities: [...resolved.abilities]
              }
            } else {
              next[decision.id] = {
                type: 'asi',
                mode: 'feat',
                abilities: ['', ''],
                featId: resolved.featId,
                abilitySelection: resolved.abilitySelection
              }
            }
          } else {
            next[decision.id] = { type: 'asi', mode: 'ability', abilities: ['', ''] }
          }
        }
      }
      return next
    })
  }, [pendingDecisions, resolvedDecisions])

  useEffect(() => {
    setErrors((current) => {
      const next: Record<string, string | undefined> = {}
      for (const decision of pendingDecisions) {
        next[decision.id] = current[decision.id]
      }
      return next
    })
  }, [pendingDecisions])

  const handleSkillToggle = (decision: Decision, skill: string) => {
    setDrafts((current) => {
      const existing = (current[decision.id] as SkillDraft | undefined) ?? { type: 'choose-skill', skills: [] }
      const skills = new Set(existing.skills)
      if (skills.has(skill)) {
        skills.delete(skill)
      } else {
        if (skills.size >= decision.max) {
          return current
        }
        skills.add(skill as Skill)
      }
      return {
        ...current,
        [decision.id]: { type: 'choose-skill', skills: Array.from(skills) }
      }
    })
  }

  const handleLanguageToggle = (decision: Decision, language: string) => {
    setDrafts((current) => {
      const existing = (current[decision.id] as LanguageDraft | undefined) ?? { type: 'choose-language', languages: [] }
      const languages = new Set(existing.languages)
      if (languages.has(language)) {
        languages.delete(language)
      } else {
        if (languages.size >= decision.max) {
          return current
        }
        languages.add(language)
      }
      return {
        ...current,
        [decision.id]: { type: 'choose-language', languages: Array.from(languages) }
      }
    })
  }

  const handleToolToggle = (decision: Decision, tool: string) => {
    setDrafts((current) => {
      const existing = (current[decision.id] as ToolDraft | undefined) ?? { type: 'choose-tool', tools: [] }
      const tools = new Set(existing.tools)
      if (tools.has(tool)) {
        tools.delete(tool)
      } else {
        if (tools.size >= decision.max) {
          return current
        }
        tools.add(tool)
      }
      return {
        ...current,
        [decision.id]: { type: 'choose-tool', tools: Array.from(tools) }
      }
    })
  }

  const handleAsiChange = (decisionId: string, index: number, ability: string) => {
    setDrafts((current) => {
      const existing = (current[decisionId] as AsiDraft | undefined) ?? { type: 'asi', mode: 'ability', abilities: ['', ''] }
      const abilities = [...existing.abilities]
      abilities[index] = ability as Ability | ''
      return {
        ...current,
        [decisionId]: {
          ...existing,
          abilities
        }
      }
    })
  }

  const handleAsiModeChange = (decisionId: string, mode: 'ability' | 'feat') => {
    setDrafts((current) => {
      const existing = (current[decisionId] as AsiDraft | undefined) ?? { type: 'asi', mode: 'ability', abilities: ['', ''] }
      return {
        ...current,
        [decisionId]: {
          type: 'asi',
          mode,
          abilities: mode === 'ability' ? existing.abilities : ['', ''],
          featId: mode === 'feat' ? existing.featId : undefined,
          abilitySelection: mode === 'feat' ? existing.abilitySelection : undefined
        }
      }
    })
  }

  const handleFeatChange = (decisionId: string, featId: string) => {
    setDrafts((current) => {
      const existing = (current[decisionId] as AsiDraft | undefined) ?? { type: 'asi', mode: 'feat', abilities: ['', ''] }
      return {
        ...current,
        [decisionId]: {
          ...existing,
          type: 'asi',
          mode: 'feat',
          featId,
          abilitySelection: undefined
        }
      }
    })
  }

  const handleFeatAbilitySelection = (decisionId: string, ability: string) => {
    setDrafts((current) => {
      const existing = (current[decisionId] as AsiDraft | undefined) ?? { type: 'asi', mode: 'feat', abilities: ['', ''] }
      return {
        ...current,
        [decisionId]: {
          ...existing,
          abilitySelection: ability
        }
      }
    })
  }

  const handleSave = (decision: Decision) => {
    const draft = drafts[decision.id]
    if (!draft) return

    if (decision.type === 'choose-skill' && draft.type === 'choose-skill') {
      if (draft.skills.length !== decision.max) {
        setErrors((current) => ({ ...current, [decision.id]: `Pick exactly ${decision.max} skills.` }))
        return
      }
      actions.resolveDecision(decision.id, { type: 'choose-skill', choices: draft.skills })
      setErrors((current) => ({ ...current, [decision.id]: undefined }))
      return
    }

    if (decision.type === 'choose-language' && draft.type === 'choose-language') {
      if (draft.languages.length < decision.min || draft.languages.length > decision.max) {
        const message =
          decision.min === decision.max
            ? `Pick exactly ${decision.max} languages.`
            : `Pick between ${decision.min} and ${decision.max} languages.`
        setErrors((current) => ({ ...current, [decision.id]: message }))
        return
      }
      actions.resolveDecision(decision.id, { type: 'choose-language', choices: draft.languages })
      setErrors((current) => ({ ...current, [decision.id]: undefined }))
      return
    }

    if (decision.type === 'choose-tool' && draft.type === 'choose-tool') {
      if (draft.tools.length < decision.min || draft.tools.length > decision.max) {
        const message =
          decision.min === decision.max
            ? `Pick exactly ${decision.max} tools.`
            : `Pick between ${decision.min} and ${decision.max} tools.`
        setErrors((current) => ({ ...current, [decision.id]: message }))
        return
      }
      actions.resolveDecision(decision.id, { type: 'choose-tool', choices: draft.tools })
      setErrors((current) => ({ ...current, [decision.id]: undefined }))
      return
    }

    if (decision.type === 'asi' && draft.type === 'asi') {
      if (draft.mode === 'ability') {
        if (draft.abilities.some((ability) => !ability)) {
          setErrors((current) => ({ ...current, [decision.id]: 'Choose two ability increases.' }))
          return
        }
        actions.resolveDecision(decision.id, {
          type: 'asi',
          mode: 'ability',
          abilities: draft.abilities as Ability[]
        })
        setErrors((current) => ({ ...current, [decision.id]: undefined }))
        return
      }

      if (!draft.featId) {
        setErrors((current) => ({ ...current, [decision.id]: 'Select a feat to continue.' }))
        return
      }

      const feat = featById[draft.featId]
      if (feat && feat.abilityIncreases) {
        const abilities = Object.keys(feat.abilityIncreases)
        if (abilities.length > 1 && !draft.abilitySelection) {
          setErrors((current) => ({ ...current, [decision.id]: 'Choose which ability the feat improves.' }))
          return
        }
      }

      actions.resolveDecision(decision.id, {
        type: 'asi',
        mode: 'feat',
        featId: draft.featId,
        abilitySelection: draft.abilitySelection || undefined
      })
      setErrors((current) => ({ ...current, [decision.id]: undefined }))
      return
    }
  }

  const handleReset = (decision: Decision) => {
    actions.clearDecision(decision.id)
    setDrafts((current) => {
      const next = { ...current }
      delete next[decision.id]
      return next
    })
    setErrors((current) => ({ ...current, [decision.id]: undefined }))
  }

  if (pendingDecisions.length === 0) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Decision Queue</h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">No pending decisions. Level up to reveal new choices.</p>
      </section>
    )
  }

  return (
    <section className="rounded-2xl border border-blue-200 bg-white p-6 shadow-lg shadow-blue-100/40 dark:border-blue-500/50 dark:bg-slate-900">
      <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Decision Queue</h2>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Resolve outstanding class and feat selections to continue leveling.</p>

      <div className="mt-4 space-y-4">
        {pendingDecisions.map((decision) => {
          const draft = drafts[decision.id]
          const error = errors[decision.id]

          return (
            <div key={decision.id} className="rounded-xl border border-slate-200 bg-white/80 p-4 dark:border-slate-700 dark:bg-slate-950/70">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">{decision.label ?? decision.id}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{decision.type.replace(/-/g, ' ')}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleSave(decision)}
                    className="rounded-full bg-blue-600 px-4 py-1.5 text-xs font-semibold text-white shadow hover:bg-blue-700"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => handleReset(decision)}
                    className="rounded-full border border-slate-300 px-4 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    Reset
                  </button>
                </div>
              </div>

              {decision.type === 'choose-skill' && draft?.type === 'choose-skill' && (
                <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                  {decision.options.map((option: string) => {
                    const selected = draft.skills.includes(option)
                    const disabled = !selected && draft.skills.length >= decision.max
                    return (
                      <label
                        key={option}
                        className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 ${
                          selected
                            ? 'border-blue-500 bg-blue-50 text-blue-700 dark:border-blue-400 dark:bg-blue-500/10 dark:text-blue-200'
                            : 'border-slate-200 hover:border-blue-400 dark:border-slate-700 dark:hover:border-blue-400'
                        } ${disabled ? 'opacity-60' : ''}`}
                      >
                        <input
                          type="checkbox"
                          checked={selected}
                          onChange={() => handleSkillToggle(decision, option)}
                          className="h-4 w-4 rounded border-slate-300 text-blue-500 focus:ring-blue-500"
                          disabled={disabled && !selected}
                        />
                        {option}
                      </label>
                    )
                  })}
                </div>
              )}

              {decision.type === 'choose-language' && draft?.type === 'choose-language' && (
                <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                  {decision.options.map((option: string) => {
                    const selected = draft.languages.includes(option)
                    const disabled = !selected && draft.languages.length >= decision.max
                    return (
                      <label
                        key={option}
                        className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 ${
                          selected
                            ? 'border-blue-500 bg-blue-50 text-blue-700 dark:border-blue-400 dark:bg-blue-500/10 dark:text-blue-200'
                            : 'border-slate-200 hover:border-blue-400 dark:border-slate-700 dark:hover:border-blue-400'
                        } ${disabled ? 'opacity-60' : ''}`}
                      >
                        <input
                          type="checkbox"
                          checked={selected}
                          onChange={() => handleLanguageToggle(decision, option)}
                          className="h-4 w-4 rounded border-slate-300 text-blue-500 focus:ring-blue-500"
                          disabled={disabled && !selected}
                        />
                        {option}
                      </label>
                    )
                  })}
                </div>
              )}

              {decision.type === 'choose-tool' && draft?.type === 'choose-tool' && (
                <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                  {decision.options.map((option: string) => {
                    const selected = draft.tools.includes(option)
                    const disabled = !selected && draft.tools.length >= decision.max
                    return (
                      <label
                        key={option}
                        className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 ${
                          selected
                            ? 'border-blue-500 bg-blue-50 text-blue-700 dark:border-blue-400 dark:bg-blue-500/10 dark:text-blue-200'
                            : 'border-slate-200 hover:border-blue-400 dark:border-slate-700 dark:hover:border-blue-400'
                        } ${disabled ? 'opacity-60' : ''}`}
                      >
                        <input
                          type="checkbox"
                          checked={selected}
                          onChange={() => handleToolToggle(decision, option)}
                          className="h-4 w-4 rounded border-slate-300 text-blue-500 focus:ring-blue-500"
                          disabled={disabled && !selected}
                        />
                        {option}
                      </label>
                    )
                  })}
                </div>
              )}

              {decision.type === 'asi' && draft?.type === 'asi' && (
                <div className="mt-3 space-y-3 text-sm">
                  <div className="flex gap-3 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    <label className={`flex items-center gap-2 rounded-full border px-3 py-1 ${draft.mode === 'ability' ? 'border-blue-500 text-blue-600 dark:border-blue-400 dark:text-blue-200' : 'border-slate-300 dark:border-slate-600'}`}>
                      <input
                        type="radio"
                        checked={draft.mode === 'ability'}
                        onChange={() => handleAsiModeChange(decision.id, 'ability')}
                        className="h-4 w-4 text-blue-500 focus:ring-blue-500"
                      />
                      Ability Increase
                    </label>
                    <label className={`flex items-center gap-2 rounded-full border px-3 py-1 ${draft.mode === 'feat' ? 'border-blue-500 text-blue-600 dark:border-blue-400 dark:text-blue-200' : 'border-slate-300 dark:border-slate-600'}`}>
                      <input
                        type="radio"
                        checked={draft.mode === 'feat'}
                        onChange={() => handleAsiModeChange(decision.id, 'feat')}
                        className="h-4 w-4 text-blue-500 focus:ring-blue-500"
                      />
                      Take a Feat
                    </label>
                  </div>

                  {draft.mode === 'ability' && (
                    <div className="grid gap-3 md:grid-cols-2">
                      {[0, 1].map((index) => (
                        <label key={index} className="text-sm font-medium text-slate-600 dark:text-slate-300">
                          Increase {index + 1}
                          <select
                            value={draft.abilities[index] ?? ''}
                            onChange={(event) => handleAsiChange(decision.id, index, event.target.value)}
                            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                          >
                            <option value="">Select ability</option>
                            {abilityList.map((ability) => (
                              <option key={ability} value={ability}>
                                {ability}
                              </option>
                            ))}
                          </select>
                        </label>
                      ))}
                    </div>
                  )}

                  {draft.mode === 'feat' && (
                    <div className="space-y-3">
                      <label className="text-sm font-medium text-slate-600 dark:text-slate-300">
                        Feat
                        <select
                          value={draft.featId ?? ''}
                          onChange={(event) => handleFeatChange(decision.id, event.target.value)}
                          className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                        >
                          <option value="">Select a feat</option>
                          {feats.map((feat) => (
                            <option key={feat.id} value={feat.id}>
                              {feat.name}
                            </option>
                          ))}
                        </select>
                      </label>
                      {draft.featId && (
                        <p className="rounded-lg bg-slate-100 p-3 text-xs text-slate-600 dark:bg-slate-800/80 dark:text-slate-300">
                          {featById[draft.featId]?.description}
                        </p>
                      )}
                      {draft.featId && featById[draft.featId]?.abilityIncreases && (
                        (() => {
                          const abilityOptions = Object.entries(featById[draft.featId]?.abilityIncreases ?? {})
                            .filter(([, amount]) => typeof amount === 'number' && amount > 0)
                            .map(([ability]) => ability)
                          if (abilityOptions.length <= 1) return null
                          return (
                            <label className="text-sm font-medium text-slate-600 dark:text-slate-300">
                              Ability Gained
                              <select
                                value={draft.abilitySelection ?? ''}
                                onChange={(event) => handleFeatAbilitySelection(decision.id, event.target.value)}
                                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                              >
                                <option value="">Select ability</option>
                                {abilityOptions.map((option) => (
                                  <option key={option} value={option}>
                                    {option}
                                  </option>
                                ))}
                              </select>
                            </label>
                          )
                        })()
                      )}
                    </div>
                  )}
                </div>
              )}

              {error && <p className="mt-3 text-xs font-semibold text-red-600 dark:text-red-400">{error}</p>}
            </div>
          )
        })}
      </div>
    </section>
  )
}
