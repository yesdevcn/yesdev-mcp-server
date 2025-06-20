import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { yesdevAPI } from '../../yesdev/api.js';
import { configManager } from '../../yesdev/config.js';

export function registerProjectTools(server: McpServer): Set<string> {
  const registeredTools = new Set<string>();

  // 1. 获取我的项目列表
  server.registerTool(
    'get_my_project_list',
    {
      title: '获取我的项目列表',
      description: '获取我参与的、正在进行的项目列表',
      inputSchema: {}
    },
    async () => {
      try {
        const result = await yesdevAPI.getMyProjectList();

        if (result.ret !== 200 || !result.data) {
          return {
            content: [{
              type: 'text',
              text: `获取我的项目列表失败: ${result.msg || '返回数据格式不正确'}`
            }],
            isError: true
          };
        }
        
        const { items = [] } = result.data;
        if (items.length === 0) {
            return {
                content: [{ type: 'text', text: '你当前没有参与任何进行中的项目。' }]
            };
        }

        let responseText = '### 🚀 你的项目列表\n\n';

        responseText += items.map(p => `- [${p.id}] ${p.project_name}`).join('\n');

        return {
          content: [{
            type: 'text',
            text: responseText.trim()
          }]
        };
      } catch (error: any) {
        return {
          content: [{
            type: 'text',
            text: `获取我的项目列表失败: ${error.message}`
          }],
          isError: true
        };
      }
    }
  );
  registeredTools.add('get_my_project_list');

  // 2. 获取项目详情
  server.registerTool(
    'get_project_detail',
    {
        title: '获取项目详情',
        description: '获取指定ID的项目的详细信息',
        inputSchema: {
            id: z.number().describe('项目ID'),
        }
    },
    async (args: { id: number }) => {
        try {
            const result = await yesdevAPI.getProjectDetail(args);

            if (result.ret !== 200 || !result.data) {
                return {
                    content: [{ type: 'text', text: `获取项目详情失败: ${result.msg || '未知错误'}` }],
                    isError: true,
                };
            }
 
            const project = result.data;
            const link = `https://www.yesdev.cn/platform/#/project/project-detail?id=${project.id}`;
 
            const responseText = [
                `### 项目详情: ${project.project_name}`,
                `**ID**: ${project.id}`,
                `**负责人**: ${project.charge_staff_name}`,
                `**状态**: ${configManager.getProjectStatusName(project.project_status)}`,
                `**开始日期**: ${project.project_start_time || '未设置'}`,
                `**结束日期**: ${project.project_end_time || '未设置'}`,
                `**描述**: ${project.project_desc || '无'}`,
                `\n[在YesDev中查看项目](${link})`
            ].join('\n');

            return { content: [{ type: 'text', text: responseText }] };
        } catch (error: any) {
            return {
                content: [{ type: 'text', text: `获取项目详情失败: ${error.message}` }],
                isError: true,
            };
        }
    }
  );
  registeredTools.add('get_project_detail');

  // 3. 更新项目
  server.registerTool(
    'update_project',
    {
        title: '更新项目',
        description: '局部更新指定ID的项目的信息',
        inputSchema: {
            id: z.number().describe('要更新的项目ID'),
            project_name: z.string().optional().describe('新的项目名称'),
            project_desc: z.string().optional().describe('新的项目描述'),
            charge_staff_id: z.number().optional().describe('新的项目负责人ID'),
            project_status: z.number().optional().describe('新的项目状态'),
            project_start_time: z.string().optional().describe('新的计划开始时间 (YYYY-MM-DD)'),
            project_end_time: z.string().optional().describe('新的计划完成时间 (YYYY-MM-DD)'),
        }
    },
    async (args: { 
        id: number;
        project_name?: string;
        project_desc?: string;
        charge_staff_id?: number;
        project_status?: number;
        project_start_time?: string;
        project_end_time?: string;
    }) => {
        try {
            const result = await yesdevAPI.updateProject(args);
            if (result.ret !== 200) {
                 return {
                    content: [{ type: 'text', text: `更新项目失败: ${result.msg || '未知错误'}` }],
                    isError: true,
                };
            }
            return { content: [{ type: 'text', text: `项目 ${args.id} 更新成功！` }] };
        } catch (error: any) {
            return {
                content: [{ type: 'text', text: `更新项目失败: ${error.message}` }],
                isError: true,
            };
        }
    }
  );
  registeredTools.add('update_project');


  return registeredTools;
} 