import { Template, ReplaceSlot, MascotAsset } from '@/types'

// Canvas output dimensions (小红书 9:16 = 1080x1350)
export const OUTPUT_WIDTH = 1080
export const OUTPUT_HEIGHT = 1350

// Preview canvas dimensions (fits mobile screen, keeps 16:9 or 4:3)
export const PREVIEW_DISPLAY_WIDTH = 375
export const PREVIEW_DISPLAY_HEIGHT = 470

/**
 * 计算模板图在画布上的显示尺寸（contain fit）
 */
export function getTemplateFit(
  templateW: number,
  templateH: number,
  canvasW: number,
  canvasH: number
) {
  const scaleX = canvasW / templateW
  const scaleY = canvasH / templateH
  const scale = Math.min(scaleX, scaleY)
  const width = templateW * scale
  const height = templateH * scale
  const x = (canvasW - width) / 2
  const y = (canvasH - height) / 2
  return { x, y, width, height, scale }
}

/**
 * 加载图片为 HTMLImageElement
 */
export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new window.Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

/**
 * 核心合成函数：
 * 1. 画模板背景
 * 2. 在指定 slot 位置合成用户头像（圆形裁剪 + 位置/缩放对齐）
 * 3. 可选：叠加薯队长
 * 返回 1080x1350 的 dataURL
 */
export async function compositeImage(
  userPhotoDataUrl: string,
  template: Template,
  slot: ReplaceSlot,
  mascotAsset: MascotAsset | null,
  templateImgNaturalWidth: number,
  templateImgNaturalHeight: number
): Promise<string> {
  const canvas = document.createElement('canvas')
  canvas.width = OUTPUT_WIDTH
  canvas.height = OUTPUT_HEIGHT
  const ctx = canvas.getContext('2d')!

  // ── 背景：渐变深红色（占位用，若模板图加载失败）
  const grad = ctx.createLinearGradient(0, 0, 0, OUTPUT_HEIGHT)
  grad.addColorStop(0, '#1a0005')
  grad.addColorStop(1, '#3d0010')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, OUTPUT_WIDTH, OUTPUT_HEIGHT)

  // ── 1. 绘制模板图（cover fit，保证填满画布）
  const templateImg = await loadImage(template.image)
  const naturalW = templateImgNaturalWidth || templateImg.naturalWidth
  const naturalH = templateImgNaturalHeight || templateImg.naturalHeight

  // cover fit：放大到刚好能填满画布
  const scaleX = OUTPUT_WIDTH / naturalW
  const scaleY = OUTPUT_HEIGHT / naturalH
  const scale = Math.max(scaleX, scaleY)
  const drawW = naturalW * scale
  const drawH = naturalH * scale
  const drawX = (OUTPUT_WIDTH - drawW) / 2
  const drawY = (OUTPUT_HEIGHT - drawH) / 2

  ctx.drawImage(templateImg, drawX, drawY, drawW, drawH)

  // ── 2. 用户头像覆盖到 slot 位置
  const userImg = await loadImage(userPhotoDataUrl)

  // slot 坐标是相对于模板图原始尺寸的
  // 需要映射到输出画布坐标
  const slotX = drawX + slot.x * scale
  const slotY = drawY + slot.y * scale
  const slotW = slot.width * scale
  const slotH = slot.height * scale

  ctx.save()
  ctx.translate(slotX + slotW / 2, slotY + slotH / 2)
  if (slot.rotation) {
    ctx.rotate((slot.rotation * Math.PI) / 180)
  }

  // 圆角矩形裁剪头像
  const radius = Math.min(slotW, slotH) * 0.12
  roundRect(ctx, -slotW / 2, -slotH / 2, slotW, slotH, radius)
  ctx.clip()

  // 保持头像 cover 填满 slot
  const userAspect = userImg.naturalWidth / userImg.naturalHeight
  const slotAspect = slotW / slotH
  let sx = 0, sy = 0, sw = userImg.naturalWidth, sh = userImg.naturalHeight
  if (userAspect > slotAspect) {
    sw = sh * slotAspect
    sx = (userImg.naturalWidth - sw) / 2
  } else {
    sh = sw / slotAspect
    sy = (userImg.naturalHeight - sh) / 2
  }
  ctx.drawImage(userImg, sx, sy, sw, sh, -slotW / 2, -slotH / 2, slotW, slotH)
  ctx.restore()

  // 微妙融合：边缘半透明阴影
  ctx.save()
  ctx.translate(slotX + slotW / 2, slotY + slotH / 2)
  if (slot.rotation) ctx.rotate((slot.rotation * Math.PI) / 180)
  const shadowGrad = ctx.createRadialGradient(0, 0, slotW * 0.3, 0, 0, slotW * 0.6)
  shadowGrad.addColorStop(0, 'rgba(0,0,0,0)')
  shadowGrad.addColorStop(1, 'rgba(0,0,0,0.25)')
  ctx.fillStyle = shadowGrad
  roundRect(ctx, -slotW / 2, -slotH / 2, slotW, slotH, radius)
  ctx.fill()
  ctx.restore()

  // ── 3. 薯队长（可选）
  if (mascotAsset) {
    try {
      const mascotImg = await loadImage(mascotAsset.image)
      const ms = template.mascotSlot
      const mX = drawX + (ms.x || 0) * scale
      const mY = drawY + (ms.y || 0) * scale
      const mW = (ms.width || 120) * scale
      const mH = (ms.height || 120) * scale
      ctx.drawImage(mascotImg, mX, mY, mW, mH)
    } catch {
      // 薯队长图片加载失败，跳过
    }
  }

  // ── 4. 底部品牌水印
  const badgeH = 72
  const badgeGrad = ctx.createLinearGradient(0, OUTPUT_HEIGHT - badgeH, 0, OUTPUT_HEIGHT)
  badgeGrad.addColorStop(0, 'rgba(0,0,0,0)')
  badgeGrad.addColorStop(1, 'rgba(0,0,0,0.6)')
  ctx.fillStyle = badgeGrad
  ctx.fillRect(0, OUTPUT_HEIGHT - badgeH, OUTPUT_WIDTH, badgeH)

  ctx.fillStyle = 'rgba(255,255,255,0.9)'
  ctx.font = 'bold 28px PingFang SC, Microsoft YaHei, sans-serif'
  ctx.textAlign = 'left'
  ctx.textBaseline = 'middle'
  ctx.fillText('小红书 × 世界杯', 40, OUTPUT_HEIGHT - 36)

  ctx.fillStyle = 'rgba(255,255,255,0.6)'
  ctx.font = '22px PingFang SC, Microsoft YaHei, sans-serif'
  ctx.textAlign = 'right'
  ctx.fillText(template.pointName, OUTPUT_WIDTH - 40, OUTPUT_HEIGHT - 36)

  return canvas.toDataURL('image/png', 1.0)
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}
