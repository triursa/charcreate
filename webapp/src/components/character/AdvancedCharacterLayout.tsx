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
    <div className="relative mt-10">
      <div className="pointer-events-none absolute inset-0 -z-10 rounded-[32px] bg-gradient-to-br from-sky-400/10 via-transparent to-fuchsia-500/10 blur-3xl dark:from-slate-900/40 dark:via-transparent dark:to-slate-800/40" />
      <div className="relative grid gap-8 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <div className="space-y-8">
          <OverviewCard />
          <AbilityGrid />
          <CharacterOptionsTabbed />
          <ClassLeveler />
          <LevelTimeline />
        </div>
        <aside className="space-y-6 xl:sticky xl:top-6">
          <StatsPanel />
          <SavesList />
          <SkillsTable />
          <FeatureList />
          <DecisionQueue />
          <div className="overflow-hidden rounded-3xl border border-slate-200/70 bg-white/80 p-6 shadow-lg backdrop-blur dark:border-slate-800/70 dark:bg-slate-900/60">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Printable Character Sheet</h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              Review the consolidated sheet that appears on print/PDF exports.
            </p>
            <div className="mt-6">
              <CharacterSheet />
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}

