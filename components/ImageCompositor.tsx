'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { Template, ReplaceSlot, MascotAsset } from '@/types'
import { compositeImage } from '@/lib/compositor'

interface ImageCompositorProps {
  userPhoto: string
  template: Template
  slot: ReplaceSlot
  mascotAsset: MascotAsset | null
  onResult: (dataUrl: string) => void
  onError?: (err: Error) => void
}

export function ImageCompositor({ userPhoto, template, slot, mascotAsset, onResult, onError }: ImageCompositorProps) {
  const [preview, setPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const composingRef = useRef(false)
  const mountedRef = useRef(true)
  const [templateNaturalSize, setTemplateNaturalSize] = useState({ w: 1080, h: 720 })

  const compose = useCallback(async () => {
    if (composingRef.current) return
    composingRef.current = true
    setLoading(true)
    try {
      const dataUrl = await compositeImage(userPhoto, template, slot, mascotAsset, templateNaturalSize.w, templateNaturalSize.h)
      if (!mountedRef.current) return
      setPreview(dataUrl)
      onResult(dataUrl)
    } catch (err) {
      if (!mountedRef.current) return
      onError?.(err as Error)
    } finally {
      if (mountedRef.current) setLoading(false)
      composingRef.current = false
    }
  }, [userPhoto, template, slot, mascotAsset, templateNaturalSize, onResult, onError])

  useEffect(() => {
    const img = new window.Image()
    img.onload = () => setTemplateNaturalSize({ w: img.naturalWidth, h: img.naturalHeight })
    img.src = template.image
  }, [template.image])

  useEffect(() => {
    mountedRef.current = true
    compose()
    return () => { mountedRef.current = false }
  }, [compose])

  return (
    <div style={{
      position: 'relative', width: '100%', aspectRatio: '4/5',
      borderRadius: 24, overflow: 'hidden', background: 'rgba(0,0,0,0.05)'
    }}>
      {loading && (
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(180deg, #1a0005, #3d0010)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12
        }}>
          <div style={{
            width: 40, height: 40, border: '4px solid rgba(255,255,255,0.2)',
            borderTopColor: '#FF2442', borderRadius: '50%', animation: 'spin 1s linear infinite'
          }} />
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, fontWeight: 500, margin: 0 }}>正在把你藏进去…</p>
        </div>
      )}
      {preview && (
        <img src={preview} alt="生成结果" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
      )}
    </div>
  )
}
