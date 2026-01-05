// 指标类型定义
export interface MetricValue {
  date: string;
  value: number;
  unit?: string;
  previousValue?: number;
}

export interface DailyMetric {
  moduleCode: string;
  metricName: string;
  metricDate: string;
  metricValue: number;
  metricUnit: string;
  dimensionType: 'none' | 'clinic' | 'doctor' | 'region';
  dimensionValue?: string;
  isPrediction?: boolean;
}

export interface Module {
  code: string;
  name: string;
  description: string;
  priority: 'P0' | 'P1' | 'P2';
  metrics: MetricDefinition[];
  color: string;
}

export interface MetricDefinition {
  code: string;
  name: string;
  unit: string;
  type: 'absolute' | 'percentage' | 'decimal';
  description: string;
  dimension?: 'none' | 'clinic' | 'doctor' | 'region';
}

// API 响应类型
export interface ApiResponse<T> {
  code: number;
  data: T;
  message?: string;
}

export interface MetricsResponse {
  module: string;
  period: 'day' | 'week' | 'month';
  metrics: DailyMetric[];
}

export interface ComparisonParams {
  module: string;
  metric: string;
  period1: DateRange;
  period2: DateRange;
}

export interface ComparisonResult {
  period1Value: number;
  period2Value: number;
  change: number;
  changeRate: number;
  trend: 'up' | 'down' | 'neutral';
}

export interface FunnelStep {
  step: string;
  count: number;
  rate: number;
}

export interface FunnelData {
  funnel: FunnelStep[];
}

// 日期范围
export interface DateRange {
  startDate: Date;
  endDate: Date;
}

// 视图模式
export type ViewMode = 'day' | 'week' | 'month';

// 模块信息
export const MODULES: Record<string, Module> = {
  photo_inventory: {
    code: 'photo_inventory',
    name: '拍单入库',
    description: '药店AI拍单收货与诊所+医院AI拍单入库',
    priority: 'P0',
    color: '#0066CC',
    metrics: [
      { code: 'open_clinic_count', name: '开放门店数', unit: '个', type: 'absolute', description: '开放了拍单入库功能的门店数量' },
      { code: 'open_clinic_rate', name: '开放门店占比', unit: '%', type: 'percentage', description: '开放门店数 / 全部门店数' },
      { code: 'active_clinic_count', name: '活跃门店数', unit: '个', type: 'absolute', description: '完成入库的门店数' },
      { code: 'active_clinic_rate', name: '活跃门店占比', unit: '%', type: 'percentage', description: '活跃门店数 / 发生入库门店数' },
      { code: 'avg_recognition_accuracy', name: '平均识别正确率', unit: '%', type: 'percentage', description: '识别结果准确度' },
      { code: 'completion_rate', name: '完成入库转化率', unit: '%', type: 'percentage', description: '完成入库 / 发起入库' },
    ],
  },
  ai_diagnosis: {
    code: 'ai_diagnosis',
    name: 'AI诊疗',
    description: 'AI诊疗辅助医生诊断和处方',
    priority: 'P0',
    color: '#667EEA',
    metrics: [
      { code: 'daily_clinics', name: '日使用诊所数', unit: '个', type: 'absolute', description: '当日使用AI诊疗的诊所数' },
      { code: 'daily_doctors', name: '日使用医生数', unit: '个', type: 'absolute', description: '当日使用AI诊疗的医生数' },
      { code: 'clinic_active_rate', name: '诊所活跃率', unit: '%', type: 'percentage', description: '使用诊所数 / 有权限诊所数' },
      { code: 'doctor_active_rate', name: '医生活跃率', unit: '%', type: 'percentage', description: '使用医生数 / 有权限医生数' },
      { code: 'adoption_rate', name: '采纳率', unit: '%', type: 'percentage', description: '采纳诊断的门诊单 / 使用AI诊疗的门诊单' },
      { code: 'token_consumption', name: 'Token消耗', unit: '万', type: 'decimal', description: 'LLM调用的Token消耗总和' },
    ],
  },
  voice_records: {
    code: 'voice_records',
    name: '语音病历',
    description: '使用语音录音生成病历',
    priority: 'P0',
    color: '#10B981',
    metrics: [
      { code: 'daily_clinics', name: '日使用诊所数', unit: '个', type: 'absolute', description: '当日使用语音病历的诊所数' },
      { code: 'daily_doctors', name: '日使用医生数', unit: '个', type: 'absolute', description: '当日使用语音病历的医生数' },
      { code: 'generation_count', name: '病历生成次数', unit: '次', type: 'absolute', description: 'AI成功生成病历的次数' },
      { code: 'adoption_count', name: '采纳次数', unit: '次', type: 'absolute', description: '医生采纳语音病历的次数' },
      { code: 'adoption_rate', name: '采纳率', unit: '%', type: 'percentage', description: '采纳次数 / 病历生成次数' },
      { code: 'token_consumption', name: 'Token消耗', unit: '万', type: 'decimal', description: 'LLM调用的Token消耗总和' },
    ],
  },
  ai_tongue: {
    code: 'ai_tongue',
    name: 'AI舌象',
    description: '使用AI分析舌象图像',
    priority: 'P1',
    color: '#F59E0B',
    metrics: [
      { code: 'daily_clinics', name: '日使用诊所数', unit: '个', type: 'absolute', description: '当日使用AI舌象的诊所数' },
      { code: 'daily_doctors', name: '日使用医生数', unit: '个', type: 'absolute', description: '当日使用AI舌象的医生数' },
      { code: 'adoption_count', name: '采纳次数', unit: '次', type: 'absolute', description: '医生采纳舌象分析的次数' },
      { code: 'adoption_rate', name: '采纳率', unit: '%', type: 'percentage', description: '采纳次数 / 分析次数' },
    ],
  },
};

export const MODULE_LIST = Object.values(MODULES);
