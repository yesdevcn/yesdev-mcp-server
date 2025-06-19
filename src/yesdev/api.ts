import axios from 'axios';
import dotenv from 'dotenv';
import type {
  YesDevAPI,
  CreateTaskParams,
  TaskResponse,
  TaskDetailParams,
  UpdateTaskParams,
  TaskListParams,
  TaskListResponse,
  CheckTaskParams,
  RevokeCheckTaskParams
} from './types.js';

dotenv.config();

class YesDevAPIImpl implements YesDevAPI {
  private readonly baseURL = 'https://www.yesdev.cn/api/platform.php';
  private readonly accessToken: string;

  constructor() {
    const token = process.env.YESDEV_ACCESS_TOKEN;
    if (!token) {
      throw new Error('YESDEV_ACCESS_TOKEN environment variable is not set');
    }
    this.accessToken = token;
  }

  private async request<T>(method: string, service: string, data?: any): Promise<T> {
    try {
      console.log(`Calling YesDev API: ${service}`, {
        url: `${this.baseURL}?s=${service}`,
        data: {
          access_token: '[HIDDEN]',
          ...data
        }
      });

      const response = await axios({
        method: 'POST',  // YesDev API 总是使用 POST
        url: `${this.baseURL}?s=${service}`,
        data: {
          access_token: this.accessToken,
          ...data
        }
      });

      console.log(`API Response:`, {
        status: response.status,
        ret: response.data.ret,
        msg: response.data.msg,
        data: response.data.data
      });

      if (response.data.ret !== 200) {
        throw new Error(response.data.msg || '请求失败');
      }

      return response.data.data;
    } catch (error: any) {
      console.error('API Error:', {
        error: error.message,
        response: error.response?.data,
        status: error.response?.status
      });

      if (error.response?.data) {
        throw new Error(`YesDev API Error: ${error.response.data.msg || error.response.statusText}`);
      }
      throw error;
    }
  }

  // 1. 创建任务
  async createTask(params: CreateTaskParams): Promise<TaskResponse> {
    return this.request<TaskResponse>('POST', 'Platform.Tasks.CreateNewTask', params);
  }

  // 2. 获取任务详情
  async getTaskDetail(params: TaskDetailParams): Promise<TaskResponse> {
    return this.request<TaskResponse>('POST', 'Platform.Tasks.GetTaskDetail', params);
  }

  // 3. 更新任务
  async updateTask(params: UpdateTaskParams): Promise<TaskResponse> {
    return this.request<TaskResponse>('POST', 'Platform.Tasks.UpdateTask', params);
  }

  // 4. 删除任务
  async removeTask(params: TaskDetailParams): Promise<void> {
    await this.request<void>('POST', 'Platform.Tasks.RemoveTask', params);
  }

  // 5. 获取任务列表
  async getTaskList(params: TaskListParams): Promise<TaskListResponse> {
    return this.request<TaskListResponse>('POST', 'Platform.Tasks.GetTaskList', params);
  }

  // 6. 任务验收
  async checkTask(params: CheckTaskParams): Promise<void> {
    await this.request<void>('POST', 'Platform.Tasks.CheckTask', params);
  }

  // 7. 撤销任务验收
  async revokeCheckTask(params: RevokeCheckTaskParams): Promise<void> {
    await this.request<void>('POST', 'Platform.Tasks.RevokeCheckTask', params);
  }
}

// 导出单例实例
export const yesdevAPI: YesDevAPI = new YesDevAPIImpl(); 