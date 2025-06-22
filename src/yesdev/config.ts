import { yesdevAPI } from './api.js';
import { GlobalConfig, ConstantData } from './types.js';

class ConfigManager {
    private config: GlobalConfig | null = null;
    private initialized = false;

    async initialize(): Promise<void> {
        if (this.initialized) {
            return;
        }

        try {
            const response = await yesdevAPI.getGlobalConfig({});
            if (response.ret === 200 && response.data) {
                this.config = response.data;
                this.initialized = true;
                console.log('YesDev 全局配置已成功初始化！');
            } else {
                console.error('初始化YesDev全局配置失败:', response);
                // 在生产环境中可能需要更健壮的错误处理，例如重试或退出
            }
        } catch (error) {
            console.error('请求YesDev全局配置时发生错误:', error);
        }
    }

    public getConfig(): GlobalConfig | null {
        return this.config;
    }

    public getConstant(key: keyof GlobalConfig['alias_list']): ConstantData | null {
        return this.config?.alias_list[key] ?? null;
    }

    public getTaskStatusName(statusValue: number): string {
        const taskStatus = this.getConstant('TASK_STATUS');
        if (taskStatus && taskStatus[statusValue]) {
            return taskStatus[statusValue].name;
        }
        return '未知状态';
    }

    public getTaskTypeName(typeValue: number): string {
        const taskType = this.getConstant('TASK_TYPE');
        if (taskType && taskType[typeValue]) {
            return taskType[typeValue].name;
        }
        return '其他';
    }

    public getProjectStatusName(statusValue: number): string {
        const projectStatus = this.getConstant('PROJECT_STATUS');
        if (projectStatus && projectStatus[statusValue]) {
            return projectStatus[statusValue].name;
        }
        return '未知状态';
    }

    public getNeedStatusName(status: number): string {
        return this.config?.alias_list?.NEED_STATUS?.[status]?.name || '未知状态';
    }

    public getNeedLevelName(level: number): string {
        return this.config?.alias_list?.NEED_LEVEL?.[level]?.name || '未知优先级';
    }
}

const configManager = new ConfigManager();
export { configManager }; 