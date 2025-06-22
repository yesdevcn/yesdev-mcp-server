import axios from 'axios';
import dotenv from 'dotenv';
import type {
  YesDevAPI,
  YesDevResponse,
  MyTaskListResponse,
  ProjectTaskListResponse,
  ProjectTaskListParams,
  CreateTaskParams,
  TaskAddResponse,
  TaskResponse,
  TaskUpdateResponse,
  TaskDetailParams,
  UpdateTaskParams,
  QueryTasksParams,
  TaskListResponse,
  GlobalConfig,
  MyProjectListParams,
  MyProjectListResponse,
  ProjectDetailParams,
  UpdateProjectParams,
  ProjectResponse,
  CreateProjectParams,
  ProjectAddResponse,
  UpdateProjectStatusParams,
  UpdateProjectTimeParams,
  ProjectListParams,
  ProjectListResponse,
  StaffListResponse,
  WorkgroupListResponse,
  UserProfileResponse,
  SearchStaffParams,
  CreateNeedParams,
  NeedAddResponse,
  UpdateNeedParams,
  QueryNeedsParams,
  NeedListResponse,
  SubNeedListResponse,
  ProjectNeedListResponse,
  NeedResponse,
  NeedResponseLite,
} from './types.js';
import { configManager } from './config.js';

dotenv.config();

class YesDevAPIImpl implements YesDevAPI {
  private readonly baseURL = 'https://www.yesdev.cn/api/platform.php';
  private readonly accessToken: string;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
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

      return response.data as T;
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

  // 公共接口
  async searchStaff(params: SearchStaffParams): Promise<YesDevResponse<StaffListResponse>> {
    return this.request<YesDevResponse<StaffListResponse>>('POST', 'Platform.Staff.GetOrSearchStaffDropList', params);
  }

  async getWorkgroupList(): Promise<YesDevResponse<WorkgroupListResponse>> {
    return this.request<YesDevResponse<WorkgroupListResponse>>('POST', 'Platform.Workgroup.GetWorkgroupDropList');
  }

  async getMyProfile(): Promise<YesDevResponse<UserProfileResponse>> {
    return this.request<YesDevResponse<UserProfileResponse>>('POST', 'Platform.User.Profile');
  }

  // 1. 创建任务
  async createTask(params: CreateTaskParams): Promise<YesDevResponse<TaskAddResponse>> {
    return this.request<YesDevResponse<TaskAddResponse>>('POST', 'Platform.Tasks.CreateNewTask', params);
  }

  // 2. 获取任务详情
  async getTaskDetail(params: TaskDetailParams): Promise<YesDevResponse<TaskResponse>> {
    return this.request<YesDevResponse<TaskResponse>>('POST', 'Platform.Tasks.GetTaskDetail', params);
  }

  // 3. 更新任务
  async updateTask(params: UpdateTaskParams): Promise<YesDevResponse<TaskUpdateResponse>> {
    return this.request<YesDevResponse<TaskUpdateResponse>>('POST', 'Platform.Tasks.UpdateTaskLite', params);
  }

  // 4. 删除任务
  async removeTask(params: TaskDetailParams): Promise<YesDevResponse<void>> {
    return this.request<YesDevResponse<void>>('POST', 'Platform.Tasks.RemoveTask', params);
  }

  // 5. 查询全部任务列表
  async queryTasks(params: QueryTasksParams): Promise<YesDevResponse<TaskListResponse>> {
    return this.request<YesDevResponse<TaskListResponse>>('POST', 'Platform.Tasks.QueryTasks', params);
  }

  // 6. 获取我当前的任务列表
  async getMyTaskList(params: void): Promise<YesDevResponse<MyTaskListResponse>> {
    return this.request<YesDevResponse<MyTaskListResponse>>('POST', 'Platform.Tasks.GetTaskLeftSideMenu', params);
  }

  // 7. 获取项目任务列表
  async getProjectTaskList(params: ProjectTaskListParams): Promise<YesDevResponse<ProjectTaskListResponse>> {
    return this.request<YesDevResponse<ProjectTaskListResponse>>('POST', 'Platform.Tasks.SmartGetProjectTaskList', params);
  }

