'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { ReplaceSlot, Template } from '@/types'
import { fileToDataUrl } from '@/lib/utils'

interface AdminTemplate extends Omit<Template, 'replaceSlots'> {
  replaceSlots: ReplaceSlot[]
}

const defaultTemplate: AdminTemplate = {
  id: '', pointName: '', city: '', image: '',
  replaceSlots: [],
  mascotSlot: { x: 900, y: 60, width: 120, height: 120 },
}

export default function AdminPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imgRef = useRef<HTMLImageElement | null>(null)
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null)
  const [template, setTemplate] = useState<AdminTemplate>({ ...defaultTemplate })
  const [drawing, setDrawing] = useState(false)
  const [startPt, setStartPt] = useState({ x: 0, y: 0 })
  const [currentRect, setCurrentRect] = useState<{ startX: number; startY: number; width: number; height: number } | null>(null)
  const [displayScale, setDisplayScale] = useState(1)
  const [naturalSize, setNaturalSize] = useState({ w: 1, h: 1 })
  const [jsonOutput, setJsonOutput] = useState('')
  const [copied, setCopied] = useState(false)

  const redraw = useCallback(() => {
    const canvas = canvasRef.current
    const img = imgRef.current
    if (!canvas || !img) return
    const ctx = canvas.getContext('2d')!
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

    template.replaceSlots.forEach((slot, i) => {
      const sx = slot.x * displayScale, sy = slot.y * displayScale
      const sw = slot.width * displayScale, sh = slot.height * displayScale
      ctx.strokeStyle = '#FF2442'; ctx.lineWidth = 2; ctx.setLineDash([6, 3])
      ctx.strokeRect(sx, sy, sw, sh); ctx.setLineDash([])
      ctx.fillStyle = 'rgba(255,36,66,0.15)'; ctx.fillRect(sx, sy, sw, sh)
      ctx.fillStyle = '#FF2442'; ctx.font = 'bold 14px sans-serif'
      ctx.fillText(`#${i + 1}`, sx + 6, sy + 18)
    })

    if (template.mascotSlot) {
      const ms = template.mascotSlot
      const mx = ms.x * displayScale, my = ms.y * displayScale
      const mw = (ms.width || 120) * displayScale, mh = (ms.height || 120) * displayScale
      ctx.strokeStyle = '#7c3aed'; ctx.lineWidth = 2; ctx.setLineDash([4, 4])
      ctx.strokeRect(mx, my, mw, mh); ctx.setLineDash([])
      ctx.fillStyle = 'rgba(124,58,237,0.1)'; ctx.fillRect(mx, my, mw, mh)
      ctx.fillStyle = '#7c3aed'; ctx.font = 'bold 12px sans-serif'
      ctx.fillText('薯队长', mx + 4, my + 14)
    }

    if (currentRect?.width && currentRect?.height) {
      ctx.strokeStyle = '#FFD700'; ctx.lineWidth = 2; ctx.setLineDash([4, 2])
      ctx.strokeRect(currentRect.startX, currentRect.startY, currentRect.width, currentRect.height)
      ctx.setLineDash([])
    }
  }, [template, currentRect, displayScale])

  useEffect(() => { redraw() }, [redraw])

  const loadImage = useCallback(async (file: File) => {
    const url = await fileToDataUrl(file)
    setImageDataUrl(url)
    const img = new window.Image()
    img.onload = () => {
      imgRef.current = img
      const maxW = Math.min(typeof window !== 'undefined' ? window.innerWidth - 48 : 800, 800)
      const scale = maxW / img.naturalWidth
      const canvas = canvasRef.current!
      canvas.width = img.naturalWidth * scale
      canvas.height = img.naturalHeight * scale
      setNaturalSize({ w: img.naturalWidth, h: img.naturalHeight })
      setDisplayScale(scale)
    }
    img.src = url
  }, [])

  const getPos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current!.getBoundingClientRect()
    return { x: e.clientX - rect.left, y: e.clientY - rect.top }
  }

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const { x, y } = getPos(e); setDrawing(true); setStartPt({ x, y })
    setCurrentRect({ startX: x, startY: y, width: 0, height: 0 })
  }
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!drawing) return
    const { x, y } = getPos(e)
    setCurrentRect({ startX: startPt.x, startY: startPt.y, width: x - startPt.x, height: y - startPt.y })
  }
  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!drawing) return
    setDrawing(false)
    const { x, y } = getPos(e)
    const w = x - startPt.x, h = y - startPt.y
    if (Math.abs(w) < 10 || Math.abs(h) < 10) { setCurrentRect(null); return }
    const rx = (Math.min(startPt.x, x) / displayScale) | 0
    const ry = (Math.min(startPt.y, y) / displayScale) | 0
    const rw = (Math.abs(w) / displayScale) | 0
    const rh = (Math.abs(h) / displayScale) | 0
    setTemplate(p => ({ ...p, replaceSlots: [...p.replaceSlots, { id: p.replaceSlots.length + 1, x: rx, y: ry, width: rw, height: rh, rotation: 0 }] }))
    setCurrentRect(null)
  }

  const removeSlot = (id: number) =>
    setTemplate(p => ({ ...p, replaceSlots: p.replaceSlots.filter(s => s.id !== id).map((s, i) => ({ ...s, id: i + 1 })) }))

  const generateJson = () => {
    const out = { ...template, image: template.image || `/templates/${template.id}.svg` }
    setJsonOutput(JSON.stringify(out, null, 2))
  }

  const inp = (label: string, value: string, onChange: (v: string) => void) => (
    <div key={label} style={{ marginBottom: 12 }}>
      <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#666', marginBottom: 4 }}>{label}</label>
      <input value={value} onChange={e => onChange(e.target.value)}
        style={{ width: '100%', border: '1px solid #e0e0e0', borderRadius: 10, padding: '8px 12px', fontSize: 14, boxSizing: 'border-box', outline: 'none' }}
      />
    </div>
  )

  const card = (children: React.ReactNode) => (
    <div style={{ background: 'white', borderRadius: 16, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.08)', border: '1px solid #f0f0f0', marginBottom: 16 }}>
      {children}
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#f8f8f8', maxWidth: 'none' }}>
      <header style={{ background: 'white', borderBottom: '1px solid #e8e8e8', padding: '16px 24px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 32, height: 32, background: '#FF2442', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 900, fontSize: 14 }}>薯</div>
        <div>
          <h1 style={{ margin: 0, fontWeight: 700, fontSize: 16, color: '#1a1a1a' }}>大屏模板配置工具</h1>
          <p style={{ margin: 0, fontSize: 12, color: '#999' }}>隐藏页面 · 仅运营使用</p>
        </div>
        <div style={{ marginLeft: 'auto', fontSize: 12, color: '#92400e', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 8, padding: '6px 12px' }}>
          ⚠️ 仅内部使用
        </div>
      </header>

      <div style={{ display: 'flex', gap: 24, padding: 24, maxWidth: 1200, margin: '0 auto' }}>
        {/* Left panel */}
        <div style={{ width: 320, flexShrink: 0 }}>
          {card(<>
            <h2 style={{ fontSize: 14, fontWeight: 600, margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 22, height: 22, background: '#FF2442', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 12 }}>1</span>
              基本信息
            </h2>
            {inp('模板 ID（英文）', template.id, v => setTemplate(p => ({ ...p, id: v })))}
            {inp('城市名', template.city, v => setTemplate(p => ({ ...p, city: v })))}
            {inp('大屏名称', template.pointName, v => setTemplate(p => ({ ...p, pointName: v })))}
          </>)}

          {card(<>
            <h2 style={{ fontSize: 14, fontWeight: 600, margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 22, height: 22, background: '#FF2442', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 12 }}>2</span>
              上传大屏图片
            </h2>
            <label style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8,
              border: '2px dashed #e0e0e0', borderRadius: 16, padding: '32px 16px',
              cursor: 'pointer', transition: 'all 0.2s'
            }}>
              <span style={{ fontSize: 24 }}>🖼️</span>
              <span style={{ fontSize: 14, color: '#666' }}>点击上传大屏图片</span>
              <span style={{ fontSize: 12, color: '#aaa' }}>JPG / PNG</span>
              <input type="file" accept="image/*" style={{ display: 'none' }}
                onChange={e => { const f = e.target.files?.[0]; if (f) loadImage(f) }} />
            </label>
            {imageDataUrl && <p style={{ fontSize: 12, color: '#16a34a', marginTop: 8, marginBottom: 0 }}>✅ 图片已加载，请在右侧框选人物头像区域</p>}
          </>)}

          {card(<>
            <h2 style={{ fontSize: 14, fontWeight: 600, margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 22, height: 22, background: '#FF2442', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 12 }}>3</span>
              已框选区域
            </h2>
            {template.replaceSlots.length === 0
              ? <p style={{ textAlign: 'center', color: '#aaa', fontSize: 12, padding: '16px 0', margin: 0 }}>还没有框选人物头像区域</p>
              : template.replaceSlots.map(slot => (
                <div key={slot.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#FFF0F2', borderRadius: 12, padding: '8px 12px', marginBottom: 8 }}>
                  <div>
                    <span style={{ fontSize: 12, fontWeight: 600, color: '#FF2442' }}>区域 #{slot.id}</span>
                    <p style={{ fontSize: 12, color: '#999', margin: '2px 0 0' }}>({slot.x}, {slot.y}) {slot.width}×{slot.height}</p>
                  </div>
                  <button onClick={() => removeSlot(slot.id)}
                    style={{ width: 24, height: 24, borderRadius: '50%', background: 'white', border: 'none', cursor: 'pointer', color: '#999', fontSize: 16 }}>×</button>
                </div>
              ))
            }
            <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: 16, marginTop: 8 }}>
              <p style={{ fontSize: 12, fontWeight: 500, color: '#7c3aed', marginBottom: 8, marginTop: 0 }}>薯队长位置（紫色框）</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {(['x', 'y', 'width', 'height'] as const).map(key => (
                  <div key={key}>
                    <label style={{ fontSize: 11, color: '#999', display: 'block', marginBottom: 2 }}>{key}</label>
                    <input type="number" value={((template.mascotSlot as unknown) as Record<string, number>)[key] || 0}
                      onChange={e => setTemplate(p => ({ ...p, mascotSlot: { ...p.mascotSlot, [key]: Number(e.target.value) } }))}
                      style={{ width: '100%', border: '1px solid #e0e0e0', borderRadius: 8, padding: '4px 8px', fontSize: 12, boxSizing: 'border-box' }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </>)}

          {card(<>
            <h2 style={{ fontSize: 14, fontWeight: 600, margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 22, height: 22, background: '#FF2442', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 12 }}>4</span>
              导出 JSON
            </h2>
            <button onClick={generateJson}
              style={{ width: '100%', background: '#FF2442', color: 'white', border: 'none', borderRadius: 12, padding: '10px', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
              生成配置 JSON
            </button>
            {jsonOutput && (
              <div style={{ marginTop: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 12, color: '#999' }}>复制到 templates.json</span>
                  <button onClick={() => { navigator.clipboard.writeText(jsonOutput); setCopied(true); setTimeout(() => setCopied(false), 2000) }}
                    style={{ fontSize: 12, color: '#FF2442', fontWeight: 500, border: 'none', background: 'none', cursor: 'pointer' }}>
                    {copied ? '✅ 已复制' : '📋 复制'}
                  </button>
                </div>
                <pre style={{ background: '#1a1a2e', color: '#4ade80', fontSize: 11, padding: 12, borderRadius: 10, overflow: 'auto', maxHeight: 256, margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                  {jsonOutput}
                </pre>
              </div>
            )}
          </>)}

          <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 16, padding: 16, fontSize: 12, color: '#1d4ed8', lineHeight: 1.6 }}>
            <p style={{ fontWeight: 600, margin: '0 0 6px' }}>📋 使用说明</p>
            <ol style={{ margin: 0, padding: '0 0 0 18px' }}>
              {['填写基本信息', '上传大屏图片', '框选人物头像位置（可多个）', '调整薯队长坐标', '生成配置 JSON', '追加到 config/templates.json', '图片放到 public/templates/'].map((s, i) => (
                <li key={i} style={{ marginBottom: 2 }}>{s}</li>
              ))}
            </ol>
          </div>
        </div>

        {/* Right: Canvas */}
        <div style={{ flex: 1 }}>
          <div style={{ background: 'white', borderRadius: 16, padding: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.08)', border: '1px solid #f0f0f0' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <h2 style={{ fontSize: 14, fontWeight: 600, margin: 0 }}>框选人物头像区域</h2>
              {imageDataUrl && (
                <span style={{ fontSize: 12, color: '#aaa' }}>原始尺寸: {naturalSize.w}×{naturalSize.h}</span>
              )}
            </div>
            {!imageDataUrl
              ? <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 256, color: '#ccc', gap: 12 }}>
                  <span style={{ fontSize: 48 }}>🖼️</span>
                  <p style={{ fontSize: 14, margin: 0 }}>请先上传大屏图片</p>
                </div>
              : <div style={{ overflow: 'auto', borderRadius: 10, border: '1px solid #f0f0f0' }}>
                  <canvas ref={canvasRef} style={{ cursor: 'crosshair', display: 'block' }}
                    onMouseDown={handleMouseDown} onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp} onMouseLeave={() => drawing && setDrawing(false)} />
                </div>
            }
            {imageDataUrl && <p style={{ fontSize: 12, color: '#aaa', textAlign: 'center', marginTop: 8, marginBottom: 0 }}>拖拽框选人物头像区域，可框选多个</p>}
          </div>
        </div>
      </div>
    </div>
  )
}
