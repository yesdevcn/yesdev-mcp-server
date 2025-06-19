import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { registerTaskTools } from './mcp/tools/task.js';
import dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

async function main() {
  try {
    // 创建 MCP Server 实例
    const server = new McpServer({
      name: 'yesdev-mcp-server',
      version: '1.0.0'
    });

    // 注册所有工具
    console.log('正在注册工具...');
    const registeredTools = new Set<string>();

    // 注册任务相关工具
    const taskTools = registerTaskTools(server);
    taskTools.forEach(tool => registeredTools.add(tool));
    console.log('任务工具注册成功！');

    // 创建标准输入输出传输实例
    const transport = new StdioServerTransport();
    
    // 连接到传输层
    await server.connect(transport);
    
    console.log('YesDev MCP Server 已启动');
    console.log('已注册的工具:', Array.from(registeredTools));

  } catch (error) {
    console.error('服务器启动失败:', error);
    process.exit(1);
  }
}

// 启动服务器
main().catch(error => {
  console.error('未捕获的错误:', error);
  process.exit(1);
}); 