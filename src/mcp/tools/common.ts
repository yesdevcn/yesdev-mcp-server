import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { yesdevAPI } from '../../yesdev/api.js';

export function registerCommonTools(server: McpServer): Set<string> {
  const registeredTools = new Set<string>();

  // 1. 搜索员工
  server.registerTool(
    'search_staff',
    {
      title: '搜索员工',
      description: '根据员工姓名或工号搜索员工信息，获取对应的员工ID',
      inputSchema: {
        keyword: z.string().optional().describe('搜索关键词，可以是姓名或工号'),
      }
    },
    async (args) => {
      try {
        const result = await yesdevAPI.searchStaff(args);
        if (result.ret !== 200 || !result.data) {
          return { content: [{ type: 'text', text: `搜索员工失败: ${result.msg || '未知错误'}` }], isError: true };
        }
        
        const { items = [] } = result.data;
        if (items.length === 0) {
          return { content: [{ type: 'text', text: '未找到相关员工。' }] };
        }

        let responseText = '### 员工列表\n\n';
        responseText += items.map(s => `- ${s.staff_name}（员工ID：${s.id}）`).join('\n');
        return { content: [{ type: 'text', text: responseText.trim() }] };

      } catch (error: any) {
        return { content: [{ type: 'text', text: `搜索员工失败: ${error.message}` }], isError: true };
      }
    }
  );
  registeredTools.add('search_staff');

  // 2. 获取工作组列表
  server.registerTool(
    'get_workgroup_list',
    {
      title: '获取工作组列表',
      description: '获取所有的工作组列表，获取对应的工作组ID',
      inputSchema: {}
    },
    async () => {
      try {
        const result = await yesdevAPI.getWorkgroupList();
        if (result.ret !== 200 || !result.data) {
          return { content: [{ type: 'text', text: `获取工作组列表失败: ${result.msg || '未知错误'}` }], isError: true };
        }
        
        const { items = [] } = result.data;
        if (items.length === 0) {
          return { content: [{ type: 'text', text: '未找到任何工作组。' }] };
        }

        let responseText = '### 工作组列表\n\n';
        responseText += items.map(w => `- ${w.workgroup_name}（工作组ID：${w.id}）`).join('\n');
        return { content: [{ type: 'text', text: responseText.trim() }] };

      } catch (error: any) {
        return { content: [{ type: 'text', text: `获取工作组列表失败: ${error.message}` }], isError: true };
      }
    }
  );
  registeredTools.add('get_workgroup_list');

  // 3. 获取我的个人资料
  server.registerTool(
    'get_my_profile',
    {
      title: '获取我的个人资料',
      description: '获取我的个人资料，以及对应的员工ID',
      inputSchema: {}
    },
    async () => {
      try {
        const result = await yesdevAPI.getMyProfile();
        if (result.ret !== 200 || !result.data) {
          return { content: [{ type: 'text', text: `获取个人资料失败: ${result.msg || '未知错误'}` }], isError: true };
        }

        const profile = result.data;
        const responseText = [
          `### 我的个人资料`,
          `**员工ID**: ${profile.staff_info.id}`,
          `**姓名**: ${profile.staff_info.staff_name}`,
          `**工号**: ${profile.staff_info.staff_no}`,
        ].join('\n');
        
        return { content: [{ type: 'text', text: responseText }] };

      } catch (error: any) {
        return { content: [{ type: 'text', text: `获取个人资料失败: ${error.message}` }], isError: true };
      }
    }
  );
  registeredTools.add('get_my_profile');


  return registeredTools;
} 