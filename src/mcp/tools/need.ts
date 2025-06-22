import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { yesdevAPI } from '../../yesdev/api.js';
import { configManager } from '../../yesdev/config.js';
import { NeedResponse } from '../../yesdev/types.js';

function formatNeed(need: NeedResponse): string {
  const link = `https://www.yesdev.cn/platform/requirements/reqm-detail?id=${need.id}`;
  const status = configManager.getNeedStatusName(need.need_status);
  const level = configManager.getNeedLevelName(need.need_level);

  return [
    `### 需求名称: ${need.need_name}`,
    `**需求ID**: ${need.id}`,
    `**状态**: ${status}`,
    `**优先级**: ${level}`,
    `**负责人**: ${need.charge_staff_name}`,
    `**创建人**: ${need.created_staff_name}`,
    `**所属项目**: ${need.project_name}`,
    `**创建时间**: ${need.add_time}`,
    `**最后更新**: ${need.sys_update_time}`,
    `\n[在YesDev中查看需求](${link})`,
  ].join('\n');
}

export function registerNeedTools(server: McpServer): Set<string> {
  const registeredTools = new Set<string>();

  // 1. 创建新需求
  server.registerTool(
    'create_need',
    {
      title: '创建新需求',
      description: '创建一个新的YesDev需求',
      inputSchema: {
        need_name: z.string().max(200).describe('需求名称，最多200个字符'),
        project_id: z.number().optional().describe('所属项目ID'),
        charge_staff_id: z.number().optional().describe('负责人ID'),
        need_level: z.number().optional().describe('需求优先级'),
        need_status: z.number().optional().describe('需求状态'),
        need_content: z.string().optional().describe('需求描述，使用HTML格式'),
        need_start_date: z.string().optional().describe('需求开始时间，格式：YYYY-MM-DD'),
        need_finish_date: z.string().optional().describe('需求完成时间，格式：YYYY-MM-DD'),
        need_parent_id: z.number().optional().describe('父需求ID'),
        from_channel: z.string().optional().describe('来源渠道，默认mcp'),
      },
    },
    async (args) => {
      try {
        args.from_channel = 'mcp';
        const result = await yesdevAPI.createNeed(args);
        if (result.ret !== 200 || !result.data) {
          return { content: [{ type: 'text', text: `创建需求失败: ${result.msg || '未知错误'}` }], isError: true };
        }
        return { content: [{ type: 'text', text: `新需求已成功创建，需求ID是 ${result.data.id}` }] };
      } catch (error: any) {
        return { content: [{ type: 'text', text: `创建需求失败: ${error.message}` }], isError: true };
      }
    }
  );
  registeredTools.add('create_need');

  // 2. 更新需求
  server.registerTool(
    'update_need',
    {
      title: '更新需求，支持按需更新',
      description: '按需更新指定ID的需求信息',
      inputSchema: {
        id: z.number().describe('要更新的需求ID'),
        need_name: z.string().max(200).optional().describe('新的需求名称，最多200个字符'),
        project_id: z.number().optional().describe('新的所属项目ID'),
        need_status: z.number().optional().describe('新的需求状态'),
        charge_staff_id: z.number().optional().describe('新的负责人ID，多个使用英文逗号分隔'),
        need_level: z.number().optional().describe('新的需求优先级'),
        need_content: z.string().optional().describe('新的需求描述，使用HTML格式'),
        need_start_date: z.string().optional().describe('新的需求开始时间，格式：YYYY-MM-DD'),
        need_finish_date: z.string().optional().describe('新的需求完成时间，格式：YYYY-MM-DD'),
        need_parent_id: z.number().optional().describe('新的父需求ID'),
      },
    },
    async (args) => {
      try {
        await yesdevAPI.updateNeed(args);
        return { content: [{ type: 'text', text: `需求 ${args.id} 更新成功！` }] };
      } catch (error: any) {
        return { content: [{ type: 'text', text: `更新需求失败: ${error.message}` }], isError: true };
      }
    }
  );
  registeredTools.add('update_need');

  // 3. 获取需求详情
  server.registerTool(
    'get_need_detail',
    {
      title: '获取需求详情',
      description: '获取指定ID的需求的详细信息',
      inputSchema: { id: z.number().describe('需求ID') },
    },
    async ({ id }) => {
      try {
        const result = await yesdevAPI.getNeedDetail({ id });
        if (result.ret !== 200 || !result.data) {
          return { content: [{ type: 'text', text: `获取需求详情失败: ${result.msg || '未知错误'}` }], isError: true };
        }
        const needData = (result.data as any).need || result.data;
        return { content: [{ type: 'text', text: formatNeed(needData) }] };
      } catch (error: any) {
        return { content: [{ type: 'text', text: `获取需求详情失败: ${error.message}` }], isError: true };
      }
    }
  );
  registeredTools.add('get_need_detail');

  // 4. 获取简化版需求详情
  server.registerTool(
    'get_need_detail_lite',
    {
      title: '获取简化版需求详情',
      description: '获取指定ID的需求的简化信息',
      inputSchema: { id: z.number().describe('需求ID') },
    },
    async ({ id }) => {
      try {
        const result = await yesdevAPI.getNeedDetailLite({ id });
        if (result.ret !== 200 || !result.data) {
          return { content: [{ type: 'text', text: `获取需求详情失败: ${result.msg || '未知错误'}` }], isError: true };
        }
        return { content: [{ type: 'text', text: formatNeed(result.data.need) }] };
      } catch (error: any) {
        return { content: [{ type: 'text', text: `获取需求详情失败: ${error.message}` }], isError: true };
      }
    }
  );
  registeredTools.add('get_need_detail_lite');

  // 5. 删除需求
  server.registerTool(
    'remove_need',
    {
      title: '删除需求',
      description: '删除指定ID的需求',
      inputSchema: { id: z.number().describe('要删除的需求ID') },
    },
    async ({ id }) => {
      try {
        await yesdevAPI.removeNeed({ id });
        return { content: [{ type: 'text', text: `需求 ${id} 已被删除。` }] };
      } catch (error: any) {
        return { content: [{ type: 'text', text: `删除需求失败: ${error.message}` }], isError: true };
      }
    }
  );
  registeredTools.add('remove_need');
  
  // 6. 查询需求列表
  server.registerTool(
    'query_needs',
    {
      title: '查询需求列表',
      description: '根据多种条件查询需求列表',
      inputSchema: {
        need_name: z.string().optional().describe('需求名称'),
        need_level: z.string().optional().describe('需求优先级'),
        need_status: z.string().optional().describe('需求状态，多个用逗号隔开'),
        is_have_project_id: z.number().optional().describe('是否关联项目的,1是关联的0不关联的'),
        is_assign_staff: z.number().optional().describe('我的需求，是否是指派给我的 1是0否'),
        charge_staff_ids: z.string().optional().describe('负责人ID，多个用英文逗号分隔'),
        created_staff_ids: z.string().optional().describe('创建人ID，多个用英文逗号分隔'),
        start_start_time: z.string().optional().describe('需求开始时间，格式：YYYY-MM-DD'),
        end_start_time: z.string().optional().describe('需求开始时间，格式：YYYY-MM-DD'),
        end_finish_time: z.string().optional().describe('需求完成时间，格式：YYYY-MM-DD'),
        start_add_time: z.string().optional().describe('创建时间，格式：YYYY-MM-DD'),
        end_add_time: z.string().optional().describe('创建时间，格式：YYYY-MM-DD'),
        start_update_time: z.string().optional().describe('更新时间，格式：YYYY-MM-DD'),
        end_update_time: z.string().optional().describe('更新时间，格式：YYYY-MM-DD'),
        start_actual_finish_date: z.string().optional().describe('实际完成时间，格式：YYYY-MM-DD'),
        end_actual_finish_date: z.string().optional().describe('实际完成时间，格式：YYYY-MM-DD'),
        need_parent_id: z.string().optional().describe('父需求ID，多个用英文逗号隔开'),
        project_id: z.string().optional().describe('所属项目ID，多个用英文逗号隔开'),
        page: z.number().optional().default(1).describe('页码'),
        perpage: z.number().optional().default(20).describe('每页数量'),
        order_status: z.number().optional().describe('排序方式，0 id排序，1优先级 2计划完成时间 3创建时间 4需求进度 5最后更新 6计划开始时间'),
        order_status_sort: z.number().optional().describe('排序顺序，1升序0降序'),
      },
    },
    async (args) => {
      try {
        const result = await yesdevAPI.queryNeeds(args);
        if (result.ret !== 200 || !result.data) {
          return { content: [{ type: 'text', text: `查询需求列表失败: ${result.msg || '未知错误'}` }], isError: true };
        }

        const { items = [], total = 0 } = result.data;
        if (items.length === 0) {
          return { content: [{ type: 'text', text: '未查询到任何需求。' }] };
        }

        let responseText = `### 需求列表 (共 ${total} 个)\n\n`;
        responseText += items.map(n => {
          const link = `https://www.yesdev.cn/platform/requirements/reqm-detail?id=${n.id}`;
          return `- [${n.need_name}](${link}) (状态: ${configManager.getNeedStatusName(n.need_status)})`;
        }).join('\n');
        
        return { content: [{ type: 'text', text: responseText.trim() }] };
      } catch (error: any) {
        return { content: [{ type: 'text', text: `查询需求列表失败: ${error.message}` }], isError: true };
      }
    }
  );
  registeredTools.add('query_needs');

  // 7. 获取项目的需求列表
  server.registerTool(
    'get_project_needs',
    {
      title: '获取项目的需求列表',
      description: '获取指定项目的全部需求列表',
      inputSchema: {
        project_id: z.number().describe('项目ID'),
        need_status: z.string().optional().describe('需求状态，多个用逗号隔开'),
      },
    },
    async (args) => {
      try {
        const result = await yesdevAPI.getProjectNeedList(args);
        if (result.ret !== 200 || !result.data) {
          return { content: [{ type: 'text', text: `获取项目需求失败: ${result.msg || '未知错误'}` }], isError: true };
        }

        const groups = result.data;
        let responseText = `### 项目需求列表\n\n`;
        responseText += groups.list.map(n => {
          const link = `https://www.yesdev.cn/platform/requirements/reqm-detail?id=${n.id}`;
          return `- [${n.need_name}](${link}) (状态: ${configManager.getNeedStatusName(n.need_status)})`;
        }).join('\n');

        return { content: [{ type: 'text', text: responseText.trim() }] };
      } catch (error: any) {
        return { content: [{ type: 'text', text: `获取项目需求失败: ${error.message}` }], isError: true };
      }
    }
  );
  registeredTools.add('get_project_needs');

  // 8. 获取子需求列表
  server.registerTool(
    'get_sub_needs',
    {
      title: '获取子需求列表',
      description: '获取指定父需求的子需求列表',
      inputSchema: { id: z.number().describe('父需求ID') },
    },
    async ({ id }) => {
      try {
        const result = await yesdevAPI.getSubNeedList({ need_id: id });
        if (result.ret !== 200 || !result.data) {
          return { content: [{ type: 'text', text: `获取子需求列表失败: ${result.msg || '未知错误'}` }], isError: true };
        }

        const { list = [] } = result.data;
        if (list.length === 0) {
          return { content: [{ type: 'text', text: '该需求下没有子需求。' }] };
        }

        let responseText = `### 子需求列表\n\n`;
        responseText += list.map(n => {
          const link = `https://www.yesdev.cn/platform/requirements/reqm-detail?id=${n.id}`;
          return `- [${n.need_name}](${link}) (状态: ${configManager.getNeedStatusName(n.need_status)})`;
        }).join('\n');
        
        return { content: [{ type: 'text', text: responseText.trim() }] };
      } catch (error: any) {
        return { content: [{ type: 'text', text: `获取子需求列表失败: ${error.message}` }], isError: true };
      }
    }
  );
  registeredTools.add('get_sub_needs');


  return registeredTools;
} 