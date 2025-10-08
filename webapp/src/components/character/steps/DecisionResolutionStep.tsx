'use client'

import { DecisionQueue } from '@/components/character/DecisionQueue'

export interface DecisionResolutionStepProps {}

export function DecisionResolutionStep(_: DecisionResolutionStepProps) {
  return (
    <div className="space-y-4">
      <DecisionQueue />
    </div>
  )
}
