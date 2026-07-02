import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '我被藏进世界杯大屏里了 | 小红书',
  description: '上传一张照片，看看你会出现在哪座城市的世界杯大屏里！',
  keywords: ['世界杯', '小红书', '大屏', '互动', 'H5'],
  openGraph: {
    title: '我被藏进世界杯大屏里了',
    description: '上传照片，出现在全国大屏，快来找找你在哪！',
    type: 'website',
    locale: 'zh_CN',
  },
  other: { 'applicable-device': 'mobile' },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#FF2442',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <head>
        <meta name="format-detection" content="telephone=no" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body>{children}</body>
    </html>
  )
}
