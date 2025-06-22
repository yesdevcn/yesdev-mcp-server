import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { yesdevAPI } from '../../yesdev/api.js';
import { configManager } from '../../yesdev/config.js';

export function registerProblemTools(server: McpServer): Set<string> {
  const registeredTools = new Set<string>();

  // 1. 获取我当前的问题
  server.registerTool(
    'get_my_problems',
    {
      title: '获取我当前的问题',
      description: '获取指派给我的、待我处理的问题列表',
      inputSchema: {},
    },
    async () => {
      try {
        const result = await yesdevAPI.getMyProblem();
        if (result.ret !== 200 || !result.data) {
          return { content: [{ type: 'text', text: `获取问题列表失败: ${result.msg || '未知错误'}` }], isError: true };
        }

        const { items = [], total = 0 } = result.data;
        if (items.length === 0) {
          return { content: [{ type: 'text', text: '你当前没有待处理的问题。' }] };
        }

        let responseText = `### 待你处理的问题 (共 ${total} 个)\n\n`;
        responseText += items.map(p => {
            const link = `https://www.yesdev.cn/platform/problem/problemDetail?id=${p.id}`;
            const status = configManager.getProblemStatusName(p.problem_status);
            const level = configManager.getProblemLevelName(p.problem_level);
            const type = configManager.getProblemTypeName(p.problem_type);
            return `- [${p.problem_title}](${link}) (问题优先级: ${level}, 状态: ${status}, 类型: ${type})`;
        }).join('\n');

        return { content: [{ type: 'text', text: responseText.trim() }] };
      } catch (error: any) {
        return { content: [{ type: 'text', text: `获取问题列表失败: ${error.message}` }], isError: true };
      }
    }
  );
  registeredTools.add('get_my_problems');

  // 2. 更新问题
  server.registerTool(
    'update_problem',
    {
      title: '更新问题',
      description: '更新问题的信息，例如状态、负责人、问题归因、问题类型、备注等',
      inputSchema: {
        id: z.number().describe('要更新的问题ID'),
        problem_title: z.string().optional().describe('新的问题标题'),
        problem_status: z.number().optional().describe('新的问题状态'),
        problem_level: z.number().optional().describe('新的问题优先级'),
        problem_type: z.number().optional().describe('新的问题类型'),
        problem_attribution: z.number().optional().describe('新的问题归因，100 代码错误 200 数据问题 300 遗留问题 400 功能遗漏 500 需求误解 600 产品设计缺陷 700 无法重现 800 误报 900 其他'),
        assign_staff_id: z.number().optional().describe('新的负责人ID'),
        note_content_remark: z.string().optional().describe('需要提交的备注信息，支持富文本，辅助信息，用于消息推送，同时添加一条备注'),
      },
    },
    async (args) => {
      try {
        await yesdevAPI.updateProblem(args);
        return { content: [{ type: 'text', text: `问题 ${args.id} 已成功更新。` }] };
      } catch (error: any) {
        return { content: [{ type: 'text', text: `更新问题失败: ${error.message}` }], isError: true };
      }
    }
  );
  registeredTools.add('update_problem');

  return registeredTools;
} 