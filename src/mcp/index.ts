import { Router } from 'express';
import { mcpTaskRouter } from './tools/task.js';

const router = Router();

// MCP 工具 discovery 列表
const tools = [
  {
    id: 'create_task',
    name: 'create_task',
    description: '创建一个新任务',
    path: '/mcp/task/create',
    method: 'POST',
    parameters: {
      title: { type: 'string', required: true, description: '任务标题' },
      assignee: { type: 'string', required: true, description: '负责人ID' }
      // 可继续补充参数
    }
  }
  // 未来可扩展更多工具
];

// discovery 路由
router.get('/', (req, res) => {
  res.json({ tools });
});

router.get('/tools', (req, res) => {
  res.json({ tools });
});

router.use('/task', mcpTaskRouter);

export default router; 