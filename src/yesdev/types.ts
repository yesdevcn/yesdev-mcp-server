// 通用响应类型
export interface YesDevResponse<T> {
  ret: number;
  data: T;
  msg: string;
}

// 任务相关类型
export interface CreateTaskParams {
  task_title: string;
  staff_id?: string;
  task_desc?: string;
  task_finish_time?: string;
  plan_start_date?: string;
  task_type?: number;
  task_time?: number;
  project_id?: number;
  need_id?: number;
  task_status?: number;
  not_send_email?: number;
  problem_id?: number;
  is_milestone?: number;
  from_channel?: string;
}

export interface TaskAddResponse {
  id: number | any[];
}

export interface TaskDetailParams {
  id: number;
}

export interface TaskResponse {
  id: number;
  task_title: string;
  task_type: number;
  task_time: string;
  task_finish_time: string | null;
  task_status: number;
  project_id: number;
  problem_id: number;
  app_key: string;
  add_time: string;
  staff_id: number;
  need_id: number;
  sys_update_time: string;
  task_desc: string;
  created_staff_id: number;
  check_status_name?: string;
  custom_field_data?: any[];
  plan_start_date?: string | null;
  actual_finish_date?: string | null;
  task_parent_id?: number;
  is_milestone?: number;
  real_task_time?: string;
  staff_name: string;
  created_staff_name: string;
}

export interface MyTaskListResponse {
  task_list: TaskResponse[];
}

export interface UpdateTaskParams {
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
}

export interface TaskUpdateResponse {
  is_updated: number;
}

export interface QueryTasksParams {
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
}

export interface TaskListResponse {
  total: number;
  items: TaskResponse[];
}

// 项目任务相关
export interface ProjectTaskListParams {
  project_id: number;
  task_status?: string;
  is_milestone?: string;
  page?: number;
  perpage?: number;
}

export interface ProjectTaskListResponse {
  total: number;
  task_list: TaskResponse[];
}

// 项目相关类型
export interface ProjectResponse {
  id: number;
  project_name: string;
  project_status: number;
  project_start_time: string | null;
  project_end_time: string | null;
  charge_staff_name: string;
  project_desc: string;
  charge_staff_id: number;
  created_staff_name: string;
  add_time: string;
}

export interface MyProjectListResponse {
  project_list: {
      id: number;
      project_name: string;
  }[];
}

export interface ProjectDetailParams {
  id: number;
}

export interface UpdateProjectParams {
  id: number;
  project_name?: string;
  project_desc?: string;
  charge_staff_id?: number;
  project_bg_color?: string;
  project_start_time?: string;
  project_end_time?: string;
  project_status?: number;
}

export interface CreateProjectParams {
  project_name: string;
  project_start_time?: string;
  project_end_time?: string;
  project_desc?: string;
  project_status?: number;
  charge_staff_id?: number;
  workgroup_id?: number;
  project_level_type?: number;
}

export interface ProjectAddResponse {
  id: number;
}

export interface UpdateProjectStatusParams {
  id: number;
  project_status: number;
}

export interface UpdateProjectTimeParams {
  id: number;
  project_start_time: string;
  project_end_time: string;
}

export interface ProjectListParams {
  id?: number;
  project_name?: string;
  charge_staff_name?: string;
  project_status?: string;
  page?: number;
  perpage?: number;
  order_status?: number;
  order_status_sort?: number;
  project_start_time?: string;
  project_end_time?: string;
  charge_staff_id?: string;
}

export interface ProjectListResponse {
  total: number;
  projects: ProjectResponse[];
}

export interface YesDevAPI {
  // 任务相关
  createTask(params: CreateTaskParams): Promise<YesDevResponse<TaskAddResponse>>;
  getTaskDetail(params: TaskDetailParams): Promise<YesDevResponse<TaskResponse>>;
  updateTask(params: UpdateTaskParams): Promise<YesDevResponse<TaskUpdateResponse>>;
  removeTask(params: TaskDetailParams): Promise<YesDevResponse<void>>;
  queryTasks(params: QueryTasksParams): Promise<YesDevResponse<TaskListResponse>>;
  getMyTaskList(params: void): Promise<YesDevResponse<MyTaskListResponse>>;
  getProjectTaskList(params: ProjectTaskListParams): Promise<YesDevResponse<ProjectTaskListResponse>>;
  
  // 项目相关
  createProject(params: CreateProjectParams): Promise<YesDevResponse<ProjectAddResponse>>;
  getProjectDetail(params: ProjectDetailParams): Promise<YesDevResponse<ProjectResponse>>;
  updateProjectStatus(params: UpdateProjectStatusParams): Promise<YesDevResponse<void>>;
  updateProjectPart(params: UpdateProjectParams): Promise<YesDevResponse<void>>;
  updateProjectTime(params: UpdateProjectTimeParams): Promise<YesDevResponse<void>>;
  getMyProjectList(): Promise<YesDevResponse<MyProjectListResponse>>;
  getProjectList(params: ProjectListParams): Promise<YesDevResponse<ProjectListResponse>>;

  // 全局相关
  getGlobalConfig(params: { version?: string }): Promise<YesDevResponse<GlobalConfig>>;
}

// -- Global Config Types --

export interface ConstantInfo {
    name: string;
    value: number | string;
    color?: string;
    key?: string;
    alias?: string;
}

export interface ConstantData {
    [key: string]: ConstantInfo;
}

export interface GlobalConfig {
    is_last: number;
    version: string;
    alias_list: {
        TASK_STATUS: ConstantData;
        TASK_TYPE: ConstantData;
        PROBLEM_STATUS: ConstantData;
        PROBLEM_TYPE: ConstantData;
        PROBLEM_LEVEL: ConstantData;
        PROBLEM_ATTRIBUTION: ConstantData;
        NEED_STATUS: ConstantData;
        NEED_LEVEL: ConstantData;
        PROJECT_STATUS: ConstantData;
        [key: string]: ConstantData;
    };
    ai: any;
} 