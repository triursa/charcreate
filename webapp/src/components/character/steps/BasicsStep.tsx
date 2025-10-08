'use client'

import { OverviewCard } from '@/components/character/OverviewCard'

export interface BasicsStepProps {}

export function BasicsStep(_: BasicsStepProps) {
  return (
    <div className="space-y-4">
      <OverviewCard />
    </div>
  )
}
