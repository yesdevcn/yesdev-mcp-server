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
        
        const { my_project = [], join_project = [] } = result.data;
        if (my_project.length === 0 && join_project.length === 0) {
            return {
                content: [{ type: 'text', text: '你当前没有参与任何进行中的项目。' }]
            };
        }

        let responseText = '### 🚀 你的项目列表\n\n';

        if (my_project.length > 0) {
            responseText += '**我负责的项目:**\n';
            responseText += my_project.map(p => `- [${p.project_name}](https://www.yesdev.cn/platform/#/project/project-detail?id=${p.id})`).join('\n');
            responseText += '\n\n';
        }

        if (join_project.length > 0) {
            responseText += '**我参与的项目:**\n';
            responseText += join_project.map(p => `- [${p.project_name}](https://www.yesdev.cn/platform/#/project/project-detail?id=${p.id})`).join('\n');
        }

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


  return registeredTools;
} 