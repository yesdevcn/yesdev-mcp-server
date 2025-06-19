export interface YesDevTaskCreateParams {
  task_title: string;
  staff_id: string;
  task_type?: number;
  task_time?: number;
  task_finish_time?: string;
  project_id?: number;
  need_id?: number;
  task_status?: number;
  task_desc?: string;
  [key: string]: any;
}

export interface YesDevTaskCreateResult {
  id: number;
}

export interface YesDevResponse<T> {
  ret: number;
  data: T;
  msg: string;
} 