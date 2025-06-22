import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { yesdevAPI } from '../../yesdev/api.js';

export function registerDailyReportTools(server: McpServer): Set<string> {
  const registeredTools = new Set<string>();

  server.registerTool(
    'submit_daily_report',
    {
      title: '提交日报',
      description: '提交或更新当天的日报内容',
      inputSchema: {
        content: z.string().describe('日报内容，使用HTML格式。参考模板：已完成xxxx，未完成xxxx，下一步计划xxxx。'),
        title: z.string().optional().describe('日报标题，如果未提供，则默认为当天的日期。'),
        daily_time: z.string().optional().describe('日报日期，格式为 YYYY-MM-DD。如果未提供，则默认为今天。'),
      },
    },
    async (args) => {
      try {
        const dailyTime = args.daily_time || new Date().toISOString().split('T')[0];
        
        const params = {
            daily_time: dailyTime,
            content: args.content.replace('\n', '<br>'),
            title: args.title || `日报 - ${dailyTime}`,
        };

        const result = await yesdevAPI.addOrUpdateDaily(params);

        if (result.ret !== 200 || !result.data) {
          return {
            content: [{ type: 'text', text: `提交日报失败: ${result.msg || '未知错误'}` }],
            isError: true,
          };
        }

        const message = result.data.is_update
          ? `成功更新了 ${dailyTime} 的日报。`
          : `成功提交了 ${dailyTime} 的新日报。`;

        return { content: [{ type: 'text', text: message }] };
      } catch (error: any) {
        return {
          content: [{ type: 'text', text: `提交日报失败: ${error.message}` }],
          isError: true,
        };
      }
    }
  );
  registeredTools.add('submit_daily_report');

  return registeredTools;
} 