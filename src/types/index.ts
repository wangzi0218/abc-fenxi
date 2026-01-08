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
  dimensionType: 'none' | 'clinic' | 'doctor' | 'region' | 'segment';
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
      { code: 'deep_usage_clinic_count', name: '深度门店数', unit: '个', type: 'absolute', description: '拍单入库占比≥50%的门店数量' },
      { code: 'avg_recognition_accuracy', name: '平均识别正确率', unit: '%', type: 'percentage', description: '识别结果准确度' },
      { code: 'avg_matching_accuracy', name: '平均商品匹配正确率', unit: '%', type: 'percentage', description: '识别商品与库位匹配准确度' },
      { code: 'photo_confirm_rate', name: '照片确认转化率', unit: '%', type: 'percentage', description: '点击开始识别 / 点击拍照' },
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
      { code: 'usage_depth_3d', name: '日使用-连续3天使用医生数', unit: '人', type: 'absolute', description: 'AI病历连续3天使用的医生数' },
      { code: 'avg_usage_per_doctor', name: '日使用-人均次数', unit: '次', type: 'decimal', description: '日使用总次数 / 日使用医生数' },
      { code: 'adoption_diagnosis', name: '采纳情况-诊断/辩证采纳', unit: '%', type: 'percentage', description: '诊断结论采纳率' },
      { code: 'adoption_medicine_wm', name: '采纳情况-中西成药采纳', unit: '次', type: 'absolute', description: '中西成药采纳总次数' },
      { code: 'adoption_medicine_tc', name: '采纳情况-中药采纳', unit: '次', type: 'absolute', description: '中药采纳总次数' },
      { code: 'adoption_external', name: '采纳情况-外治采纳', unit: '次', type: 'absolute', description: '外治项目采纳总次数' },
      { code: 'medicine_match_rate', name: '药品匹配率', unit: '%', type: 'percentage', description: '推荐药品与诊所药库匹配率' },
      { code: 'model_switch_tc', name: '治疗模型切换统计-中医', unit: '次', type: 'absolute', description: '切换为中医模型或首选中医后的采纳次数' },
      { code: 'model_switch_wm', name: '治疗模型切换统计-西医', unit: '次', type: 'absolute', description: '切换为西医模型或首选西医后的采纳次数' },
      { code: 'open_user_count', name: '开放用户数', unit: '人', type: 'absolute', description: '有权限使用过AI诊疗的用户数' },
      { code: 'open_user_rate', name: '开放用户占比', unit: '%', type: 'percentage', description: '有权限用户 / 全部用户' },
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
  pre_consultation: {
    code: 'pre_consultation',
    name: '预问诊',
    description: '患者在线挂号后的AI预问诊引导',
    priority: 'P1',
    color: '#8B5CF6',
    metrics: [
      { code: 'open_clinic_count', name: '开放门店数', unit: '个', type: 'absolute', description: '开放了预问诊功能的门店数量' },
      { code: 'active_doctor_count', name: '开方用户数', unit: '人', type: 'absolute', description: '开放了本功能的医生数量' },
      { code: 'active_clinic_count', name: '活跃门店数', unit: '个', type: 'absolute', description: '每天完成一次预问诊的门店数' },
      { code: 'completion_rate', name: '完成转化率', unit: '%', type: 'percentage', description: '完成预问诊人数 / 进入预问诊人数' },
      { code: 'daily_trigger_count', name: '每日触发预问诊数', unit: '次', type: 'absolute', description: '线上挂号患者触发预问诊消息人数' },
    ],
  },
  test_recommendation: {
    code: 'test_recommendation',
    name: '检验项目推荐',
    description: '基于主诉和病史推荐检验项目',
    priority: 'P2',
    color: '#EC4899',
    metrics: [
      { code: 'active_doctor_count', name: '使用医生数', unit: '人', type: 'absolute', description: '当天至少使用了1次本功能的医生数量' },
      { code: 'recommend_count', name: '推荐次数', unit: '次', type: 'absolute', description: '触发检验项目推荐的次数' },
      { code: 'order_count', name: '开出推荐项目次数', unit: '次', type: 'absolute', description: '从推荐项目中选择项目开出的次数' },
      { code: 'recommend_order_rate', name: '推荐开出率', unit: '%', type: 'percentage', description: '开出推荐项目次数 / 推荐次数' },
    ],
  },
  test_interpretation: {
    code: 'test_interpretation',
    name: '检验报告解读',
    description: 'AI辅助医生和患者解读检验报告',
    priority: 'P2',
    color: '#06B6D4',
    metrics: [
      { code: 'analyzed_report_count', name: '分析报告数量', unit: '份', type: 'absolute', description: '完成检验报告分析的报告数量' },
      { code: 'view_detail_count', name: '查看报告详情次数', unit: '次', type: 'absolute', description: '点击查看详情的医生人数' },
      { code: 'view_rate', name: '查看率', unit: '%', type: 'percentage', description: '查看次数 / 分析数量' },
    ],
  },
};

export const MODULE_LIST = Object.values(MODULES);
