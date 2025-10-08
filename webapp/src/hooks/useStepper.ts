import { useCallback, useEffect, useMemo, useState } from 'react'

export interface StepStatus {
  complete: boolean
  message?: string
}

export interface StepMetadata {
  id: string
  title: string
  description: string
}

export interface StepDefinition extends StepMetadata {
  getStatus: () => StepStatus
}

interface UseStepperOptions<TStep extends StepDefinition> {
  steps: TStep[]
  initialStepIndex?: number
}

export function useStepper<TStep extends StepDefinition>({
  steps,
  initialStepIndex = 0
}: UseStepperOptions<TStep>) {
  const [activeStepIndex, setActiveStepIndex] = useState(() =>
    clampIndex(initialStepIndex, steps.length)
  )

  useEffect(() => {
    setActiveStepIndex((index) => clampIndex(index, steps.length))
  }, [steps.length])

  const statuses = useMemo(() => steps.map((step) => step.getStatus()), [steps])

  const isStepUnlocked = useCallback(
    (index: number) => {
      if (!Number.isInteger(index) || index < 0 || index >= steps.length) {
        return false
      }
      if (index === 0) {
        return true
      }

      return statuses.slice(0, index).every((status) => status.complete)
    },
    [steps.length, statuses]
  )

  const goTo = useCallback(
    (index: number) => {
      if (!Number.isInteger(index) || index < 0 || index >= steps.length) {
        return
      }
      if (index === activeStepIndex) {
        return
      }
      if (!isStepUnlocked(index)) {
        return
      }

      setActiveStepIndex(index)
    },
    [activeStepIndex, isStepUnlocked, steps.length]
  )

  const next = useCallback(() => {
    setActiveStepIndex((index) => {
      if (index >= steps.length - 1) {
        return index
      }

      const status = statuses[index]
      if (!status?.complete) {
        return index
      }

      return index + 1
    })
  }, [steps.length, statuses])

  const previous = useCallback(() => {
    setActiveStepIndex((index) => Math.max(0, index - 1))
  }, [])

  const isFirstStep = activeStepIndex === 0
  const isLastStep = activeStepIndex === steps.length - 1
  const currentStatus = statuses[activeStepIndex]

  return {
    steps,
    statuses,
    activeStepIndex,
    activeStep: steps[activeStepIndex],
    isFirstStep,
    isLastStep,
    currentStatus,
    isStepUnlocked,
    goTo,
    next,
    previous
  }
}

function clampIndex(index: number, stepCount: number) {
  if (stepCount === 0) {
    return 0
  }
  if (!Number.isInteger(index) || index < 0) {
    return 0
  }
  if (index >= stepCount) {
    return stepCount - 1
  }
  return index
}
