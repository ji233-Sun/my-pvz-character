# PVZ2 本命检测所

> 输入你的昵称，让 AI 从《植物大战僵尸 2》全量图鉴里挑出最像你的那一位。

![MIT License](https://img.shields.io/badge/license-MIT-green)
![Next.js](https://img.shields.io/badge/Next.js-16-black)

## 功能

- 支持**植物**、**僵尸**、**随机**三种检测模式
- 数据直接来自官网图鉴，涵盖 100+ 植物与僵尸条目
- AI 根据昵称的音感、字面意象、情绪气质进行匹配，并给出一段带点玩味的理由
- 独立 Loading 页 + 独立结果页，体验完整

## 技术栈

| 层次 | 技术 |
|------|------|
| 框架 | Next.js 16 (App Router) |
| 语言 | TypeScript |
| 样式 | Tailwind CSS v4 |
| AI   | Minimax API |
| 包管理 | pnpm |

## 本地开发

```bash
# 安装依赖
pnpm install

# 配置环境变量
cp .env.example .env.local
# 填入 MINIMAX_API_KEY 和 MINIMAX_GROUP_ID

# 启动开发服务器
pnpm dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看效果。

## 环境变量

| 变量名 | 说明 |
|--------|------|
| `MINIMAX_API_KEY` | Minimax 平台 API Key |
| `MINIMAX_GROUP_ID` | Minimax 平台 Group ID |

## 数据更新

图鉴数据存放在 `data/pvz-catalog.json`，可通过脚本从官网重新拉取：

```bash
pnpm run fetch-catalog
```

## 部署

推荐部署到 [Vercel](https://vercel.com)，将环境变量在项目设置中配置即可。

## License

[MIT](./LICENSE)
