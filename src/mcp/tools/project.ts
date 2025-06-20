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
        const result = await yesdevAPI.getMyProjectList({ is_merge_project_set: 0 });

        if (result.ret !== 200 || !result.data) {
          return {
            content: [{
              type: 'text',
              text: `获取我的项目列表失败: ${result.msg || '返回数据格式不正确'}`
            }],
            isError: true
          };
        }
        
        const { project_list = [] } = result.data;
        if (project_list.length === 0) {
            return {
                content: [{ type: 'text', text: '你当前没有参与任何进行中的项目。' }]
            };
        }

        let responseText = '### 🚀 你的项目列表\n\n';

        responseText += project_list.filter(p => p.workgroup_id >= 0).map(p => {
          const link = `https://www.yesdev.cn/platform/project/projects-detail?id=${p.id}`;
          return `- [${p.project_name}](${link})`;
        }).join('\n');

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
        description: '获取指定项目ID的项目详细信息',
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
            const link = `https://www.yesdev.cn/platform/project/projects-detail?id=${project.id}`;

            const statStr = `项目进度: ${project.nav_count.project_percent}%、需求：${project.nav_count.done_need_nums}/${project.nav_count.need_nums}个、任务：${project.nav_count.done_task_nums}/${project.nav_count.task_nums}个、问题：${project.nav_count.done_problem_nums}/${project.nav_count.problem_nums}个`;
 
            const responseText = [
                `### 项目详情: ${project.project_name}`,
                `**项目ID**: ${project.id}`,
                `**负责人**: ${project.charge_staff_name}`,
                `**创建人**: ${project.created_staff_name}`,
                `**创建时间**: ${project.add_time}`,
                `**项目状态**: ${configManager.getProjectStatusName(project.project_status)}`,
                `**开始日期**: ${project.project_start_time || '未设置'}`,
                `**结束日期**: ${project.project_end_time || '未设置'}`,
                `**项目统计**: ${statStr}`,
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

  // 3. 更新项目 - 局部
  server.registerTool(
    'update_project',
    {
        title: '更新项目',
        description: '局部更新指定ID的项目的信息，仅支持更新项目名称、项目描述、项目负责人、项目背景颜色',
        inputSchema: {
            id: z.number().describe('要更新的项目ID'),
            project_name: z.string().optional().describe('新的项目名称'),
            project_desc: z.string().optional().describe('新的项目描述，使用HTML格式'),
            project_bg_color: z.string().optional().describe('项目背景颜色，使用#FFFFFF格式'),
        }
    },
    async (args: { 
        id: number;
        project_name?: string;
        project_desc?: string;
        project_bg_color?: string;
    }) => {
        try {
            const result = await yesdevAPI.updateProjectPart(args);
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

  // 4. 创建新项目
  server.registerTool(
    'create_project',
    {
        title: '创建新项目',
        description: '创建一个新的YesDev项目',
        inputSchema: {
            project_name: z.string().describe('项目名称'),
            project_desc: z.string().optional().describe('项目描述，使用HTML格式'),
            charge_staff_id: z.number().optional().describe('项目负责人ID'),
            workgroup_id: z.number().optional().describe('工作组ID'),
            project_start_time: z.string().optional().describe('项目计划开始时间 (YYYY-MM-DD)'),
            project_end_time: z.string().optional().describe('项目计划完成时间 (YYYY-MM-DD)'),
            project_status: z.number().optional().default(0).describe('项目状态，0规划中1进行中2已完成3挂起'),
            project_level_type: z.number().optional().describe('项目级别类型：0-个人项目；1-公司项目'),
            project_bg_color: z.string().optional().describe('项目背景颜色，使用#FFFFFF格式'),
            from_channel: z.string().optional().describe('来源渠道，默认mcp'),
        }
    },
    async (args) => {
        try {
          // 默认计划开始时间
          if (!args.project_start_time) {
            args.project_start_time = new Date().toISOString().split('T')[0];
          }
          // 默认项目级别类型
          if (!args.project_level_type && args.project_level_type !== 0) {
            args.project_level_type = 1;
          }
          args.project_desc = `<p><br>项目创建来自MCP工具</p>`;
          
          args.from_channel = 'mcp';
          
          const result = await yesdevAPI.createProject(args);
          if (result.ret !== 200 || !result.data) {
                return {
                  content: [{ type: 'text', text: `创建项目失败: ${result.msg || '未知错误'}` }],
                  isError: true,
              };
          }
          return { content: [{ type: 'text', text: `新项目已成功创建，项目ID是 ${result.data.id}` }] };
        } catch (error: any) {
            return {
                content: [{ type: 'text', text: `创建项目失败: ${error.message}` }],
                isError: true,
            };
        }
    }
  );
  registeredTools.add('create_project');

  // 5. 更新项目状态
  server.registerTool(
    'update_project_status',
    {
        title: '更新项目状态',
        description: '更新指定ID的项目的状态',
        inputSchema: {
            id: z.number().describe('项目ID'),
            project_status: z.number().describe('新的项目状态，0新项目1进行中2已完成3挂起'),
        }
    },
    async (args) => {
        try {
            const result = await yesdevAPI.updateProjectStatus(args);
            if (result.ret !== 200) {
                 return {
                    content: [{ type: 'text', text: `更新项目状态失败: ${result.msg || '未知错误'}` }],
                    isError: true,
                };
            }
            return { content: [{ type: 'text', text: `项目 ${args.id} 的状态已更新成功！` }] };
        } catch (error: any) {
            return {
                content: [{ type: 'text', text: `更新项目状态失败: ${error.message}` }],
                isError: true,
            };
        }
    }
  );
  registeredTools.add('update_project_status');

  // 6. 更新项目时间
  server.registerTool(
    'update_project_time',
    {
        title: '更新项目时间',
        description: '更新指定ID的项目的计划开始和结束时间',
        inputSchema: {
            id: z.number().describe('项目ID'),
            project_start_time: z.string().describe('新的计划开始时间 (YYYY-MM-DD)'),
            project_end_time: z.string().describe('新的计划完成时间 (YYYY-MM-DD)'),
        }
    },
    async (args) => {
        try {
            const result = await yesdevAPI.updateProjectTime(args);
            if (result.ret !== 200) {
                 return {
                    content: [{ type: 'text', text: `更新项目时间失败: ${result.msg || '未知错误'}` }],
                    isError: true,
                };
            }
            return { content: [{ type: 'text', text: `项目 ${args.id} 的时间已更新成功！` }] };
        } catch (error: any) {
            return {
                content: [{ type: 'text', text: `更新项目时间失败: ${error.message}` }],
                isError: true,
            };
        }
    }
  );
  registeredTools.add('update_project_time');
  
  // 7. 获取全部项目列表
  server.registerTool(
    'get_project_list',
    {
        title: '获取全部项目列表',
        description: '获取全部项目列表，支持筛选、搜索、排序',
        inputSchema: {
            id: z.number().optional().describe('项目ID'),
            project_name: z.string().optional().describe('项目名称关键字'),
            charge_staff_name: z.string().optional().describe('项目负责人名称'),
            project_status: z.string().optional().describe('项目状态，多个用逗号隔开，0规划中1进行中2已完成3挂起'),
            page: z.number().optional().default(1).describe('页码，默认1'),
            perpage: z.number().optional().default(20).describe('每页数量，默认20'),
            order_status: z.number().optional().default(0).describe('排序方式：0 开始时间，1完成时间 2状态 3项目总工时 4最后更新 5创建时间 6项目进度'),
            order_status_sort: z.number().optional().default(0).describe('排序顺序，0降序1升序'),
            project_start_time: z.string().optional().describe('项目计划开始时间，格式：YYYY-MM-DD'),
            project_end_time: z.string().optional().describe('项目计划完成时间，格式：YYYY-MM-DD'),
            charge_staff_id: z.string().optional().describe('项目负责人ID，多个使用英文逗号分隔'),
        }
    },
    async (args) => {
        try {
            const result = await yesdevAPI.getProjectList(args);
            if (result.ret !== 200 || !result.data) {
                 return {
                    content: [{ type: 'text', text: `获取项目列表失败: ${result.msg || '未知错误'}` }],
                    isError: true,
                };
            }

            const { projects = [], total = 0 } = result.data;
            if (projects.length === 0) {
                return { content: [{ type: 'text', text: '未查询到任何项目。' }] };
            }

            let responseText = `### 项目列表 (共 ${total} 个)\n\n`;
            responseText += projects.map(p => {
                const status = configManager.getProjectStatusName(p.project_status);
                const link = `https://www.yesdev.cn/platform/project/projects-detail?id=${p.id}`;
                return `- [${p.project_name}](${link}) (负责人: ${p.charge_staff_name}, 状态: ${status})`;
            }).join('\n');

            return { content: [{ type: 'text', text: responseText.trim() }] };

        } catch (error: any) {
            return {
                content: [{ type: 'text', text: `获取项目列表失败: ${error.message}` }],
                isError: true,
            };
        }
    }
  );
  registeredTools.add('get_project_list');

  return registeredTools;
} 