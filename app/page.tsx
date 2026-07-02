'use client'

import { useEffect, useCallback } from 'react'
import { useAppState } from '@/hooks/useAppState'
import { HomePage } from '@/components/HomePage'
import { GeneratingPage } from '@/components/GeneratingPage'
import { ResultPage } from '@/components/ResultPage'

export default function App() {
  const {
    step,
    state,
    startGeneration,
    switchCity,
    addMascot,
    setResultDataUrl,
    resetToHome,
    goToResult,
    setStep,
  } = useAppState()

  // Handle re-upload event from ResultPage
  const handleReupload = useCallback(
    (e: Event) => {
      const detail = (e as CustomEvent).detail
      if (detail?.photo) {
        startGeneration(detail.photo)
      }
    },
    [startGeneration]
  )

  useEffect(() => {
    window.addEventListener('xhs-reupload', handleReupload)
    return () => window.removeEventListener('xhs-reupload', handleReupload)
  }, [handleReupload])

  // Auto-transition: when photo uploaded → show generating for 2s → result
  useEffect(() => {
    if (step === 'generating' && state.userPhoto && state.selectedTemplate) {
      const timer = setTimeout(() => {
        goToResult()
      }, 2200)
      return () => clearTimeout(timer)
    }
  }, [step, state.userPhoto, state.selectedTemplate, goToResult])

  if (step === 'home') {
    return <HomePage onPhotoSelected={startGeneration} />
  }

  if (step === 'generating') {
    return <GeneratingPage />
  }

  if (step === 'result' && state.userPhoto && state.selectedTemplate && state.selectedSlot) {
    return (
      <ResultPage
        userPhoto={state.userPhoto}
        template={state.selectedTemplate}
        slot={state.selectedSlot}
        mascotAsset={state.mascotAsset}
        onSwitchCity={switchCity}
        onAddMascot={addMascot}
        onReset={resetToHome}
        onResult={setResultDataUrl}
        resultDataUrl={state.resultDataUrl}
      />
    )
  }

  // Fallback
  return <HomePage onPhotoSelected={startGeneration} />
}
