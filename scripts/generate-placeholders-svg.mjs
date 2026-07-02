#!/usr/bin/env node
/**
 * 生成SVG占位图（无外部依赖）
 */

import { writeFileSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')

mkdirSync(join(ROOT, 'public/templates'), { recursive: true })
mkdirSync(join(ROOT, 'public/mascot'), { recursive: true })

const TEMPLATES = [
  { id: 'guangzhou', city: '广州', name: '正佳万豪酒店', color: '#1b4f72' },
  { id: 'hangzhou', city: '杭州', name: '西湖天幕', color: '#1a5276' },
  { id: 'changsha', city: '长沙', name: '国金1988', color: '#7d6608' },
  { id: 'chengdu_taikoo', city: '成都', name: '太古里', color: '#1d8348' },
  { id: 'chengdu_chunxi', city: '成都', name: '春熙路', color: '#6c3483' },
  { id: 'wuhan', city: '武汉', name: '江汉路', color: '#a04000' },
  { id: 'chongqing', city: '重庆', name: '观音桥', color: '#922b21' },
  { id: 'dalian', city: '大连', name: '中央大道', color: '#0e6655' },
  { id: 'shenyang', city: '沈阳', name: '盛京MAX', color: '#154360' },
  { id: 'qingdao', city: '青岛', name: '万象城', color: '#145a32' },
  { id: 'xian', city: '西安', name: '曲江大悦城', color: '#5b2333' },
  { id: 'shenzhen', city: '深圳', name: '深圳湾', color: '#1a5276' },
  { id: 'beijing', city: '北京', name: '首都机场', color: '#1c2833' },
  { id: 'shanghai_hongqiao', city: '上海', name: '虹桥机场', color: '#641e16' },
  { id: 'shanghai_pudong', city: '上海', name: '浦东机场', color: '#0b5345' },
]

function generateTemplateSVG(tmpl) {
  const W = 1080, H = 720
  const numSlots = 2 + (TEMPLATES.indexOf(tmpl) % 3)
  const slotWidth = 120, slotHeight = 160
  const slots = []
  for (let i = 0; i < numSlots; i++) {
    const x = Math.floor(130 + i * ((W - 260) / numSlots) + ((W - 260) / numSlots) / 2 - 60)
    const y = 200
    slots.push({ x, y, idx: i + 1 })
  }

  const slotsSVG = slots.map(s => `
    <rect x="${s.x}" y="${s.y}" width="${slotWidth}" height="${slotHeight}" 
      fill="rgba(255,255,255,0.08)" rx="8" stroke="#FF2442" stroke-width="3" stroke-dasharray="10,5"/>
    <ellipse cx="${s.x + slotWidth / 2}" cy="${s.y + 38}" rx="32" ry="32" fill="rgba(255,255,255,0.15)"/>
    <rect x="${s.x + 15}" y="${s.y + 74}" width="${slotWidth - 30}" height="68" rx="10" fill="rgba(255,255,255,0.12)"/>
    <rect x="${s.x + 3}" y="${s.y + 3}" width="30" height="22" rx="6" fill="#FF2442"/>
    <text x="${s.x + 18}" y="${s.y + 17}" text-anchor="middle" dominant-baseline="middle" 
      fill="white" font-size="14" font-weight="bold" font-family="sans-serif">${s.idx}</text>
  `).join('')

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${tmpl.color}" stop-opacity="0.95"/>
      <stop offset="100%" stop-color="#0d1b2a"/>
    </linearGradient>
    <pattern id="grid" width="80" height="80" patternUnits="userSpaceOnUse">
      <path d="M 80 0 L 0 0 0 80" fill="none" stroke="white" stroke-width="0.5" stroke-opacity="0.06"/>
    </pattern>
  </defs>
  
  <!-- Background -->
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <rect width="${W}" height="${H}" fill="url(#grid)"/>
  
  <!-- Billboard frame -->
  <rect x="8" y="8" width="${W - 16}" height="${H - 16}" fill="none" 
    stroke="rgba(255,220,50,0.35)" stroke-width="10" rx="4"/>
  
  <!-- Center glow -->
  <circle cx="${W / 2}" cy="${H / 2 - 20}" r="150" fill="rgba(255,255,255,0.04)"/>
  <circle cx="${W / 2}" cy="${H / 2 - 20}" r="80" fill="rgba(255,255,255,0.06)"/>
  <text x="${W / 2}" y="${H / 2 + 10}" text-anchor="middle" dominant-baseline="middle" 
    font-size="90" font-family="sans-serif" fill="rgba(255,220,50,0.5)">🏆</text>
  
  <!-- People slots -->
  ${slotsSVG}
  
  <!-- Top bar -->
  <rect x="0" y="0" width="${W}" height="75" fill="rgba(0,0,0,0.65)"/>
  <text x="28" y="37" dominant-baseline="middle" fill="#FF2442" 
    font-size="30" font-weight="bold" font-family="sans-serif">小红书 × 世界杯</text>
  <text x="${W - 28}" y="37" text-anchor="end" dominant-baseline="middle" 
    fill="rgba(255,255,255,0.7)" font-size="22" font-family="sans-serif">${tmpl.city} · ${tmpl.name}</text>
  
  <!-- Bottom bar -->
  <rect x="0" y="${H - 60}" width="${W}" height="60" fill="rgba(0,0,0,0.65)"/>
  <text x="${W / 2}" y="${H - 30}" text-anchor="middle" dominant-baseline="middle"
    fill="rgba(255,220,50,0.9)" font-size="22" font-weight="bold" font-family="sans-serif">
    快来找找你在哪里   ⚽   #我被藏进世界杯大屏里了
  </text>
  
  <!-- LIVE indicator -->
  <circle cx="40" cy="${H - 100}" r="8" fill="#FF2442">
    <animate attributeName="opacity" values="1;0.3;1" dur="1.5s" repeatCount="indefinite"/>
  </circle>
  <text x="55" y="${H - 100}" dominant-baseline="middle" fill="#FF2442" 
    font-size="16" font-weight="bold" font-family="sans-serif">LIVE</text>
</svg>`
}

TEMPLATES.forEach(tmpl => {
  const svg = generateTemplateSVG(tmpl)
  writeFileSync(join(ROOT, `public/templates/${tmpl.id}.svg`), svg, 'utf-8')
  console.log(`✓ ${tmpl.id}.svg`)
})

// Mascot SVGs
const mascots = [
  { id: 'mascot-left', label: '左侧探头', rotate: 0 },
  { id: 'mascot-right', label: '右侧探头', rotate: 0 },
  { id: 'mascot-top', label: '顶部探头', rotate: 0 },
  { id: 'mascot-bottom', label: '趴在大屏', rotate: 0 },
]

const mascotSVG = (m) => `<?xml version="1.0" encoding="UTF-8"?>
<svg width="240" height="240" viewBox="0 0 240 240" xmlns="http://www.w3.org/2000/svg">
  <circle cx="120" cy="120" r="100" fill="#FF2442"/>
  <circle cx="120" cy="120" r="74" fill="white"/>
  <text x="120" y="105" text-anchor="middle" dominant-baseline="middle" font-size="52" font-family="sans-serif">🐮</text>
  <text x="120" y="158" text-anchor="middle" dominant-baseline="middle" 
    fill="#FF2442" font-size="18" font-weight="bold" font-family="sans-serif">薯队长</text>
</svg>`

mascots.forEach(m => {
  writeFileSync(join(ROOT, `public/mascot/${m.id}.svg`), mascotSVG(m), 'utf-8')
  console.log(`✓ ${m.id}.svg`)
})

console.log('\n✅ All SVG placeholder assets generated!')
