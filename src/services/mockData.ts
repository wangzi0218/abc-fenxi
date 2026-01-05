import dayjs from 'dayjs';
import type { DailyMetric, FunnelData, ComparisonResult } from '../types';
import { MODULES } from '../types';

/**
 * Mock 数据生成器
 * 生成指定日期范围的模拟指标数据
 */

// 生成随机数
function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// 生成随机百分比 (0-100)
function getRandomPercentage(): number {
  return Math.round(Math.random() * 100 * 100) / 100;
}

// 生成随机 Token 消耗
function getRandomTokenConsumption(): number {
  return Math.round(Math.random() * 500 * 100) / 100;
}

/**
 * 为日期生成指标数据
 */
function generateMetricsForDate(date: string, moduleCode: string): DailyMetric[] {
  const module = MODULES[moduleCode];
  if (!module) return [];

  const metrics: DailyMetric[] = [];

  // 根据模块生成对应的指标
  if (moduleCode === 'photo_inventory') {
    metrics.push(
      { moduleCode, metricName: '开放门店数', metricDate: date, metricValue: getRandomInt(150, 300), metricUnit: '个', dimensionType: 'none' },
      { moduleCode, metricName: '开放门店占比', metricDate: date, metricValue: getRandomPercentage(), metricUnit: '%', dimensionType: 'none' },
      { moduleCode, metricName: '活跃门店数', metricDate: date, metricValue: getRandomInt(100, 250), metricUnit: '个', dimensionType: 'none' },
      { moduleCode, metricName: '活跃率', metricDate: date, metricValue: getRandomPercentage(), metricUnit: '%', dimensionType: 'none' },
      { moduleCode, metricName: '平均识别正确率', metricDate: date, metricValue: getRandomInt(80, 99), metricUnit: '%', dimensionType: 'none' },
      { moduleCode, metricName: '完成入库转化率', metricDate: date, metricValue: getRandomPercentage(), metricUnit: '%', dimensionType: 'none' }
    );
  } else if (moduleCode === 'ai_diagnosis') {
    metrics.push(
      { moduleCode, metricName: '日使用诊所数', metricDate: date, metricValue: getRandomInt(200, 400), metricUnit: '个', dimensionType: 'none' },
      { moduleCode, metricName: '日使用医生数', metricDate: date, metricValue: getRandomInt(500, 1000), metricUnit: '个', dimensionType: 'none' },
      { moduleCode, metricName: '诊所活跃率', metricDate: date, metricValue: getRandomPercentage(), metricUnit: '%', dimensionType: 'none' },
      { moduleCode, metricName: '医生活跃率', metricDate: date, metricValue: getRandomPercentage(), metricUnit: '%', dimensionType: 'none' },
      { moduleCode, metricName: '采纳率', metricDate: date, metricValue: getRandomInt(60, 95), metricUnit: '%', dimensionType: 'none' },
      { moduleCode, metricName: 'Token消耗', metricDate: date, metricValue: getRandomTokenConsumption(), metricUnit: '万', dimensionType: 'none' }
    );
  } else if (moduleCode === 'voice_records') {
    metrics.push(
      { moduleCode, metricName: '日使用诊所数', metricDate: date, metricValue: getRandomInt(150, 350), metricUnit: '个', dimensionType: 'none' },
      { moduleCode, metricName: '日使用医生数', metricDate: date, metricValue: getRandomInt(400, 800), metricUnit: '个', dimensionType: 'none' },
      { moduleCode, metricName: '病历生成次数', metricDate: date, metricValue: getRandomInt(1000, 3000), metricUnit: '次', dimensionType: 'none' },
      { moduleCode, metricName: '采纳次数', metricDate: date, metricValue: getRandomInt(800, 2500), metricUnit: '次', dimensionType: 'none' },
      { moduleCode, metricName: '采纳率', metricDate: date, metricValue: getRandomInt(70, 95), metricUnit: '%', dimensionType: 'none' },
      { moduleCode, metricName: 'Token消耗', metricDate: date, metricValue: getRandomTokenConsumption(), metricUnit: '万', dimensionType: 'none' }
    );
  } else if (moduleCode === 'ai_tongue') {
    metrics.push(
      { moduleCode, metricName: '日使用诊所数', metricDate: date, metricValue: getRandomInt(100, 250), metricUnit: '个', dimensionType: 'none' },
      { moduleCode, metricName: '日使用医生数', metricDate: date, metricValue: getRandomInt(300, 600), metricUnit: '个', dimensionType: 'none' },
      { moduleCode, metricName: '采纳次数', metricDate: date, metricValue: getRandomInt(500, 1500), metricUnit: '次', dimensionType: 'none' },
      { moduleCode, metricName: '采纳率', metricDate: date, metricValue: getRandomInt(60, 90), metricUnit: '%', dimensionType: 'none' }
    );
  }

  return metrics;
}

