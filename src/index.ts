import express from 'express';
import dotenv from 'dotenv';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { yesdevAPI } from './yesdev/api.js';
import { z } from 'zod';

dotenv.config();

const app = express();
app.use(express.json());

// 创建 MCP Server 实例
const server = new McpServer({
  name: 'yesdev-mcp-server',
  version: '1.0.0',
  capabilities: ['tools']
});

// 注册任务相关工具
server.registerTool(
  'create_task',
  {
    title: '创建任务',
    description: '创建一个新任务',
    schema: z.object({
      title: z.string().describe('任务标题'),
      assignee: z.string().describe('负责人ID')
    })
  },
  async (args) => {
    try {
      const result = await yesdevAPI.createTask({
        task_title: args.title,
        staff_id: args.assignee
      });
      
      return {
        content: [{
          type: 'text',
          text: `成功创建任务，ID: ${result.id}`
        }]
      };
    } catch (error: any) {
      return {
        content: [{
          type: 'text',
          text: `创建任务失败: ${error.message}`
        }],
        isError: true
      };
    }
  }
);

// 存储活跃的传输实例
const transports: Record<string, StreamableHTTPServerTransport> = {};

// MCP 路由
app.all('/mcp', async (req, res) => {
  const transport = new StreamableHTTPServerTransport(req, res, '/mcp');

  try {
    await server.connect(transport);
  } catch (error) {
    console.error('MCP connection error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`YesDev MCP Server running at http://localhost:${PORT}/mcp`);
}); 