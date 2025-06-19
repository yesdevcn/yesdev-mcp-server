# YesDev MCP Server

这是一个基于 [Model Context Protocol (MCP)](https://github.com/cursor-ai/model-context-protocol) 规范实现的服务器，用于集成 [YesDev项目管理工具](https://www.yesdev.cn/) 的任务管理功能。

## 使用

Cursor的MCP配置，
```json
{
  "mcpServers": {
    "yesdev-mcp-server": {
      "command": "node",
      "args": ["/path/to/yesdev-mcp-server/dist/index.js"],
      "env": {
        "YESDEV_ACCESS_TOKEN": "你的YesDev令牌"
      }
  }
}
```

## 功能特性

- 完整实现 MCP 服务器规范
- 支持会话管理和状态追踪
- 提供任务管理相关工具
- 内置错误处理和日志记录

## 系统要求

- Node.js >= 18.0.0
- npm 或 yarn 包管理器

## 安装

1. 克隆仓库：

```bash
cd yesdev-mcp-server
```

2. 安装依赖：

```bash
npm install
```

## 配置

1. 创建 `.env` 文件：

```bash
cp .env.example .env
```

2. 配置环境变量：

```env
PORT=3000  # 服务器端口号

# 获取方式：https://www.yesdev.cn/platform/account/accountInfo
YESDEV_ACCESS_TOKEN=填写你自己的令牌
```

## 开发

启动开发服务器：

```bash
npm run dev
```

## 构建和部署

1. 构建项目：

```bash
npm run build
```

2. 启动服务器：

```bash
npm start
```

服务器将在 `http://localhost:3000/mcp` 启动（或在环境变量指定的端口）。

## 已实现的工具

### create_task

创建新任务的工具。

- **描述**：创建一个新的 YesDev 任务
- **输入参数**：
  - `title`: string - 任务标题
  - `assignee`: string - 负责人ID
- **返回值**：
  - 成功：返回包含任务ID的成功消息
  - 失败：返回错误信息

## API 端点

### MCP 服务端点

- **URL**: `/mcp`
- **方法**: `POST`, `GET`
- **描述**: 处理所有 MCP 请求
- **头部要求**:
  - `mcp-session-id`: 会话ID（初始化请求除外）

### 会话管理

- **URL**: `/mcp`
- **方法**: `DELETE`
- **描述**: 终止指定的会话
- **头部要求**:
  - `mcp-session-id`: 要终止的会话ID

## 开发指南

### 添加新工具

1. 在 `src/index.ts` 中使用 `server.registerTool()` 注册新工具
2. 定义输入模式（使用 Zod）
3. 实现工具逻辑
4. 更新 README.md 中的工具文档

### 错误处理

服务器实现了完整的错误处理机制：
- 会话管理错误
- 工具执行错误
- 通用服务器错误


## 相关项目

- [MCP TS-sdk](https://github.com/modelcontextprotocol/typescript-sdk) 
- [YesDev API 接口文档](https://www.yesdev.cn/docs.php) 
- [Model Context Protocol](https://github.com/modelcontextprotocol/modelcontextprotocol)