/**
 * 获取指定日期范围内的指标数据
 */
export function getMockMetrics(
  moduleCode: string,
  startDate: Date,
  endDate: Date,
  period: 'day' | 'week' | 'month' = 'day',
  useStatic: boolean = false
): DailyMetric[] {
  const metrics: DailyMetric[] = [];
  let current = dayjs(startDate);
  const end = dayjs(endDate);

  // 如果使用静态数据，则返回固定逻辑生成的数据

  while (!current.isAfter(end)) {
    const dateStr = current.format('YYYY-MM-DD');
    let dayMetrics: DailyMetric[];
    
    if (useStatic) {
      // 简单的伪随机逻辑，保证每次日期相同生成的数据相同
      const dayDiff = current.diff(dayjs('2024-01-01'), 'day');
      const mockValue = (base: number) => base + Math.sin(dayDiff * 0.5) * (base * 0.2);
      
      // 针对不同模块生成相对固定的静态数据
      dayMetrics = generateStaticMetricsForDate(dateStr, moduleCode, mockValue);
    } else {
      dayMetrics = generateMetricsForDate(dateStr, moduleCode);
    }
    
    metrics.push(...dayMetrics);

    if (period === 'day') {
      current = current.add(1, 'day');
    } else if (period === 'week') {
      current = current.add(7, 'day');
    } else if (period === 'month') {
      current = current.add(30, 'day');
    }
  }

  return metrics;
}

/**
 * 生成静态指标数据
 */
