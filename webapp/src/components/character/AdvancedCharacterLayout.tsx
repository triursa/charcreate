'use client'

import { OverviewCard } from '@/components/character/OverviewCard'
import { AbilityGrid } from '@/components/character/AbilityGrid'
import { CharacterOptionsTabbed } from '@/components/character/CharacterOptionsTabbed'
import { ClassLeveler } from '@/components/character/ClassLeveler'
import { LevelTimeline } from '@/components/character/LevelTimeline'
import { StatsPanel } from '@/components/character/StatsPanel'
import { SavesList } from '@/components/character/SavesList'
import { SkillsTable } from '@/components/character/SkillsTable'
import { FeatureList } from '@/components/character/FeatureList'
import { DecisionQueue } from '@/components/character/DecisionQueue'
import { CharacterSheet } from '@/components/character/CharacterSheet'

export function AdvancedCharacterLayout() {
  return (
    <div className="mt-8 grid gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <OverviewCard />
        <AbilityGrid />
        <CharacterOptionsTabbed />
        <ClassLeveler />
        <LevelTimeline />
      </div>
      <div className="space-y-6">
        <StatsPanel />
        <SavesList />
        <SkillsTable />
        <FeatureList />
        <DecisionQueue />
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Printable Character Sheet</h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Review the consolidated sheet that appears on print/PDF exports.
          </p>
          <div className="mt-6">
            <CharacterSheet />
          </div>
        </div>
      </div>
    </div>
  )
}

