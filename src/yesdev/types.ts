
export interface YesDevResponse<T> {
  ret: number;
  data: T;
  msg: string;
}

export interface TaskResponse {
  id: string;
  title: string;
  description?: string;
  status: number;
  priority: number;
  assignee: string;
  created_at: string;
  updated_at: string;
}

export interface TaskListResponse {
  total: number;
  items: TaskResponse[];
}

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

export interface UpdateTaskParams {
  id: string;
  title?: string;
  description?: string;
  assignee?: string;
  status?: number;
  priority?: number;
}

export interface TaskDetailParams {
  id: number;
}

export interface TaskListParams {
  page?: number;
  page_size?: number;
  status?: number;
  staff_id?: string;
}

export interface CheckTaskParams {
  id: string;
  comment?: string;
}

export interface RevokeCheckTaskParams {
  id: string;
  reason?: string;
}

export interface YesDevAPI {
  createTask(params: CreateTaskParams): Promise<TaskResponse>;
  getTaskDetail(params: TaskDetailParams): Promise<TaskResponse>;
  updateTask(params: UpdateTaskParams): Promise<TaskResponse>;
  removeTask(params: TaskDetailParams): Promise<void>;
  getTaskList(params: TaskListParams): Promise<TaskListResponse>;
  checkTask(params: CheckTaskParams): Promise<void>;
  revokeCheckTask(params: RevokeCheckTaskParams): Promise<void>;
} 