function generateStaticMetricsForDate(date: string, moduleCode: string, mockFn: (base: number) => number): DailyMetric[] {
  const module = MODULES[moduleCode];
  if (!module) return [];

  const metrics: DailyMetric[] = [];
  if (moduleCode === 'photo_inventory') {
    metrics.push(
      { moduleCode, metricName: '开放门店数', metricDate: date, metricValue: Math.round(mockFn(200)), metricUnit: '个', dimensionType: 'none' },
      { moduleCode, metricName: '开放门店占比', metricDate: date, metricValue: Math.round(mockFn(85)), metricUnit: '%', dimensionType: 'none' },
      { moduleCode, metricName: '活跃门店数', metricDate: date, metricValue: Math.round(mockFn(180)), metricUnit: '个', dimensionType: 'none' },
      { moduleCode, metricName: '活跃率', metricDate: date, metricValue: Math.round(mockFn(90)), metricUnit: '%', dimensionType: 'none' },
      { moduleCode, metricName: '平均识别正确率', metricDate: date, metricValue: Math.round(mockFn(95)), metricUnit: '%', dimensionType: 'none' },
      { moduleCode, metricName: '完成入库转化率', metricDate: date, metricValue: Math.round(mockFn(70)), metricUnit: '%', dimensionType: 'none' }
    );
  } else if (moduleCode === 'ai_diagnosis') {
    metrics.push(
      { moduleCode, metricName: '日使用诊所数', metricDate: date, metricValue: Math.round(mockFn(300)), metricUnit: '个', dimensionType: 'none' },
      { moduleCode, metricName: '日使用医生数', metricDate: date, metricValue: Math.round(mockFn(850)), metricUnit: '个', dimensionType: 'none' },
      { moduleCode, metricName: '诊所活跃率', metricDate: date, metricValue: Math.round(mockFn(75)), metricUnit: '%', dimensionType: 'none' },
      { moduleCode, metricName: '医生活跃率', metricDate: date, metricValue: Math.round(mockFn(65)), metricUnit: '%', dimensionType: 'none' },
      { moduleCode, metricName: '采纳率', metricDate: date, metricValue: Math.round(mockFn(82)), metricUnit: '%', dimensionType: 'none' },
      { moduleCode, metricName: 'Token消耗', metricDate: date, metricValue: Math.round(mockFn(120)), metricUnit: '万', dimensionType: 'none' }
    );
  } else if (moduleCode === 'voice_records') {
    metrics.push(
      { moduleCode, metricName: '日使用诊所数', metricDate: date, metricValue: Math.round(mockFn(250)), metricUnit: '个', dimensionType: 'none' },
      { moduleCode, metricName: '日使用医生数', metricDate: date, metricValue: Math.round(mockFn(600)), metricUnit: '个', dimensionType: 'none' },
      { moduleCode, metricName: '病历生成次数', metricDate: date, metricValue: Math.round(mockFn(2200)), metricUnit: '次', dimensionType: 'none' },
      { moduleCode, metricName: '采纳次数', metricDate: date, metricValue: Math.round(mockFn(1900)), metricUnit: '次', dimensionType: 'none' },
      { moduleCode, metricName: '采纳率', metricDate: date, metricValue: Math.round(mockFn(86)), metricUnit: '%', dimensionType: 'none' },
      { moduleCode, metricName: 'Token消耗', metricDate: date, metricValue: Math.round(mockFn(150)), metricUnit: '万', dimensionType: 'none' }
    );
  } else if (moduleCode === 'ai_tongue') {
    metrics.push(
      { moduleCode, metricName: '日使用诊所数', metricDate: date, metricValue: Math.round(mockFn(150)), metricUnit: '个', dimensionType: 'none' },
      { moduleCode, metricName: '日使用医生数', metricDate: date, metricValue: Math.round(mockFn(450)), metricUnit: '个', dimensionType: 'none' },
      { moduleCode, metricName: '采纳次数', metricDate: date, metricValue: Math.round(mockFn(1200)), metricUnit: '次', dimensionType: 'none' },
      { moduleCode, metricName: '采纳率', metricDate: date, metricValue: Math.round(mockFn(78)), metricUnit: '%', dimensionType: 'none' }
    );
  }
  return metrics;
}

/**
 * 智能归因分析：基于数据生成业务见解
 */
export function getMockInsights(_moduleCode: string, metrics: DailyMetric[]) {
  const insights: string[] = [];
  const metricNames = Array.from(new Set(metrics.map(m => m.metricName)));
  
  metricNames.forEach(name => {
    const data = metrics.filter(m => m.metricName === name).sort((a,b) => dayjs(a.metricDate).unix() - dayjs(b.metricDate).unix());
    if (data.length < 5) return;
    
    const latest = data[data.length - 1].metricValue;
    const values = data.map(v => v.metricValue);
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    const changeRate = ((latest - avg) / (avg || 1)) * 100;

    // 均值偏离检测 (替代 KPI)
    if (Math.abs(changeRate) > 20) {
      insights.push(`指标 [${name}] 当前观测值显著${changeRate > 0 ? '高于' : '低于'}周期水位 (${Math.abs(changeRate).toFixed(1)}%)，可能存在业务异动。`);
    }
  });

  // 趋势研判
  if (insights.length < 2) {
    insights.push("当前模块整体波动率处于 ±15% 正常观测区间，业务运行稳健。");
    insights.push("建议持续关注核心链路转化率，目前长周期走势趋于平缓。");
  }

  return insights.slice(0, 3);
}

