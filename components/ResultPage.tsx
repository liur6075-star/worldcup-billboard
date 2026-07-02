'use client'

import { useCallback, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Template, ReplaceSlot, MascotAsset } from '@/types'
import { ImageCompositor } from '@/components/ImageCompositor'
import { downloadDataUrl, validateImageFile, fileToDataUrl, cropCenterSquare } from '@/lib/utils'

interface ResultPageProps {
  userPhoto: string
  template: Template
  slot: ReplaceSlot
  mascotAsset: MascotAsset | null
  onSwitchCity: () => void
  onAddMascot: () => void
  onReset: () => void
  onResult: (dataUrl: string) => void
  resultDataUrl: string | null
}

function PrimaryButton({ onClick, disabled, children }: { onClick?: () => void; disabled?: boolean; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        width: '100%', height: 52, borderRadius: 16,
        background: disabled ? '#ccc' : '#FF2442',
        color: 'white', fontSize: 16, fontWeight: 700,
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        cursor: disabled ? 'not-allowed' : 'pointer',
        boxShadow: disabled ? 'none' : '0 4px 20px rgba(255,36,66,0.3)',
        transition: 'all 0.2s', border: 'none'
      }}
    >
      {children}
    </button>
  )
}

function SecondaryButton({ onClick, children }: { onClick?: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      style={{
        flex: 1, height: 48, borderRadius: 16,
        background: 'white', color: '#FF2442',
        border: '2px solid #FF2442', fontSize: 15, fontWeight: 600,
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
        cursor: 'pointer', transition: 'all 0.2s'
      }}
    >
      {children}
    </button>
  )
}

function GhostButton({ onClick, children }: { onClick?: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: '100%', height: 44, borderRadius: 14,
        background: '#f5f5f5', color: '#666', fontSize: 15, fontWeight: 500,
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        cursor: 'pointer', border: 'none', transition: 'all 0.2s'
      }}
    >
      {children}
    </button>
  )
}

export function ResultPage({
  userPhoto, template, slot, mascotAsset,
  onSwitchCity, onAddMascot, onReset, onResult, resultDataUrl
}: ResultPageProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [saving, setSaving] = useState(false)
  const [showSavedTip, setShowSavedTip] = useState(false)

  const handleSave = useCallback(async () => {
    if (!resultDataUrl) return
    setSaving(true)
    try {
      const ts = new Date().toISOString().slice(0, 10).replace(/-/g, '')
      downloadDataUrl(resultDataUrl, `小红书世界杯大屏_${template.city}_${ts}.png`)
      setShowSavedTip(true)
      setTimeout(() => setShowSavedTip(false), 3000)
    } finally {
      setSaving(false)
    }
  }, [resultDataUrl, template.city])

  const handleReupload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const err = validateImageFile(file)
    if (err) { alert(err); return }
    const raw = await fileToDataUrl(file)
    const cropped = await cropCenterSquare(raw, 600)
    onReset()
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('xhs-reupload', { detail: { photo: cropped } }))
    }, 100)
    e.target.value = ''
  }, [onReset])

  return (
    <div style={{ minHeight: '100vh', background: 'white', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 20,
        background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid #f0f0f0',
        padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12
      }}>
        <button
          onClick={onReset}
          style={{
            width: 36, height: 36, borderRadius: '50%', background: '#f5f5f5',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#666', cursor: 'pointer', border: 'none', fontSize: 20
          }}
        >
          ←
        </button>
        <h2 style={{ fontWeight: 700, fontSize: 18, color: '#1A1A1A', flex: 1, margin: 0 }}>生成结果</h2>
        <span style={{ fontSize: 20 }}>⚽</span>
      </div>

      {/* Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '16px', gap: 16 }}>
        {/* Result image */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <ImageCompositor
            userPhoto={userPhoto} template={template} slot={slot}
            mascotAsset={mascotAsset} onResult={onResult}
          />
        </motion.div>

        {/* Location badge */}
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          style={{
            display: 'flex', alignItems: 'center', gap: 12,
            background: '#FFF0F2', borderRadius: 16, padding: '12px 16px'
          }}
        >
          <div style={{
            width: 40, height: 40, borderRadius: '50%', background: '#FF2442',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 18
          }}>
            📍
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <p style={{ color: '#999', fontSize: 12, margin: '0 0 2px' }}>你被藏进了</p>
            <p style={{ color: '#1A1A1A', fontWeight: 700, fontSize: 14, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {template.pointName}
            </p>
          </div>
          <span style={{
            color: '#FF2442', fontSize: 12, fontWeight: 600,
            background: 'white', borderRadius: 100, padding: '4px 12px',
            border: '1px solid rgba(255,36,66,0.2)', flexShrink: 0
          }}>
            {template.city}
          </span>
        </motion.div>

        {/* Saved tip */}
        {showSavedTip && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            style={{
              background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 16,
              padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 8
            }}
          >
            <span style={{ color: '#16a34a' }}>✅</span>
            <p style={{ color: '#15803d', fontSize: 14, fontWeight: 500, margin: 0 }}>图片已保存！快去小红书发布吧 📱</p>
          </motion.div>
        )}

        {/* Action buttons */}
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
        >
          <PrimaryButton onClick={handleSave} disabled={!resultDataUrl || saving}>
            <span>💾</span>
            {saving ? '保存中…' : '保存图片（1080×1350）'}
          </PrimaryButton>

          <div style={{ display: 'flex', gap: 12 }}>
            <SecondaryButton onClick={onSwitchCity}><span>🏙️</span>换个城市</SecondaryButton>
            <SecondaryButton onClick={onAddMascot}><span>🐮</span>加薯队长</SecondaryButton>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBlock: 4 }}>
            <div style={{ height: 1, flex: 1, background: '#f0f0f0' }} />
            <span style={{ color: '#bbb', fontSize: 12 }}>或者</span>
            <div style={{ height: 1, flex: 1, background: '#f0f0f0' }} />
          </div>

          <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" style={{ display: 'none' }} onChange={handleReupload} />
          <GhostButton onClick={() => inputRef.current?.click()}><span>📸</span>重新上传照片</GhostButton>
        </motion.div>

        {/* Share hint */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
          <p style={{ textAlign: 'center', color: '#aaa', fontSize: 12, lineHeight: 1.6, marginTop: 8 }}>
            保存后，发小红书记得@小红书<br />
            话题：<span style={{ color: '#FF2442' }}>#我被藏进世界杯大屏里了</span>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
