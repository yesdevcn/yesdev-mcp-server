# YesDev MCP Server

这是一个基于 [Model Context Protocol (MCP)](https://github.com/cursor-ai/model-context-protocol) 规范实现的服务器，用于集成 [YesDev项目管理工具](https://www.yesdev.cn/) 的任务管理功能。

## 功能特性

- 完整实现 MCP 服务器规范
- 支持 YesDev 任务管理功能
- 使用标准输入输出通信（StdioServerTransport）
- 内置错误处理和日志记录

## 系统要求

- Node.js >= 18.0.0
- npm 或 yarn 包管理器

## 安装

1. 克隆仓库：

```bash
git clone [repository-url]
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
# 获取方式：https://www.yesdev.cn/platform/account/accountInfo
YESDEV_ACCESS_TOKEN=填写你自己的令牌
```

## 开发

启动开发服务器：

```bash
npm run dev
```

## 构建和运行

1. 构建项目：

```bash
npm run build
```

2. 启动服务器：

```bash
npm start
```

运行效果，类似如下：  
```bash
$ npm run build && npm start

> yesdev-mcp-server@1.0.0 build
> tsc && chmod 755 dist/index.js

> yesdev-mcp-server@1.0.0 start
> node dist/index.js

正在注册工具...
任务工具注册成功！
YesDev MCP Server 已启动
已注册的工具: [
  'create_task',
  'get_task_detail',
  'update_task',
  'remove_task',
  'get_task_list',
  'check_task',
  'revoke_check_task',
  'ai_guess_work_hour'
]
```

## Cursor MCP 配置

在 Cursor 的配置中添加以下内容：

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
}
```

## 已实现的工具

### 1. create_task
创建新任务
- **输入参数**：
  - `task_title`: string - 任务标题
  - `staff_id`: string - 负责人ID
  - `task_desc?`: string - 任务描述（可选）
  - `task_type?`: number - 任务类型（可选）
  - `task_time?`: number - 任务工时（可选）
  - `task_finish_time?`: string - 任务截止时间（可选）
  - `plan_start_date?`: string - 计划开始时间（可选）
  - `task_status?`: number - 任务状态（可选）
  - `is_milestone?`: number - 是否里程碑（可选）
  - `not_send_email?`: number - 是否发送邮件（可选）
  - `project_id?`: number - 项目ID（可选）
  - `need_id?`: number - 需求ID（可选）
  - `problem_id?`: number - 问题ID（可选）
- **返回**：创建的任务ID

### 2. get_task_detail
获取任务详情
- **输入参数**：
  - `id`: string - 任务ID
- **返回**：任务详细信息

### 3. update_task
更新任务信息
- **输入参数**：
  - `id`: string - 任务ID
  - `title?`: string - 任务标题（可选）
  - `description?`: string - 任务描述（可选）
  - `assignee?`: string - 负责人ID（可选）
  - `status?`: number - 任务状态（可选）
  - `priority?`: number - 优先级（可选）
- **返回**：更新后的任务信息

### 4. remove_task
删除任务
- **输入参数**：
  - `id`: string - 任务ID
- **返回**：操作结果

### 5. get_task_list
获取任务列表
- **输入参数**：
  - `page?`: number - 页码（可选）
  - `page_size?`: number - 每页数量（可选）
  - `status?`: number - 任务状态（可选）
  - `assignee?`: string - 负责人ID（可选）
- **返回**：任务列表和总数

### 6. check_task
任务验收
- **输入参数**：
  - `id`: string - 任务ID
  - `comment?`: string - 验收评论（可选）
- **返回**：操作结果

### 7. revoke_check_task
撤销任务验收
- **输入参数**：
  - `id`: string - 任务ID
  - `reason?`: string - 撤销原因（可选）
- **返回**：操作结果

### 8. ai_guess_work_hour
AI预估任务工时
- **输入参数**：
  - `title`: string - 任务标题
  - `description?`: string - 任务描述（可选）
- **返回**：
  - `work_hour`: number - 预估工时
  - `confidence`: number - 预估置信度

## 相关项目

- [MCP TS-sdk](https://github.com/modelcontextprotocol/typescript-sdk)
- [YesDev API 接口文档](https://www.yesdev.cn/docs.php)
- [Model Context Protocol](https://github.com/modelcontextprotocol/modelcontextprotocol)