/**
 * 获取指标预测数据 (模拟未来3-5天)
 */
export function getPredictiveMetrics(lastMetric: DailyMetric, days: number = 5): DailyMetric[] {
  const predictions: DailyMetric[] = [];
  const lastDate = dayjs(lastMetric.metricDate);
  const baseValue = lastMetric.metricValue;
  
  for (let i = 1; i <= days; i++) {
    // 模拟略微上升或震荡的趋势
    const noise = (Math.random() - 0.3) * (baseValue * 0.05); 
    predictions.push({
      ...lastMetric,
      metricDate: lastDate.add(i, 'day').format('YYYY-MM-DD'),
      metricValue: Math.max(0, baseValue + noise),
      isPrediction: true // 标记为预测数据
    });
  }
  return predictions;
}

/**
 * 获取模块的平均指标 (7天/15天)
 */
export function getMockModuleAverages(moduleCode: string) {
  const now = dayjs();
  const d7Metrics = getMockMetrics(moduleCode, now.subtract(7, 'day').toDate(), now.toDate(), 'day', true);
  const d15Metrics = getMockMetrics(moduleCode, now.subtract(15, 'day').toDate(), now.toDate(), 'day', true);

  const calculateAvg = (data: DailyMetric[]) => {
    const groups: Record<string, { sum: number; count: number; unit: string }> = {};
    data.forEach(m => {
      if (!groups[m.metricName]) groups[m.metricName] = { sum: 0, count: 0, unit: m.metricUnit };
      groups[m.metricName].sum += m.metricValue;
      groups[m.metricName].count += 1;
    });

    return Object.keys(groups).map(name => ({
      name,
      value: Math.round((groups[name].sum / groups[name].count) * 100) / 100,
      unit: groups[name].unit
    }));
  };

  return {
    avg7d: calculateAvg(d7Metrics),
    avg15d: calculateAvg(d15Metrics)
  };
}

/**
 * 获取单一指标的趋势数据
 */
export function getMockMetricTrend(
  moduleCode: string,
  metricName: string,
  startDate: Date,
  endDate: Date
): DailyMetric[] {
  const allMetrics = getMockMetrics(moduleCode, startDate, endDate, 'day');
  return allMetrics.filter(m => m.metricName === metricName);
}

/**
 * 生成对比分析数据
 */
export function getMockComparison(
  moduleCode: string,
  metricName: string,
  period1Start: Date,
  period1End: Date,
  period2Start: Date,
  period2End: Date
): ComparisonResult {
  const period1Metrics = getMockMetrics(moduleCode, period1Start, period1End, 'day');
  const period2Metrics = getMockMetrics(moduleCode, period2Start, period2End, 'day');

  // 计算平均值
  const period1Avg =
    period1Metrics
      .filter(m => m.metricName === metricName)
      .reduce((sum, m) => sum + m.metricValue, 0) / 
    (period1Metrics.filter(m => m.metricName === metricName).length || 1);

  const period2Avg =
    period2Metrics
      .filter(m => m.metricName === metricName)
      .reduce((sum, m) => sum + m.metricValue, 0) / 
    (period2Metrics.filter(m => m.metricName === metricName).length || 1);

  const change = period1Avg - period2Avg;
  const changeRate = period2Avg !== 0 ? (change / period2Avg) * 100 : 0;

  return {
    period1Value: Math.round(period1Avg * 100) / 100,
    period2Value: Math.round(period2Avg * 100) / 100,
    change: Math.round(change * 100) / 100,
    changeRate: Math.round(changeRate * 100) / 100,
    trend: change > 0 ? 'up' : change < 0 ? 'down' : 'neutral',
  };
}

/**
 * 生成转化漏斗数据
 */
