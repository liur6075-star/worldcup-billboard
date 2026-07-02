# 我被藏进世界杯大屏里了

> 小红书世界杯期间轻量级互动H5项目

## 项目简介

用户上传自己的照片后，自动出现在全国多个城市世界杯主题大屏的人物位置，形成"我被藏进世界杯大屏里了，快来找找我在哪"的趣味效果图。

## 功能特性

- 📸 上传照片 → 自动居中裁剪头像
- 🏙️ 随机抽取全国15座城市大屏模板
- 🎭 头像无缝融合到大屏人物位置
- 🐮 一键添加薯队长贴纸
- 💾 导出 1080×1350 PNG（适合小红书发布）
- 🔄 支持换城市、重新上传
- 🔧 运营后台 `/admin` 可配置模板

## 技术栈

- **框架**: Next.js 15 + TypeScript
- **样式**: TailwindCSS
- **动画**: Framer Motion
- **图片合成**: 纯 Canvas API（浏览器端，不调任何后端/AI）
- **部署**: Vercel

## 隐私说明

🔒 **所有图片处理均在浏览器本地完成，不上传至任何服务器，不存储用户数据。**

## 快速开始

```bash
# 安装依赖
npm install

# 本地开发
npm run dev

# 访问
open http://localhost:3000

# 运营配置工具
open http://localhost:3000/admin
```

## 目录结构

```
worldcup-billboard/
├── app/
│   ├── page.tsx          # 主页面（路由协调）
│   ├── layout.tsx        # 全局布局
│   ├── globals.css       # 全局样式
│   └── admin/
│       └── page.tsx      # 运营配置工具（隐藏页）
├── components/
│   ├── HomePage.tsx      # 首页（上传入口）
│   ├── GeneratingPage.tsx # 生成过渡动画
│   ├── ResultPage.tsx    # 结果页
│   ├── ImageCompositor.tsx # Canvas合成核心
│   ├── ActionButton.tsx  # 通用按钮组件
│   └── UploadZone.tsx    # 上传区域组件
├── hooks/
│   └── useAppState.ts    # 应用状态管理
├── lib/
│   ├── compositor.ts     # Canvas合成逻辑
│   ├── mascot.ts         # 薯队长素材配置
│   └── utils.ts          # 工具函数
├── types/
│   └── index.ts          # TypeScript类型定义
├── config/
│   └── templates.json    # 大屏模板配置
├── public/
│   ├── templates/        # 大屏模板图片
│   └── mascot/           # 薯队长素材图片
├── scripts/
│   └── generate-placeholders-svg.mjs  # 开发占位图生成
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
└── vercel.json
```

## 模板配置

所有模板统一配置在 `config/templates.json`：

```json
{
  "id": "hangzhou",
  "pointName": "杭州西湖天幕户外LED广告巨屏",
  "city": "杭州",
  "image": "/templates/hangzhou.svg",
  "replaceSlots": [
    { "id": 1, "x": 420, "y": 310, "width": 120, "height": 150, "rotation": 0 }
  ],
  "mascotSlot": { "x": 900, "y": 80, "width": 120, "height": 120 }
}
```

### 新增城市大屏（运营流程）

1. 访问 `/admin` 页面
2. 填写大屏基本信息（城市名、大屏名称、ID）
3. 上传大屏图片
4. 在图片上框选人物头像位置（可多个）
5. 调整薯队长位置
6. 点击"生成配置 JSON"并复制
7. 将 JSON 追加到 `config/templates.json`
8. 将图片放到 `public/templates/` 目录
9. 重新部署

## 薯队长素材替换

将真实薯队长透明PNG放到 `public/mascot/` 目录，文件名对应：

| 文件名 | 说明 |
|--------|------|
| `mascot-left.png` | 左侧探头 |
| `mascot-right.png` | 右侧探头 |
| `mascot-top.png` | 顶部探头 |
| `mascot-bottom.png` | 趴在大屏上 |

## 部署到 Vercel

### 方式一：GitHub 一键部署

1. Fork 本仓库到自己的 GitHub
2. 访问 [vercel.com](https://vercel.com)，点击 "New Project"
3. 选择你 fork 的仓库
4. 保持默认设置，点击 "Deploy"
5. 等待部署完成，获得域名

### 方式二：Vercel CLI

```bash
# 安装 Vercel CLI
npm i -g vercel

# 登录
vercel login

# 部署
vercel

# 生产环境部署
vercel --prod
```

### 环境变量

本项目无需任何环境变量，纯前端实现。

## 图片替换说明

开发阶段使用 SVG 占位图。上线前需要：

1. 将实际大屏图片（推荐 1920×1080 JPG）放到 `public/templates/`
2. 将薯队长透明 PNG 放到 `public/mascot/`
3. 更新 `config/templates.json` 中的图片路径（`.svg` 改为 `.jpg`）
4. 在 `/admin` 页面重新框选头像区域（因为实际图片坐标可能不同）

## 分享文案建议

> 今天意外发现自己出现在了[城市]的世界杯大屏里😮  
> 快来找找你在哪个城市的大屏→  
> #我被藏进世界杯大屏里了 #小红书世界杯

---

Made with ❤️ by 小红书 · 世界杯互动项目
