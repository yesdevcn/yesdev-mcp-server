# 🚀 YesDev MCP Server

**定位：一款专为程序员自动登记每日开发工时的开源MCP工具，可以用在Cursor、VSCode等！**  

基于 [YesDev项目管理工具](https://www.yesdev.cn/) ，进行我的任务工时的登记和AI管理。**重点解决两大矛盾**： 

 + 📌 开发工程师忙于编程没空登记工时，而项目经理需要及时的工时投入和项目进度！  
 + 📌 企业老板或管理层想看到更真实、客观的开发工时，而"总"不相信人工填充的工时！    

## ✨ 核心功能特性

- 📋 任务管理：
  - 🤖 通过聊天方式，让AI帮你（程序员）自动根据当天开发登记任务和工时；
  - 📝 快速查看和整理我当前的任务计划、待办工作清单；
- 📌 需求管理：
  - 🔍 快速查看我目前的开发需求列表；
- 🐛 缺陷管理： 
  - 🔧 快速查看我目前的Bug、工单和其他待处理的问题列表；
- 📅 日报：
  - ✍️ AI自动汇总填写上报你（程序员）当天的日报；

## 🎯 如何使用？

免费注册 [YesDev项目管理工具](https://www.yesdev.cn/) 后 [获取你的YESDEV_ACCESS_TOKEN令牌](https://www.yesdev.cn/platform/account/accountInfo)。


### ⚡ Cursor MCP 配置

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

### 💡 常用提示词

常用的提示词参考：  
 + 📝 请帮我创建一个新任务，并登记我今天的开发任务内容和工时到YesDev  
 + 📋 我今天有哪些YesDev任务？
 + 📅 帮我写日报到YesDev

## 🛠️ MCP开发

### 💻 本地开发环境要求

- Node.js >= 18.0.0
- npm 或 yarn 包管理器

## 🔧 安装

1. 克隆仓库：

```bash
git clone https://github.com/yesdevcn/yesdev-mcp-server.git
cd yesdev-mcp-server
```

2. 安装依赖：

```bash
npm install
```

## ⚙️ 配置

1. 创建 `.env` 文件：

```bash
cp .env.example .env
```

2. 配置环境变量：

```env
# 获取方式：https://www.yesdev.cn/platform/account/accountInfo
YESDEV_ACCESS_TOKEN=填写你自己的令牌
```

## 🚀 开发

启动开发服务器：

```bash
npm run dev
```

## 📦 构建和运行

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

## 🛠️ 已实现的工具

你可以根据自己、团队和公司的需要，结合[YesDev API 接口文档](https://www.yesdev.cn/docs.php) 800+ 在线API接口，扩展更多任务工时及项目管理MCP工具。  

已实现的工具有：  

 + ➕ create_task 创建新任务
 + 🔍 get_task_detail 获取任务详情
 + 📝 update_task 更新任务信息
 + 🗑️ remove_task 删除任务
 + 📋 get_task_list 获取任务列表

## 🔗 相关项目

- 📦 [MCP TS-sdk](https://github.com/modelcontextprotocol/typescript-sdk)
- 📚 [Model Context Protocol](https://github.com/modelcontextprotocol/modelcontextprotocol)
- 📚 [For Server Developers - TS](https://modelcontextprotocol.io/quickstart/server#node)
- 🌟 [Awesome-MCP-ZH](https://github.com/yzfly/Awesome-MCP-ZH)
