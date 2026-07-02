'use client'

import { useState, useCallback } from 'react'
import { Template, ReplaceSlot, MascotAsset, AppStep, GenerationState } from '@/types'
import templates from '@/config/templates.json'
import { MASCOT_ASSETS } from '@/lib/mascot'
import { randomPick } from '@/lib/utils'

export function useAppState() {
  const [step, setStep] = useState<AppStep>('home')
  const [state, setState] = useState<GenerationState>({
    userPhoto: null,
    selectedTemplate: null,
    selectedSlot: null,
    mascotAsset: null,
    resultDataUrl: null,
  })
  const [isGenerating, setIsGenerating] = useState(false)

  const pickRandomTemplate = useCallback(
    (exclude?: string): { template: Template; slot: ReplaceSlot } => {
      const pool = exclude
        ? (templates as Template[]).filter((t) => t.id !== exclude)
        : (templates as Template[])
      const template = randomPick(pool.length > 0 ? pool : templates as Template[])
      const slot = randomPick(template.replaceSlots)
      return { template, slot }
    },
    []
  )

  const startGeneration = useCallback(
    async (photoDataUrl: string) => {
      const { template, slot } = pickRandomTemplate()
      setState((prev) => ({
        ...prev,
        userPhoto: photoDataUrl,
        selectedTemplate: template,
        selectedSlot: slot,
        mascotAsset: null,
        resultDataUrl: null,
      }))
      setStep('generating')
    },
    [pickRandomTemplate]
  )

  const switchCity = useCallback(() => {
    const currentId = state.selectedTemplate?.id
    const { template, slot } = pickRandomTemplate(currentId)
    setState((prev) => ({
      ...prev,
      selectedTemplate: template,
      selectedSlot: slot,
      mascotAsset: null,
      resultDataUrl: null,
    }))
  }, [state.selectedTemplate?.id, pickRandomTemplate])

  const addMascot = useCallback(() => {
    const current = state.mascotAsset
    const pool = current
      ? MASCOT_ASSETS.filter((m) => m.id !== current.id)
      : MASCOT_ASSETS
    const picked = randomPick(pool.length > 0 ? pool : MASCOT_ASSETS)
    setState((prev) => ({ ...prev, mascotAsset: picked, resultDataUrl: null }))
  }, [state.mascotAsset])

  const setResultDataUrl = useCallback((url: string) => {
    setState((prev) => ({ ...prev, resultDataUrl: url }))
  }, [])

  const resetToHome = useCallback(() => {
    setState({
      userPhoto: null,
      selectedTemplate: null,
      selectedSlot: null,
      mascotAsset: null,
      resultDataUrl: null,
    })
    setStep('home')
  }, [])

  const setGenerating = useCallback((v: boolean) => setIsGenerating(v), [])

  const goToResult = useCallback(() => setStep('result'), [])

  return {
    step,
    state,
    isGenerating,
    startGeneration,
    switchCity,
    addMascot,
    setResultDataUrl,
    resetToHome,
    setGenerating,
    goToResult,
    setStep,
  }
}
