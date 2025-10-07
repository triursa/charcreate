'use client'

import { CharacterBuilderProvider } from '@/state/character-builder'
import { CharacterLayout } from '@/components/character/CharacterLayout'

export function CharacterPlannerPage() {
  return (
    <CharacterBuilderProvider>
      <div className="min-h-screen bg-slate-100 dark:bg-slate-950">
        <CharacterLayout />
      </div>
    </CharacterBuilderProvider>
  )
}
