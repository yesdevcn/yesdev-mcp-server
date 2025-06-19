import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { yesdevAPI } from '../../yesdev/api.js';

// 任务相关的工具注册函数
export function registerTaskTools(server: McpServer) {
  const registeredTools = new Set<string>();

  // 1. 创建任务
  server.registerTool(
    'create_task',
    {
      title: '创建任务',
      description: '创建一个新的YesDev任务，单个任务工时推荐不超4小时，如果任务工时超过8小时，请拆分成多个任务',
      inputSchema: {
        task_title: z.string().describe('任务标题，长度不超过100字'),
        staff_id: z.string().optional().describe('负责人ID，多个用英文逗号隔开，不传则使用当前用户'),
        task_desc: z.string().optional().describe('任务描述，采用HTML格式'),
        task_finish_time: z.string().optional().describe('任务计划完成时间，格式：YYYY-MM-DD'),
        plan_start_date: z.string().optional().describe('计划开始时间，格式：YYYY-MM-DD'),
        task_type: z.number().optional().default(3).describe('任务类型，0其他1UI设计2产品原型3技术开发4测试5会议6编写文档7调研8沟通'),
        task_time: z.number().optional().describe('任务工时，单位：小时，保留一位小数'),
        project_id: z.number().optional().describe('项目ID'),
        need_id: z.number().optional().describe('需求ID'),
        task_status: z.number().optional().default(600).describe('任务状态，600待办、1500进行中、2000已完成'),
        not_send_email: z.number().optional().describe('是否发送邮件，1是0否'),
        problem_id: z.number().optional().describe('问题ID'),
        is_milestone: z.number().optional().describe('是否里程碑，1是0否'),
      }
    },
    async (args: { task_title: string; staff_id?: string; task_desc?: string; task_finish_time?: string; plan_start_date?: string; task_type?: number; task_time?: number; project_id?: number; need_id?: number; task_status?: number; not_send_email?: number; problem_id?: number; is_milestone?: number }) => {
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
          args.task_desc += `<p><br>任务创建来自AI助手</p>`;
        }

        const result = await yesdevAPI.createTask({
          task_title: args.task_title,
          staff_id: args.staff_id,
          task_desc: args.task_desc,
          task_finish_time: args.task_finish_time,
          plan_start_date: args.plan_start_date,
          task_type: args.task_type,
          task_time: args.task_time,
          project_id: args.project_id,
          need_id: args.need_id,
          task_status: args.task_status,
          not_send_email: args.not_send_email,
          problem_id: args.problem_id,
          is_milestone: args.is_milestone,
          from_channel: 'mcp',
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
        return {
          content: [{
            type: 'text',
            text: JSON.stringify(result, null, 2)
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
      description: '更新任务的信息',
      inputSchema: {
        id: z.string().describe('任务ID'),
        title: z.string().optional().describe('任务标题'),
        description: z.string().optional().describe('任务描述'),
        assignee: z.string().optional().describe('负责人ID'),
        status: z.number().optional().describe('任务状态'),
        priority: z.number().optional().describe('优先级')
      }
    },
    async (args: { 
      id: string;
      title?: string;
      description?: string;
      assignee?: string;
      status?: number;
      priority?: number;
    }) => {
      try {
        const { id, ...updateData } = args;
        const result = await yesdevAPI.updateTask({
          id,
          ...updateData
        });
        return {
          content: [{
            type: 'text',
            text: `成功更新任务 ${id}`
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

  // 5. 获取任务列表
  server.registerTool(
    'get_task_list',
    {
      title: '获取任务列表',
      description: '获取任务列表，支持分页和筛选',
      inputSchema: {
        page: z.number().optional().describe('页码'),
        page_size: z.number().optional().describe('每页数量'),
        status: z.number().optional().describe('任务状态'),
        assignee: z.string().optional().describe('负责人ID')
      }
    },
    async (args: {
      page?: number;
      page_size?: number;
      status?: number;
      assignee?: string;
    }) => {
      try {
        const result = await yesdevAPI.getTaskList({
          page: args.page || 1,
          page_size: args.page_size || 20,
          status: args.status,
          staff_id: args.assignee
        });
        return {
          content: [{
            type: 'text',
            text: JSON.stringify(result, null, 2)
          }]
        };
      } catch (error: any) {
        return {
          content: [{
            type: 'text',
            text: `获取任务列表失败: ${error.message}`
          }],
          isError: true
        };
      }
    }
  );
  registeredTools.add('get_task_list');

  // 6. 任务验收
  server.registerTool(
    'check_task',
    {
      title: '任务验收',
      description: '对任务进行验收',
      inputSchema: {
        id: z.string().describe('任务ID'),
        comment: z.string().optional().describe('验收评论')
      }
    },
    async (args: { id: string; comment?: string }) => {
      try {
        await yesdevAPI.checkTask({
          id: args.id,
          comment: args.comment
        });
        return {
          content: [{
            type: 'text',
            text: `成功验收任务 ${args.id}`
          }]
        };
      } catch (error: any) {
        return {
          content: [{
            type: 'text',
            text: `任务验收失败: ${error.message}`
          }],
          isError: true
        };
      }
    }
  );
  registeredTools.add('check_task');

  // 7. 撤销任务验收
  server.registerTool(
    'revoke_check_task',
    {
      title: '撤销任务验收',
      description: '撤销已验收的任务',
      inputSchema: {
        id: z.string().describe('任务ID'),
        reason: z.string().optional().describe('撤销原因')
      }
    },
    async (args: { id: string; reason?: string }) => {
      try {
        await yesdevAPI.revokeCheckTask({
          id: args.id,
          reason: args.reason
        });
        return {
          content: [{
            type: 'text',
            text: `成功撤销任务 ${args.id} 的验收`
          }]
        };
      } catch (error: any) {
        return {
          content: [{
            type: 'text',
            text: `撤销任务验收失败: ${error.message}`
          }],
          isError: true
        };
      }
    }
  );
  registeredTools.add('revoke_check_task');


  return registeredTools;
} 