'use client'

import { motion } from 'framer-motion'

export function GeneratingPage() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #FF2442 0%, #cc1a34 50%, #8b0f20 100%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '0 24px'
    }}>
      {/* Animated billboard */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        style={{
          position: 'relative', width: 288, height: 192,
          borderRadius: 16, overflow: 'hidden', marginBottom: 40,
          boxShadow: '0 25px 60px rgba(0,0,0,0.4)'
        }}
      >
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, #0d1b2a, #1b4f72)' }} />
        <div style={{ position: 'absolute', inset: 0, border: '4px solid rgba(255,220,50,0.3)', borderRadius: 16 }} />

        {/* Scanning line */}
        <motion.div
          style={{
            position: 'absolute', left: 0, right: 0, height: '30%',
            background: 'linear-gradient(180deg, transparent, rgba(255,255,255,0.1), transparent)'
          }}
          animate={{ y: ['-100%', '400%'] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
        />

        {/* Center content */}
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 0.8, repeat: Infinity }}
            style={{
              width: 64, height: 64, borderRadius: '50%',
              background: 'rgba(255,255,255,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}
          >
            <span style={{ fontSize: 28 }}>👤</span>
          </motion.div>
          <div style={{ display: 'flex', gap: 4 }}>
            {[0, 1, 2, 3, 4].map(i => (
              <motion.div
                key={i}
                style={{ width: 8, height: 8, borderRadius: '50%', background: 'white' }}
                animate={{ opacity: [0.2, 1, 0.2] }}
                transition={{ duration: 1, repeat: Infinity, delay: i * 0.15 }}
              />
            ))}
          </div>
        </div>

        <div style={{ position: 'absolute', top: 8, left: 8, color: 'rgba(255,220,50,0.6)', fontSize: 12, fontFamily: 'monospace' }}>▶ LIVE</div>
        <div style={{ position: 'absolute', top: 8, right: 8, color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>⚽ 2026</div>
      </motion.div>

      {/* Steps */}
      {['识别你的脸…', '扫描全国大屏…', '计算最佳位置…', '把你藏进去…'].map((step, i) => (
        <motion.div
          key={step}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.3 }}
          style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}
        >
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 0.6, delay: i * 0.3, repeat: 3 }}
            style={{
              width: 24, height: 24, borderRadius: '50%',
              background: 'rgba(255,255,255,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontSize: 12, fontWeight: 700
            }}
          >
            {i + 1}
          </motion.div>
          <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14 }}>{step}</span>
        </motion.div>
      ))}

      {/* Loading bar */}
      <div style={{ width: 256, height: 6, background: 'rgba(255,255,255,0.2)', borderRadius: 3, overflow: 'hidden', marginTop: 16 }}>
        <motion.div
          style={{ height: '100%', background: '#FFD700', borderRadius: 3 }}
          initial={{ width: '0%' }}
          animate={{ width: '95%' }}
          transition={{ duration: 2, ease: 'easeOut' }}
        />
      </div>
      <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, marginTop: 12 }}>正在生成…</p>
    </div>
  )
}