export function getMockFunnelData(moduleCode: string, startDate?: Date): FunnelData {
  // 基于日期的随机偏移量，模拟不同時间段转化率的波动
  const dateSeed = startDate ? dayjs(startDate).unix() % 100 : 0;
  const variance = (Math.sin(dateSeed) + 1) / 2 * 0.1; // 0% - 10% 的波动

  const funnels: Record<string, FunnelData> = {
    photo_inventory: {
      funnel: [
        { step: '发起拍摄 (扫码/入口点击)', count: 2000, rate: 1 },
        { step: '有效上传 (图像质量合格)', count: Math.round(1840 * (1 - variance * 0.2)), rate: 0.92 - variance * 0.1 },
        { step: 'AI 识别完成 (解析出库/单据)', count: Math.round(1710 * (1 - variance * 0.5)), rate: 0.855 - variance * 0.2 },
        { step: '人工确认/修改 (核对数据)', count: Math.round(1580 * (1 - variance)), rate: 0.79 - variance * 0.3 },
        { step: '正式入库完成 (完成单据落地)', count: Math.round(1420 * (1 - variance * 1.5)), rate: 0.71 - variance * 0.5 },
      ],
    },
    ai_diagnosis: {
      funnel: [
        { step: '进入 AI 诊疗 (打开辅助界面)', count: 3500, rate: 1 },
        { step: '获取诊断建议 (触发 LLM 请求)', count: Math.round(3150 * (1 - variance * 0.3)), rate: 0.9 - variance * 0.1 },
        { step: '查看诊断详情 (点击二级分析)', count: Math.round(2800 * (1 - variance * 0.7)), rate: 0.8 - variance * 0.2 },
        { step: '采纳诊断结果 (填充至病历/处方)', count: Math.round(2450 * (1 - variance * 1.2)), rate: 0.7 - variance * 0.4 },
      ],
    },
    voice_records: {
      funnel: [
        { step: '打开录音组件', count: 2500, rate: 1 },
        { step: '完成有效录音 (>3秒)', count: Math.round(2125 * (1 - variance * 0.4)), rate: 0.85 - variance * 0.1 },
        { step: '病历文本生成成功', count: Math.round(1950 * (1 - variance * 0.8)), rate: 0.78 - variance * 0.2 },
        { step: '修正/编辑病历', count: Math.round(1820 * (1 - variance * 1.1)), rate: 0.728 - variance * 0.3 },
        { step: '采纳病历落地', count: Math.round(1680 * (1 - variance * 1.4)), rate: 0.672 - variance * 0.4 },
      ],
    },
    ai_tongue: {
      funnel: [
        { step: '开启舌象拍摄', count: 1500, rate: 1 },
        { step: '图像上传成功', count: Math.round(1425 * (1 - variance * 0.2)), rate: 0.95 - variance * 0.1 },
        { step: 'AI 识别分析完成', count: Math.round(1275 * (1 - variance * 0.6)), rate: 0.85 - variance * 0.2 },
        { step: '生成舌诊分析报告', count: Math.round(1140 * (1 - variance * 0.9)), rate: 0.76 - variance * 0.3 },
        { step: '患者端/医生端查看', count: Math.round(960 * (1 - variance * 1.3)), rate: 0.64 - variance * 0.4 },
      ],
    },
  };

  const selectedFunnel = funnels[moduleCode] || funnels.ai_diagnosis;
  
  // 确保 rate 保持两位小数且不小于 0
  selectedFunnel.funnel = selectedFunnel.funnel.map(step => ({
    ...step,
    rate: Math.max(0, Math.round(step.rate * 1000) / 1000)
  }));

  return selectedFunnel;
}

/**
 * 获取所有模块的概览数据
 */
export function getMockModuleOverview(date: Date) {
  const dateStr = dayjs(date).format('YYYY-MM-DD');
  const overview: Record<string, any> = {};

  Object.keys(MODULES).forEach(moduleCode => {
    const metrics = generateMetricsForDate(dateStr, moduleCode);
    overview[moduleCode] = metrics;
  });

  return overview;
}
