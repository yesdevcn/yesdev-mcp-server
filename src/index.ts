#!/usr/bin/env node
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { registerTaskTools } from './mcp/tools/task.js';
import { registerProjectTools } from './mcp/tools/project.js';
import { registerCommonTools } from './mcp/tools/common.js';
import { registerNeedTools } from './mcp/tools/need.js';
import { registerDailyReportTools } from './mcp/tools/daily.js';
import { registerProblemTools } from './mcp/tools/problem.js';
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
    const registeredToolNames = new Set<string>();

    const toolsets = [
      registerCommonTools,
      registerTaskTools,
      registerProjectTools,
      registerNeedTools,
      registerDailyReportTools,
      registerProblemTools,
    ];

    const allTools = new Set<any>();

    toolsets.forEach(registerToolset => {
      const tools = registerToolset(server);
      tools.forEach(toolName => {
        registeredToolNames.add(toolName);
      });
    });

    const transport = new StdioServerTransport();
    server.connect(transport);
    
    console.log('YesDev MCP Server 已启动');
    console.log('已注册的工具:', Array.from(registeredToolNames));

  } catch (error) {
    console.error('服务启动失败:', error);
  }
}

main(); 