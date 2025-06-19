import axios from 'axios';
import { YesDevTaskCreateParams, YesDevTaskCreateResult } from './types.js';

export class YesDevAPI {
  private readonly baseUrl = 'https://www.yesdev.cn/api/platform.php';
  private readonly accessToken: string;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  async createTask(params: YesDevTaskCreateParams): Promise<YesDevTaskCreateResult> {
    const response = await axios.post(this.baseUrl + '?s=Platform.Tasks.CreateNewTask', {
      access_token: this.accessToken,
      ...params
    });

    if (response.data.ret !== 200) {
      throw new Error(response.data.msg || '创建任务失败');
    }

    return response.data.data;
  }
}

// 创建单例实例
export const yesdevAPI = new YesDevAPI(process.env.YESDEV_ACCESS_TOKEN || ''); 