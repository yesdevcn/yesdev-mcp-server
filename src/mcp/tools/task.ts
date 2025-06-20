import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { yesdevAPI } from '../../yesdev/api.js';
import { configManager } from '../../yesdev/config.js';

// 任务相关的工具注册函数
export function registerTaskTools(server: McpServer): Set<string> {
  const registeredTools = new Set<string>();

  // 1. 创建任务
  server.registerTool(
    'create_task',
    {
      title: '创建任务',
      description: '创建一个新的YesDev任务',
      inputSchema: {
        task_title: z.string().max(200).describe('任务标题，长度不超过200字符'),
        staff_id: z.string().optional().describe('负责人ID，多个用英文逗号隔开，不传则使用当前用户'),
        task_desc: z.string().optional().describe('任务描述，采用HTML格式'),
        task_finish_time: z.string().optional().describe('任务计划完成时间，格式：YYYY-MM-DD'),
        plan_start_date: z.string().optional().describe('计划开始时间，格式：YYYY-MM-DD'),
        task_type: z.number().optional().default(3).describe('任务类型，0其他1UI设计2产品原型3技术开发4测试5会议6编写文档7调研8沟通'),
        task_time: z.number().optional().describe('任务工时，单位：小时，保留一位小数，单个任务工时推荐不超4小时，如果任务工时超过8小时，请拆分成多个任务'),
        project_id: z.number().optional().describe('项目ID'),
        need_id: z.number().optional().describe('需求ID'),
        problem_id: z.number().optional().describe('问题ID'),
        task_status: z.number().optional().default(600).describe('任务状态，600待办、1500进行中、2000已完成'),
        not_send_email: z.number().optional().describe('是否发送邮件，1是0否'),
        is_milestone: z.number().optional().describe('是否里程碑，1是0否'),
      }
    },
    async (args: { task_title: string; staff_id?: string; task_desc?: string; task_finish_time?: string; plan_start_date?: string; task_type?: number; task_time?: number; project_id?: number; need_id?: number; task_status?: number; not_send_email?: number; problem_id?: number; is_milestone?: number, from_channel?: string }) => {
      try {
        // 计划开始时间 默认为今天，格式：YYYY-MM-DD
        if (!args.plan_start_date) {
          args.plan_start_date = new Date().toISOString().split('T')[0];
        }
        // 任务计划完成时间 默认为今天，格式：YYYY-MM-DD
        if (!args.task_finish_time) {
          args.task_finish_time = new Date().toISOString().split('T')[0];
        }
        // 任务描述拼接
        if (args.task_desc) {
          args.task_desc += `<p><br>任务创建来自MCP工具</p>`;
        }
        args.from_channel = 'mcp';

        const result = await yesdevAPI.createTask(args);
        return {
          content: [{
            type: 'text',
            text: `成功创建任务，ID: ${result.data.id}`
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

  // 2. 获取任务详情
  server.registerTool(
    'get_task_detail',
    {
      title: '获取任务详情',
      description: '获取指定任务的详细信息',
      inputSchema: {
        id: z.string().describe('任务ID')
      }
    },
    async (args: { id: string }) => {
      try {
        const result = await yesdevAPI.getTaskDetail({ id: Number(args.id) });

        if (result.ret !== 200 || !result.data) {
          return {
            content: [{
              type: 'text',
              text: `获取任务详情失败: ${result.msg || '返回数据格式不正确'}`
            }],
            isError: true
          };
        }

        const taskData = result.data;

        const status = configManager.getTaskStatusName(taskData.task_status);

        const link = `https://www.yesdev.cn/platform/task/task-detail?id=${taskData.id}`;

        const description = (taskData.task_desc || '无').replace(/<p>|<br>|<\/p>/g, '');

        const formattedLines = [
            `### 任务详情: ${taskData.task_title}`,
            '',
            `**任务ID**: ${taskData.id}`,
            `**状态**: ${status} (${taskData.check_status_name})`,
            `**负责人**: ${taskData.staff_name || '未分配'}`,
            `**创建人**: ${taskData.created_staff_name || '未知'}`,
            `**创建时间**: ${taskData.add_time}`,
            `**最后更新时间**: ${taskData.sys_update_time}`,
            '',
            `**预计工时**: ${taskData.task_time || 0} 小时`,
            `**实际工时**: ${taskData.real_task_time || 0} 小时`,
            `**计划开始**: ${taskData.plan_start_date || '未设置'}`,
            `**计划结束**: ${taskData.task_finish_time || '未设置'}`,
            `**实际完成**: ${taskData.actual_finish_date || '未完成'}`,
            '',
            '**任务描述**:',
            '```',
            description,
            '```',
            '',
            `[在YesDev中查看任务详情](${link})`
        ];
        
        const formattedText = formattedLines.join('\n');

        return {
          content: [{
            type: 'text',
            text: formattedText
          }]
        };
      } catch (error: any) {
        return {
          content: [{
            type: 'text',
            text: `获取任务详情失败: ${error.message}`
          }],
          isError: true
        };
      }
    }
  );
  registeredTools.add('get_task_detail');

  // 3. 更新任务
  server.registerTool(
    'update_task',
    {
      title: '更新任务',
      description: '更新任务的信息，支持局部更新',
      inputSchema: {
        id: z.string().describe('要更新的任务ID'),
        task_title: z.string().optional().describe('新的任务标题'),
        task_desc: z.string().optional().describe('新的任务描述'),
        staff_id: z.string().optional().describe('新的负责人ID'),
        task_time: z.number().optional().describe('新的评估工时（小时）'),
        plan_start_date: z.string().optional().describe('新的计划开始时间 (YYYY-MM-DD)'),
        task_finish_time: z.string().optional().describe('新的计划完成时间 (YYYY-MM-DD)'),
        task_status: z.number().optional().describe('新的任务状态'),
        task_type: z.number().optional().describe('新的任务类型'),
        project_id: z.number().optional().describe('新的关联项目ID'),
        need_id: z.number().optional().describe('新的关联需求ID'),
        problem_id: z.number().optional().describe('新的关联问题ID'),
        task_parent_id: z.number().optional().describe('新的父任务ID'),
        is_milestone: z.number().optional().describe('是否设置为里程碑 (1是, 0否)'),
        real_task_time: z.string().optional().describe('新的实际工时，单位：小时')
      }
    },
    async (args: { 
      id: string;
      task_title?: string;
      task_desc?: string;
      staff_id?: string;
      task_time?: number;
      plan_start_date?: string;
      task_finish_time?: string;
      task_status?: number;
      task_type?: number;
      project_id?: number;
      need_id?: number;
      problem_id?: number;
      task_parent_id?: number;
      is_milestone?: number;
      real_task_time?: string;
    }) => {
      try {
        await yesdevAPI.updateTask(args);
        return {
          content: [{
            type: 'text',
            text: `成功更新任务 ${args.id}`
          }]
        };
      } catch (error: any) {
        return {
          content: [{
            type: 'text',
            text: `更新任务失败: ${error.message}`
          }],
          isError: true
        };
      }
    }
  );
  registeredTools.add('update_task');

  // 4. 删除任务
  server.registerTool(
    'remove_task',
    {
      title: '删除任务',
      description: '删除指定的任务',
      inputSchema: {
        id: z.string().describe('任务ID')
      }
    },
    async (args: { id: string }) => {
      try {
        await yesdevAPI.removeTask({ id: Number(args.id) });
        return {
          content: [{
            type: 'text',
            text: `成功删除任务 ${args.id}`
          }]
        };
      } catch (error: any) {
        return {
          content: [{
            type: 'text',
            text: `删除任务失败: ${error.message}`
          }],
          isError: true
        };
      }
    }
  );
  registeredTools.add('remove_task');

  // 5. 查询全部任务列表
  server.registerTool(
    'query_tasks',
    {
      title: '查询任务列表',
      description: '根据多种条件查询任务列表',
      inputSchema: {
        staff_ids: z.string().optional().describe('负责人ID，多个用逗号隔开'),
        project_id: z.number().optional().describe('项目ID'),
        task_status: z.number().optional().describe('任务状态'),
        start_time: z.string().optional().describe('创建时间范围-开始 (YYYY-MM-DD)'),
        end_time: z.string().optional().describe('创建时间范围-结束 (YYYY-MM-DD)'),
        start_task_finish_time: z.string().optional().describe('计划完成时间范围-开始 (YYYY-MM-DD)'),
        end_task_finish_time: z.string().optional().describe('计划完成时间范围-结束 (YYYY-MM-DD)'),
        page: z.number().optional().describe('页码，默认为 1'),
        perpage: z.number().optional().describe('每页数量，默认为 20'),
        created_staff_ids: z.string().optional().describe('创建人ID，多个用逗号隔开'),
        order_status: z.string().optional().describe('排序字段'),
        order_status_sort: z.string().optional().describe('排序方式 (asc/desc)'),
        task_keyword: z.string().optional().describe('关键词，用于搜索任务标题'),
        task_id: z.string().optional().describe('任务ID，多个用逗号隔开'),
        work_group_id: z.string().optional().describe('工作组ID'),
        need_id: z.string().optional().describe('需求ID'),
        problem_id: z.string().optional().describe('问题ID'),
        task_type: z.string().optional().describe('任务类型'),
        start_task_time: z.string().optional().describe('评估工时范围-开始'),
        end_task_time: z.string().optional().describe('评估工时范围-结束'),
        task_parent_id: z.string().optional().describe('父任务ID'),
        is_milestone: z.string().optional().describe('是否里程碑 (1是, 0否)'),
        start_plan_start_date: z.string().optional().describe('计划开始时间范围-开始 (YYYY-MM-DD)'),
        end_plan_start_date: z.string().optional().describe('计划开始时间范围-结束 (YYYY-MM-DD)'),
        start_actual_finish_date: z.string().optional().describe('实际完成时间范围-开始 (YYYY-MM-DD)'),
        end_actual_finish_date: z.string().optional().describe('实际完成时间范围-结束 (YYYY-MM-DD)'),
      }
    },
    async (args: {
      staff_ids?: string;
      project_id?: number;
      task_status?: number;
      start_time?: string;
      end_time?: string;
      start_task_finish_time?: string;
      end_task_finish_time?: string;
      page?: number;
      perpage?: number;
      created_staff_ids?: string;
      order_status?: string;
      order_status_sort?: string;
      task_keyword?: string;
      task_id?: string;
      work_group_id?: string;
      need_id?: string;
      problem_id?: string;
      task_type?: string;
      start_task_time?: string;
      end_task_time?: string;
      task_parent_id?: string;
      is_milestone?: string;
      start_plan_start_date?: string;
      end_plan_start_date?: string;
      start_actual_finish_date?: string;
      end_actual_finish_date?: string;
      is_merge_project_set?: number;
    }) => {
      try {
        const result = await yesdevAPI.queryTasks({
          ...args,
          page: args.page || 1,
          perpage: args.perpage || 20,
        });

        if (result.ret !== 200 || !result.data) {
          return {
            content: [{
              type: 'text',
              text: `查询任务列表失败: ${result.msg || '返回数据格式不正确'}`
            }],
            isError: true
          };
        }

        const { items, total } = result.data;
        if (!items || items.length === 0) {
          return {
            content: [{ type: 'text', text: '未查询到任何任务。' }]
          };
        }

        const taskLines = items.map(task => {
          const statusName = configManager.getTaskStatusName(task.task_status);
          const link = `https://www.yesdev.cn/platform/task/task-detail?id=${task.id}`;
          return `- [${statusName}] [${task.task_title}](${link}) (负责人: ${task.staff_name || 'N/A'})`;
        });

        const responseText = [
          `### 任务查询结果 (共 ${total} 条)`,
          ...taskLines,
        ].join('\n');

        return {
          content: [{
            type: 'text',
            text: responseText
          }]
        };
      } catch (error: any) {
        return {
          content: [{
            type: 'text',
            text: `查询任务列表失败: ${error.message}`
          }],
          isError: true
        };
      }
    }
  );
  registeredTools.add('query_tasks');

  // 6. 获取我的待办任务列表
  server.registerTool(
    'get_my_task_list',
    {
      title: '获取我的待办任务',
      description: '获取我当前负责的、未完成的任务列表',
      inputSchema: {}
    },
    async () => {
      try {
        const result = await yesdevAPI.getMyTaskList();

        if (result.ret !== 200 || !result.data) {
          return {
            content: [{
              type: 'text',
              text: `获取我的任务列表失败: ${result.msg || '返回数据格式不正确'}`
            }],
            isError: true
          };
        }

        const { task_list } = result.data;
        if (!task_list || task_list.length === 0) {
          return {
            content: [{ type: 'text', text: '太棒了！你当前没有待办任务。' }]
          };
        }

        const taskLines = task_list.map(task => {
          const statusName = configManager.getTaskStatusName(task.task_status);
          const link = `https://www.yesdev.cn/platform/task/task-detail?id=${task.id}`;
          return `- [${statusName}] [${task.task_title}](${link})`;
        });

        const responseText = [
          `### 📝 你的待办任务`,
          ...taskLines,
        ].join('\n');

        return {
          content: [{
            type: 'text',
            text: responseText
          }]
        };
      } catch (error: any) {
        return {
          content: [{
            type: 'text',
            text: `获取我的任务列表失败: ${error.message}`
          }],
          isError: true
        };
      }
    }
  );
  registeredTools.add('get_my_task_list');

  // 7. 获取项目任务列表
  server.registerTool(
    'get_project_task_list',
    {
      title: '获取项目任务列表',
      description: '获取指定项目的任务列表',
      inputSchema: {
        project_id: z.number().describe('项目ID'),
        task_status: z.string().optional().describe('任务状态，多个用英文逗号分割'),
        is_milestone: z.string().optional().describe('是否里程碑 (1是, 0否)'),
        page: z.number().optional().default(1).describe('页码，默认为 1'),
        perpage: z.number().optional().default(20).describe('每页数量，默认为 20')
      }
    },
    async (args: {
      project_id: number;
      task_status?: string;
      is_milestone?: string;
      page?: number;
      perpage?: number;
    }) => {
      try {
        const result = await yesdevAPI.getProjectTaskList(args);

        if (result.ret !== 200 || !result.data) {
          return {
            content: [{
              type: 'text',
              text: `获取项目任务列表失败: ${result.msg || '返回数据格式不正确'}`
            }],
            isError: true
          };
        }

        const { task_list, total } = result.data;
        if (!task_list || task_list.length === 0) {
          return {
            content: [{ type: 'text', text: '该项目下未查询到任何任务。' }]
          };
        }

        const taskLines = task_list.map(task => {
          const statusName = configManager.getTaskStatusName(task.task_status);
          const link = `https://www.yesdev.cn/platform/task/task-detail?id=${task.id}`;
          return `- [${statusName}] [${task.task_title}](${link}) (负责人: ${task.staff_name || '无'})`;
        });

        const responseText = [
          `### 项目任务列表 (共 ${total} 条)`,
          ...taskLines,
        ].join('\n');

        return {
          content: [{
            type: 'text',
            text: responseText
          }]
        };
      } catch (error: any) {
        return {
          content: [{
            type: 'text',
            text: `获取项目任务列表失败: ${error.message}`
          }],
          isError: true
        };
      }
    }
  );
  registeredTools.add('get_project_task_list');

  return registeredTools;
} 