'use client'

import { OverviewCard } from '@/components/character/OverviewCard'
import { AbilityGrid } from '@/components/character/AbilityGrid'
import { CharacterOptionsTabbed } from '@/components/character/CharacterOptionsTabbed'
import { ClassLeveler } from '@/components/character/ClassLeveler'
import { StatsPanel } from '@/components/character/StatsPanel'
import { SkillsTable } from '@/components/character/SkillsTable'
import { SavesList } from '@/components/character/SavesList'
import { LevelTimeline } from '@/components/character/LevelTimeline'
import { DecisionQueue } from '@/components/character/DecisionQueue'
import { FeatureList } from '@/components/character/FeatureList'
import { ExportPanel } from '@/components/character/ExportPanel'
import { useCharacterBuilder } from '@/state/character-builder'

export function CharacterLayout() {
  const { warnings } = useCharacterBuilder()

  return (
    <div className="mx-auto max-w-7xl px-4 pb-16 pt-8 sm:px-6 lg:px-8">
      <div className="flex items-baseline justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Interactive Character Planner</h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-600 dark:text-slate-400">
            Build a 5e character from level 0 through 20 with guided choices, automatic rules calculations, and printable
            exports.
          </p>
        </div>
        <ExportPanel />
      </div>

      {warnings.length > 0 && (
        <div className="mt-6 rounded-lg border border-amber-400 bg-amber-50 p-4 text-amber-900 dark:border-amber-600 dark:bg-amber-950/40 dark:text-amber-200">
          <ul className="list-disc space-y-1 pl-5 text-sm">
            {warnings.map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
        </div>
      )}

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
        </div>
      </div>
    </div>
  )
}
