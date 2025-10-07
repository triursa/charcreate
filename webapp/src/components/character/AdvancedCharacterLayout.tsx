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
      </div>
    </div>
  )
}

