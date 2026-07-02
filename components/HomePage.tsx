'use client'

import { useCallback, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { fileToDataUrl, validateImageFile, cropCenterSquare } from '@/lib/utils'

interface HomePageProps {
  onPhotoSelected: (dataUrl: string) => void
}

export function HomePage({ onPhotoSelected }: HomePageProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  const handleFile = useCallback(
    async (file: File) => {
      const err = validateImageFile(file)
      if (err) { alert(err); return }
      setIsProcessing(true)
      try {
        const raw = await fileToDataUrl(file)
        const cropped = await cropCenterSquare(raw, 600)
        onPhotoSelected(cropped)
      } catch {
        alert('图片读取失败，请重试')
      } finally {
        setIsProcessing(false)
      }
    },
    [onPhotoSelected]
  )

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) handleFile(file)
      e.target.value = ''
    },
    [handleFile]
  )

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) handleFile(file)
  }, [handleFile])

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #FF2442 0%, #cc1a34 50%, #8b0f20 100%)',
      display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative'
    }}>
      {/* Background decorations */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', top: 32, right: 24, width: 128, height: 128,
          borderRadius: '50%', border: '4px solid rgba(255,255,255,0.1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <span style={{ fontSize: 48, opacity: 0.2 }}>⚽</span>
        </div>
        <div style={{
          position: 'absolute', top: 0, left: '25%', width: 1, height: '100%',
          background: 'linear-gradient(180deg, rgba(255,255,255,0.2) 0%, transparent 100%)'
        }} />
        <div style={{
          position: 'absolute', top: 0, right: '33%', width: 1, height: '100%',
          background: 'linear-gradient(180deg, rgba(255,255,255,0.1) 0%, transparent 100%)'
        }} />
      </div>

      {/* Header */}
      <div style={{ position: 'relative', zIndex: 10, paddingTop: 56, paddingBottom: 24, paddingInline: 24, textAlign: 'center' }}>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)',
            borderRadius: 100, paddingInline: 16, paddingBlock: 8, marginBottom: 32
          }}
        >
          <div style={{
            width: 20, height: 20, background: 'white', borderRadius: 4,
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <span style={{ color: '#FF2442', fontSize: 10, fontWeight: 900 }}>薯</span>
          </div>
          <span style={{ color: 'white', fontSize: 14, fontWeight: 500 }}>小红书 × 世界杯</span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <h1 style={{ color: 'white', fontWeight: 900, margin: 0, lineHeight: 1.2 }}>
            <span style={{ fontSize: 40, display: 'block', marginBottom: 8 }}>我被藏进</span>
            <span style={{ fontSize: 50, display: 'block', color: '#FFD700', textShadow: '0 2px 8px rgba(0,0,0,0.3)' }}>世界杯大屏</span>
            <span style={{ fontSize: 40, display: 'block', marginTop: 8 }}>里了</span>
          </h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          style={{ marginTop: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}
        >
          <div style={{ height: 1, width: 48, background: 'rgba(255,255,255,0.3)' }} />
          <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14 }}>⚽ 找找你在哪座城市的大屏 ⚽</span>
          <div style={{ height: 1, width: 48, background: 'rgba(255,255,255,0.3)' }} />
        </motion.div>
      </div>

      {/* Upload card */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        style={{ position: 'relative', zIndex: 10, marginInline: 16, flex: 1, display: 'flex', flexDirection: 'column', paddingBottom: 16 }}
      >
        <div style={{
          background: 'white', borderRadius: 32, padding: 24,
          boxShadow: '0 20px 60px rgba(0,0,0,0.2)', flex: 1, display: 'flex', flexDirection: 'column'
        }}>
          <p style={{ color: '#666', textAlign: 'center', fontSize: 14, lineHeight: 1.6, marginTop: 0, marginBottom: 24 }}>
            上传一张照片<br />看看你会出现在哪座城市的大屏 🏙️
          </p>

          {/* Drop zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            style={{
              flex: 1, minHeight: 200, borderRadius: 24,
              border: `2px dashed ${isDragging ? '#FF2442' : '#e0e0e0'}`,
              background: isDragging ? '#FFF0F2' : '#fafafa',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: 16,
              transition: 'all 0.2s', transform: isDragging ? 'scale(1.01)' : 'scale(1)'
            }}
          >
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              style={{
                width: 80, height: 80, background: '#FFF0F2', borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}
            >
              <span style={{ fontSize: 32 }}>📸</span>
            </motion.div>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontWeight: 600, fontSize: 16, margin: '0 0 4px', color: '#1A1A1A' }}>点击或拖拽上传照片</p>
              <p style={{ color: '#999', fontSize: 12, margin: 0 }}>支持 JPG / PNG / WEBP，最大 10MB</p>
            </div>
          </div>

          {/* Upload button */}
          <div style={{ marginTop: 24 }}>
            <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" style={{ display: 'none' }} onChange={handleChange} />
            <button
              disabled={isProcessing}
              onClick={() => inputRef.current?.click()}
              style={{
                width: '100%', height: 56, borderRadius: 16,
                background: isProcessing ? '#ccc' : '#FF2442',
                color: 'white', fontSize: 16, fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                cursor: isProcessing ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 20px rgba(255,36,66,0.3)',
                transition: 'all 0.2s'
              }}
            >
              {isProcessing ? (
                <>
                  <span style={{
                    width: 20, height: 20, border: '2px solid rgba(255,255,255,0.4)',
                    borderTopColor: 'white', borderRadius: '50%', animation: 'spin 1s linear infinite'
                  }} />
                  处理中…
                </>
              ) : (
                <><span style={{ fontSize: 20 }}>📸</span>上传照片，开始探险</>
              )}
            </button>
          </div>

          <p style={{ textAlign: 'center', color: '#bbb', fontSize: 12, marginTop: 12, marginBottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
            <span>🔒</span>照片仅在本地处理，不上传服务器
          </p>
        </div>
      </motion.div>

      {/* Footer */}
      <div style={{ position: 'relative', zIndex: 10, paddingBlock: 24, textAlign: 'center' }}>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, margin: 0 }}>
          {new Date().getFullYear()} 小红书 · 世界杯大屏互动
        </p>
      </div>
    </div>
  )
}
