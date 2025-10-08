'use client'

import { ClassLeveler } from '@/components/character/ClassLeveler'
import { DecisionQueue } from '@/components/character/DecisionQueue'

export interface ClassLevelsStepProps {
  targetLevel: number
  currentLevel: number
  onTargetLevelChange: (level: number) => void
  pendingDecisionCount: number
}

export function ClassLevelsStep({
  targetLevel,
  currentLevel,
  onTargetLevelChange,
  pendingDecisionCount
}: ClassLevelsStepProps) {
  const handleSliderChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextLevel = Number.parseInt(event.target.value, 10)
    onTargetLevelChange(Number.isNaN(nextLevel) ? targetLevel : nextLevel)
  }

  const renderLevelMessage = () => {
    if (currentLevel === targetLevel) {
      return 'Target reached. Confirm any choices unlocked below.'
    }
    if (currentLevel < targetLevel) {
      return `Level up ${targetLevel - currentLevel} more time(s) to meet your goal.`
    }
    return `Reduce your level to ${targetLevel} if you overshot your target.`
  }

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-200/70 bg-white/80 p-8 shadow-xl backdrop-blur dark:border-slate-800/70 dark:bg-slate-900/60">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Set Your Goal Level</h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          Choose the level you want to build towards, then use the progression controls below to reach it.
        </p>
        <div className="mt-6 space-y-4">
          <div className="flex items-center gap-4">
            <input
              type="range"
              min={1}
              max={20}
              step={1}
              value={targetLevel}
              onChange={handleSliderChange}
              className="flex-1 accent-blue-500"
            />
            <span className="w-20 text-center text-sm font-semibold text-slate-900 dark:text-slate-100">
              Level {targetLevel}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Current level: {currentLevel}. {renderLevelMessage()}
          </p>
        </div>
      </section>

      <ClassLeveler />

      {pendingDecisionCount > 0 && (
        <section className="rounded-3xl border border-blue-200/70 bg-blue-50/70 p-6 shadow-lg backdrop-blur dark:border-blue-500/50 dark:bg-blue-500/10">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100">Resolve Pending Decisions</h3>
          <p className="mt-1 text-sm text-blue-800/80 dark:text-blue-100/80">
            Leveling unlocked new class options. Finalize them here before moving on.
          </p>
          <div className="mt-4">
            <DecisionQueue />
          </div>
        </section>
      )}
    </div>
  )
}
