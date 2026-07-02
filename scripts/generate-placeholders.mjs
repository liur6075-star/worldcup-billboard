#!/usr/bin/env node
/**
 * 生成开发阶段占位图
 * 运行：node scripts/generate-placeholders.mjs
 */

import { createCanvas } from 'canvas'
import { writeFileSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')

const TEMPLATES = [
  { id: 'guangzhou', city: '广州', name: '正佳万豪酒店' },
  { id: 'hangzhou', city: '杭州', name: '西湖天幕' },
  { id: 'changsha', city: '长沙', name: '国金1988' },
  { id: 'chengdu_taikoo', city: '成都', name: '太古里' },
  { id: 'chengdu_chunxi', city: '成都', name: '春熙路' },
  { id: 'wuhan', city: '武汉', name: '江汉路' },
  { id: 'chongqing', city: '重庆', name: '观音桥' },
  { id: 'dalian', city: '大连', name: '中央大道' },
  { id: 'shenyang', city: '沈阳', name: '盛京MAX' },
  { id: 'qingdao', city: '青岛', name: '万象城' },
  { id: 'xian', city: '西安', name: '曲江大悦城' },
  { id: 'shenzhen', city: '深圳', name: '深圳湾' },
  { id: 'beijing', city: '北京', name: '首都机场' },
  { id: 'shanghai_hongqiao', city: '上海', name: '虹桥机场' },
  { id: 'shanghai_pudong', city: '上海', name: '浦东机场' },
]

const COLORS = [
  ['#1a1a2e', '#16213e', '#0f3460'],
  ['#2c003e', '#9c27b0', '#e91e63'],
  ['#003366', '#0066cc', '#00ccff'],
  ['#1b5e20', '#2e7d32', '#4caf50'],
  ['#bf360c', '#d84315', '#ff5722'],
]

mkdirSync(join(ROOT, 'public/templates'), { recursive: true })
mkdirSync(join(ROOT, 'public/mascot'), { recursive: true })

function generateTemplate(tmpl, colorPair) {
  const W = 1080, H = 720
  const canvas = createCanvas(W, H)
  const ctx = canvas.getContext('2d')

  // Background gradient
  const grad = ctx.createLinearGradient(0, 0, W, H)
  grad.addColorStop(0, colorPair[0])
  grad.addColorStop(0.5, colorPair[1])
  grad.addColorStop(1, colorPair[2])
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, W, H)

  // Grid overlay
  ctx.strokeStyle = 'rgba(255,255,255,0.05)'
  ctx.lineWidth = 1
  for (let x = 0; x < W; x += 60) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke()
  }
  for (let y = 0; y < H; y += 60) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke()
  }

  // Billboard frame
  ctx.strokeStyle = 'rgba(255,200,50,0.4)'
  ctx.lineWidth = 8
  ctx.strokeRect(20, 20, W - 40, H - 40)

  // City label  
  ctx.fillStyle = 'rgba(255,255,255,0.15)'
  ctx.fillRect(0, 0, W, 100)

  ctx.fillStyle = '#FF2442'
  ctx.font = 'bold 52px sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(`🏆 ${tmpl.city} · 世界杯大屏`, W / 2, 50)

  // Placeholder people silhouettes
  const slotCount = Math.floor(Math.random() * 3) + 2
  for (let i = 0; i < slotCount; i++) {
    const x = 150 + i * (W / slotCount) - 60
    const y = 250
    // Head
    ctx.fillStyle = 'rgba(255,255,255,0.2)'
    ctx.beginPath()
    ctx.arc(x + 60, y, 55, 0, Math.PI * 2)
    ctx.fill()
    // Body
    ctx.fillRect(x + 10, y + 55, 100, 130)
    // Slot indicator
    ctx.strokeStyle = '#FF2442'
    ctx.lineWidth = 3
    ctx.setLineDash([8, 4])
    ctx.strokeRect(x, y - 60, 120, 160)
    ctx.setLineDash([])
    ctx.fillStyle = 'rgba(255,36,66,0.6)'
    ctx.font = 'bold 18px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(`头像区${i + 1}`, x + 60, y + 115)
  }

  // Footer
  ctx.fillStyle = 'rgba(0,0,0,0.5)'
  ctx.fillRect(0, H - 80, W, 80)
  ctx.fillStyle = 'rgba(255,255,255,0.8)'
  ctx.font = 'bold 26px sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText(`${tmpl.name} · 小红书世界杯主题大屏`, W / 2, H - 40)

  return canvas.toBuffer('image/jpeg', { quality: 0.9 })
}

TEMPLATES.forEach((tmpl, i) => {
  const colors = COLORS[i % COLORS.length]
  const buf = generateTemplate(tmpl, colors)
  writeFileSync(join(ROOT, `public/templates/${tmpl.id}.jpg`), buf)
  console.log(`✓ ${tmpl.id}.jpg`)
})

// Generate mascot placeholder PNGs
function generateMascotPlaceholder(name, emojiChar) {
  const S = 200
  const canvas = createCanvas(S, S)
  const ctx = canvas.getContext('2d')
  
  // Transparent background + circle
  ctx.clearRect(0, 0, S, S)
  ctx.fillStyle = '#FF2442'
  ctx.beginPath()
  ctx.arc(S / 2, S / 2, 80, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = 'white'
  ctx.font = 'bold 80px sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(emojiChar, S / 2, S / 2)

  return canvas.toBuffer('image/png')
}

const mascots = [
  ['mascot-left', '🐮'],
  ['mascot-right', '⚽'],
  ['mascot-top', '🏆'],
  ['mascot-bottom', '🎉'],
]

mascots.forEach(([id, emoji]) => {
  const buf = generateMascotPlaceholder(id, emoji)
  writeFileSync(join(ROOT, `public/mascot/${id}.png`), buf)
  console.log(`✓ ${id}.png`)
})

console.log('\n✅ 所有占位图生成完成')
