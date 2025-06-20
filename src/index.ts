import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { registerTaskTools } from './mcp/tools/task.js';
import { registerProjectTools } from './mcp/tools/project.js';
import { registerCommonTools } from './mcp/tools/common.js';
import dotenv from 'dotenv';
import { configManager } from './yesdev/config.js';

// 加载环境变量
dotenv.config();

async function main() {
  try {
    // 初始化 YesDev 全局配置
    await configManager.initialize();

    const server = new McpServer({
        name: 'yesdev-mcp-server',
        version: '1.0.0',
    });
    
    console.log('正在注册工具...');
    const taskTools = registerTaskTools(server);
    const projectTools = registerProjectTools(server);
    const commonTools = registerCommonTools(server);
    const allTools = new Set([...taskTools, ...projectTools, ...commonTools]);

    const transport = new StdioServerTransport();
    server.connect(transport);
    
    console.log('YesDev MCP Server 已启动');
    console.log('已注册的工具:', Array.from(allTools));

  } catch (error) {
    console.error('服务启动失败:', error);
  }
}

main(); 