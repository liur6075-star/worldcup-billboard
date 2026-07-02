export interface ReplaceSlot {
  id: number
  x: number
  y: number
  width: number
  height: number
  rotation: number
}

export interface MascotSlot {
  x: number
  y: number
  width?: number
  height?: number
}

export interface Template {
  id: string
  pointName: string
  image: string
  city: string
  replaceSlots: ReplaceSlot[]
  mascotSlot: MascotSlot
}

export interface MascotAsset {
  id: string
  name: string
  image: string
  position: 'left' | 'right' | 'top' | 'bottom'
}

export type AppStep = 'home' | 'generating' | 'result'

export interface GenerationState {
  userPhoto: string | null
  selectedTemplate: Template | null
  selectedSlot: ReplaceSlot | null
  mascotAsset: MascotAsset | null
  resultDataUrl: string | null
}