  // 项目相关
  // 1. 创建新项目
  async createProject(params: CreateProjectParams): Promise<YesDevResponse<ProjectAddResponse>> {
    return this.request<YesDevResponse<ProjectAddResponse>>('POST', 'Platform.Projects.CreateNewProject', params);
  }

  // 2. 获取项目详情
  async getProjectDetail(params: ProjectDetailParams): Promise<YesDevResponse<ProjectResponse>> {
    return this.request<YesDevResponse<ProjectResponse>>('POST', 'Platform.Projects.GetProjectDetail', params);
  }

  // 3. 更新项目状态
  async updateProjectStatus(params: UpdateProjectStatusParams): Promise<YesDevResponse<void>> {
    return this.request<YesDevResponse<void>>('POST', 'Platform.Projects.UpdateProjectStatus', params);
  }

  // 4. 更新项目-局部更新
  async updateProjectPart(params: UpdateProjectParams): Promise<YesDevResponse<void>> {
    return this.request<YesDevResponse<void>>('POST', 'Platform.Projects.UpdateProjectPart', params);
  }

  // 5. 单独更新项目时间接口
  async updateProjectTime(params: UpdateProjectTimeParams): Promise<YesDevResponse<void>> { 
    return this.request<YesDevResponse<void>>('POST', 'Platform.Projects.UpdateProjectTime', params);
  }

  // 6. 获取我的项目列表
  async getMyProjectList(params: MyProjectListParams): Promise<YesDevResponse<MyProjectListResponse>> {
    return this.request<YesDevResponse<MyProjectListResponse>>('POST', 'Platform.Projects.GetProjectLeftSideMenu');
  }

  // 7. 获取全部项目列表
  async getProjectList(params: ProjectListParams): Promise<YesDevResponse<ProjectListResponse>> {
    return this.request<YesDevResponse<ProjectListResponse>>('POST', 'Platform.Projects.GetProjectList', params);
  }

  // 全局相关
  async getGlobalConfig(params: { version?: string }): Promise<YesDevResponse<GlobalConfig>> {
    return this.request<YesDevResponse<GlobalConfig>>('POST', 'Platform.Setting_Setting.Start', params);
  }

  // 需求接口
  async createNeed(params: CreateNeedParams): Promise<YesDevResponse<NeedAddResponse>> {
    return this.request<YesDevResponse<NeedAddResponse>>('POST', 'Platform.PRD_Need.CreateNewNeed', params);
  }

  async updateNeed(params: UpdateNeedParams): Promise<YesDevResponse<void>> {
    return this.request<YesDevResponse<void>>('POST', 'Platform.PRD_Need.UpdateNeedLite', params);
  }

  async getNeedDetail(params: { id: number }): Promise<YesDevResponse<NeedResponse>> {
    return this.request<YesDevResponse<NeedResponse>>('POST', 'Platform.PRD_Need.GetNeedDetail', params);
  }

  async getNeedDetailLite(params: { id: number }): Promise<YesDevResponse<NeedResponseLite>> {
    return this.request<YesDevResponse<NeedResponseLite>>('POST', 'Platform.PRD_Need.GetNeedDetailLite', params);
  }

  async removeNeed(params: { id: number }): Promise<YesDevResponse<void>> {
    return this.request<YesDevResponse<void>>('POST', 'Platform.PRD_Need.RemoveNeed', params);
  }

  async queryNeeds(params: QueryNeedsParams): Promise<YesDevResponse<NeedListResponse>> {
    return this.request<YesDevResponse<NeedListResponse>>('POST', 'Platform.PRD_Need.GetNeedListMoreWhere', params);
  }

  async getProjectNeedList(params: { project_id: number, need_status?: string }): Promise<YesDevResponse<ProjectNeedListResponse>> {
    return this.request<YesDevResponse<ProjectNeedListResponse>>('POST', 'Platform.PRD_Need.GetProjectNeedListCanGroup', params);
  }

  async getSubNeedList(params: { id: number }): Promise<YesDevResponse<SubNeedListResponse>> {
    return this.request<YesDevResponse<SubNeedListResponse>>('POST', 'Platform.PRD_Need.GetSubNeedList', params);
  }
}

export const yesdevAPI = new YesDevAPIImpl(process.env.YESDEV_ACCESS_TOKEN || ''); 