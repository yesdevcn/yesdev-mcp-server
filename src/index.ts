import express, { Request, Response, RequestHandler } from 'express';
import dotenv from 'dotenv';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { yesdevAPI } from './yesdev/api.js';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

const app = express();
app.use(express.json());

// 创建 MCP Server 实例
const server = new McpServer({
  name: 'yesdev-mcp-server',
  version: '1.0.0'
});

// 存储活跃的传输实例
const transports: { [sessionId: string]: StreamableHTTPServerTransport } = {};

// 存储注册的工具
const registeredTools = new Set<string>();

// 注册任务相关工具
console.log('正在注册 create_task 工具...');
server.registerTool(
  'create_task',
  {
    title: '创建任务',
    description: '创建一个新任务',
    inputSchema: {
      title: z.string().describe('任务标题'),
      assignee: z.string().describe('负责人ID')
    }
  },
  async (args: { title: string; assignee: string }) => {
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
registeredTools.add('create_task');
console.log('create_task 工具注册成功！');

// MCP 路由处理
const handleMcpRequest: RequestHandler = async (req, res, next) => {
  try {
    // 检查是否是初始化请求
    const isInitRequest = req.body && req.body.method === 'initialize';
    
    // 获取会话 ID
    let sessionId = req.headers['mcp-session-id'] as string;
    
    if (isInitRequest) {
      // 对于初始化请求，生成新的会话 ID
      sessionId = uuidv4();
      res.setHeader('Mcp-Session-Id', sessionId);
      console.log(`收到初始化请求，生成新的会话 ID: ${sessionId}`);
    } else if (!sessionId || !transports[sessionId]) {
      // 对于非初始化请求，如果没有有效的会话 ID，返回错误
      console.log(`无效的会话 ID: ${sessionId}`);
      res.status(400).json({
        jsonrpc: '2.0',
        error: {
          code: -32000,
          message: 'Invalid or missing session ID'
        },
        id: req.body?.id
      });
      return;
    }
    
    // 获取或创建传输实例
    let transport = transports[sessionId];
    if (!transport) {
      console.log(`为会话 ${sessionId} 创建新的传输实例`);
      transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: () => sessionId
      });
      transport.sessionId = sessionId;
      
      // 存储传输实例
      transports[sessionId] = transport;
      
      // 连接到 MCP 服务器
      await server.connect(transport);
      console.log(`传输实例已连接到 MCP 服务器`);
      
      // 设置清理处理程序
      transport.onclose = () => {
        console.log(`会话 ${sessionId} 已关闭`);
        delete transports[sessionId];
      };
    }
    
    // 处理请求
    console.log(`处理来自会话 ${sessionId} 的请求:`, req.body);
    await transport.handleRequest(req, res);
  } catch (error) {
    console.error('MCP connection error:', error);
    if (!res.headersSent) {
      res.status(500).json({
        jsonrpc: '2.0',
        error: {
          code: -32603,
          message: 'Internal server error'
        },
        id: req.body?.id
      });
    }
    next(error);
  }
};

// 处理会话终止
const handleMcpDelete: RequestHandler = (req, res) => {
  const sessionId = req.headers['mcp-session-id'] as string;
  if (sessionId && transports[sessionId]) {
    const transport = transports[sessionId];
    transport.close();
    delete transports[sessionId];
    console.log(`会话 ${sessionId} 已终止`);
    res.status(204).end();
  } else {
    console.log(`尝试终止不存在的会话: ${sessionId}`);
    res.status(404).json({
      jsonrpc: '2.0',
      error: {
        code: -32000,
        message: 'Session not found'
      },
      id: null
    });
  }
};

// 注册路由处理程序
app.all('/mcp', handleMcpRequest);
app.delete('/mcp', handleMcpDelete);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`YesDev MCP Server running at http://localhost:${PORT}/mcp`);
  console.log('已注册的工具:', Array.from(registeredTools));
}); 