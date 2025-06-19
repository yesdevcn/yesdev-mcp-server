# YesDev MCP Server

本项目为 YesDev 项目管理系统的 MCP Server 实现，支持任务等数据的标准化交互，兼容 Cursor 等 AI 客户端。

## 启动方法

```bash
npm install
cp .env.example .env # 并填写你的 YESDEV_ACCESS_TOKEN
npm run dev
```

## 环境变量
- YESDEV_ACCESS_TOKEN：你的 YesDev API 访问令牌

## 主要功能
- 任务的创建、查询、删除（后续可扩展项目、需求、文档等） 