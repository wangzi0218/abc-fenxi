import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useDashboardStore } from './stores/dashboardStore';
import { MODULES, MODULE_LIST } from './types';
import { Card, Button, Tabs } from './components/ui';
import { fetchMetrics, fetchFunnel, fetchModuleAverages } from './services/api';
import { Loading, EmptyState, Badge } from './components/ui';
import { TrendChart, ComparisonChart } from './components/Charts';
import { getMockInsights, getPredictiveMetrics } from './services/mockData';
import dayjs from 'dayjs';

// 简单的 Dashboard 页面
function DashboardPage() {
  const {
    selectedModule,
    setSelectedModule,
    viewMode,
    setViewMode,
    dateRange,
    setDateRange,
  } = useDashboardStore();

  const [metrics, setMetrics] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [funnel, setFunnel] = useState<any>(null);
  const [selectedChartMetric, setSelectedChartMetric] = useState<string>('');
  const [activeTab, setActiveTab] = useState('overview');
  const [comparisonResults, setComparisonResults] = useState<any[]>([]);
  const [averages, setAverages] = useState<any>(null);
  const [isDemoMode, setIsDemoMode] = useState(true);
  const [secondaryChartMetric, setSecondaryChartMetric] = useState<string>('');
  const [insights, setInsights] = useState<string[]>([]);
  const [tableSearch, setTableSearch] = useState('');

  // 获取当前模块的所有指标名称
  const metricNames = Array.from(new Set(metrics.map(m => m.metricName)));

  // 为图表过滤数据
  const rawChartData = metrics
    .filter(m => m.metricName === (selectedChartMetric || metricNames[0]))
    .sort((a, b) => dayjs(a.metricDate).unix() - dayjs(b.metricDate).unix());

  // 增加预测数据
  const chartData = rawChartData.length > 0 
    ? [...rawChartData, ...getPredictiveMetrics(rawChartData[rawChartData.length - 1], 5)]
    : [];

  // 获取对比指标数据
  const secondaryChartData = metrics
    .filter(m => m.metricName === secondaryChartMetric)
    .sort((a, b) => dayjs(a.metricDate).unix() - dayjs(b.metricDate).unix());

  // 加载数据
  const loadData = async () => {
    setLoading(true);
    try {
      // 获取指标数据
      const metricsResp = await fetchMetrics(
        selectedModule,
        dateRange.startDate,
        dateRange.endDate,
        viewMode as any,
        isDemoMode
      );
      const fetchedMetrics = metricsResp.data.metrics;
      setMetrics(fetchedMetrics);
      
      // 生成智能见解
      setInsights(getMockInsights(selectedModule, fetchedMetrics));
      
      // 获取平均值数据
      const avgResp = await fetchModuleAverages(selectedModule);
      setAverages(avgResp.data);

      // 默认选中第一个指标
      if (fetchedMetrics.length > 0) {
        const uniqueNames = Array.from(new Set(fetchedMetrics.map((m: any) => m.metricName)));
        if (!selectedChartMetric || !uniqueNames.includes(selectedChartMetric)) {
          setSelectedChartMetric(uniqueNames[0] as string);
        }
      }

      // 获取漏斗数据
      const funnelResp = await fetchFunnel(selectedModule, dateRange.startDate, dateRange.endDate);
      setFunnel(funnelResp.data);

      // 如果在对比页，加载对比数据
      if (activeTab === 'comparison') {
        loadComparisonData();
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  // 加载对比数据
  const loadComparisonData = async () => {
    const uniqueNames = Array.from(new Set(metrics.map((m: any) => m.metricName)));
    
    // 计算上一周期的范围
    const p2End = dayjs(dateRange.startDate).subtract(1, 'day').toDate();
    const p2Start = dayjs(p2End).subtract(dayjs(dateRange.endDate).diff(dateRange.startDate, 'day'), 'day').toDate();

    const results = await Promise.all(
      uniqueNames.slice(0, 8).map(async (name: any) => {
        const resp = await fetchMetrics(selectedModule, p2Start, p2End, viewMode as any, isDemoMode);
        const p2Metrics = resp.data.metrics.filter((m: any) => m.metricName === name);
        const p1Metrics = metrics.filter((m: any) => m.metricName === name);

        const p1Values = p1Metrics.map(m => m.metricValue);
        const p2Values = p2Metrics.map(m => m.metricValue);

        const p1Avg = p1Values.reduce((s, m) => s + m, 0) / (p1Values.length || 1);
        const p2Avg = p2Values.reduce((s, m) => s + m, 0) / (p2Values.length || 1);
        const p1Max = Math.max(...(p1Values.length ? p1Values : [0]));
        const p2Max = Math.max(...(p2Values.length ? p2Values : [0]));

        return {
          name,
          current: p1Avg,
          previous: p2Avg,
          currentMax: p1Max,
          previousMax: p2Max,
          change: p1Avg - p2Avg,
          changeRate: p2Avg !== 0 ? ((p1Avg - p2Avg) / p2Avg) * 100 : 0,
          stability: p1Values.length > 1 ? (1 - (Math.sqrt(p1Values.map(x => Math.pow(x - p1Avg, 2)).reduce((a, b) => a + b, 0) / p1Values.length) / p1Avg)) * 100 : 100
        };
      })
    );
    setComparisonResults(results);
  };

  // 智能粒度自适应
  useEffect(() => {
    const days = dayjs(dateRange.endDate).diff(dayjs(dateRange.startDate), 'day') + 1;
    if (days > 90 && viewMode !== 'month') {
      setViewMode('month');
    } else if (days > 31 && days <= 90 && viewMode === 'day') {
      setViewMode('week');
    }
  }, [dateRange]);

  // 初始加载及依赖加载
  useEffect(() => {
    loadData();
  }, [selectedModule, viewMode, dateRange, isDemoMode]);

  const module = MODULES[selectedModule];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 吸顶头部区域 */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <span className="bg-blue-600 text-white p-1.5 rounded-lg text-lg">AI</span>
              数据统计平台
            </h1>
          </div>
          
          <div className="flex flex-wrap items-center gap-4">
            {/* 模块切换 */}
            <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-xl shadow-inner">
              {MODULE_LIST.map((m) => (
                <button
                  key={m.code}
                  onClick={() => setSelectedModule(m.code)}
                  className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    selectedModule === m.code
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {m.name}
                </button>
              ))}
            </div>

            <div className="h-6 w-px bg-gray-300 hidden md:block" />

            {/* 时间控制 */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="flex bg-gray-100 p-1 rounded-xl relative group/cycle">
                  {['day', 'week', 'month'].map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setViewMode(mode as any)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        viewMode === mode
                          ? 'bg-white text-gray-900 shadow-sm'
                          : 'text-gray-400 hover:text-gray-600'
                      }`}
                    >
                      {mode === 'day' ? '日' : mode === 'week' ? '周' : '月'}
                    </button>
                  ))}
                  
                  {/* 周期逻辑悬浮解释 */}
                  <div className="absolute top-full left-0 mt-2 hidden group-hover/cycle:block w-64 p-3 bg-gray-900 text-white text-[10px] rounded-xl shadow-2xl z-[60] border border-white/10 backdrop-blur-md">
                    <p className="font-black mb-2 text-blue-400 border-b border-white/10 pb-1 flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      当前统计周期 (Cycle) 定义
                    </p>
                    <div className="space-y-2 opacity-90">
                      <p><span className="text-white font-bold">● 日模式:</span> 以 1 天为最小粒度。下方的“周期均值”即为选定日期范围内每天数值的平均值。</p>
                      <p><span className="text-white font-bold">● 周模式:</span> 以 7 天为最小粒度。系统将数据按周聚合，所有“周期”指标均指代“各周均值/峰值”。</p>
                      <p><span className="text-white font-bold">● 月模式:</span> 以 30 天为最小粒度。用于宏观趋势，周期定义为自然月跨度。</p>
                    </div>
                    <div className="absolute left-6 -top-1 w-2 h-2 bg-gray-900 rotate-45" />
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <input
                  type="date"
                  value={dayjs(dateRange.startDate).format('YYYY-MM-DD')}
                  onChange={(e) => setDateRange(dayjs(e.target.value).toDate(), dateRange.endDate)}
                  className="px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-gray-400">-</span>
                <input
                  type="date"
                  value={dayjs(dateRange.endDate).format('YYYY-MM-DD')}
                  onChange={(e) => setDateRange(dateRange.startDate, dayjs(e.target.value).toDate())}
                  className="px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="h-6 w-px bg-gray-300 hidden md:block" />

            {/* 功能操作 */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-gray-500">演示模式</span>
                <button
                  onClick={() => setIsDemoMode(!isDemoMode)}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 focus:outline-none ${
                    isDemoMode ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform duration-200 ${
                      isDemoMode ? 'translate-x-5' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              <Button size="sm" variant="outline" onClick={() => {
                const csvContent = "data:text/csv;charset=utf-8," 
                  + "指标名称,日期,数值,单位\n"
                  + metrics.map(m => `${m.metricName},${m.metricDate},${m.metricValue},${m.metricUnit}`).join("\n");
                const encodedUri = encodeURI(csvContent);
                const link = document.createElement("a");
                link.setAttribute("href", encodedUri);
                link.setAttribute("download", `${selectedModule}_metrics.csv`);
                document.body.appendChild(link);
                link.click();
              }}>导出报表</Button>
            </div>
          </div>
        </div>
      </div>

      {/* 主内容区 */}
      <div className="max-w-[1600px] w-full mx-auto p-4 sm:p-6 lg:p-8">
        <div className="mb-6">
          <Tabs
            activeTab={activeTab}
            onTabChange={(val) => {
              setActiveTab(val);
              if (val === 'comparison') loadComparisonData();
            }}
            tabs={[
              { label: '数据概览与分析', value: 'overview' },
              { label: '同环比对比分析', value: 'comparison' },
            ]}
          >
            {loading ? (
              <div className="flex justify-center py-24">
                <Loading />
              </div>
            ) : metrics.length === 0 ? (
              <EmptyState
                title="未获取到数据"
                description="请尝试调整统计周期或检查网络连接"
              />
            ) : activeTab === 'overview' ? (
              <div className="space-y-6">
                {/* 1. 模块定义 - 放在最前面 */}
                <Card title="模块概览与业务定义" className="border-l-4 border-l-blue-600">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="md:col-span-2">
                      <div className="flex items-center gap-3 mb-4">
                        <span className="text-2xl font-bold text-gray-900">{module.name}</span>
                      </div>
                      <p className="text-gray-600 text-lg leading-relaxed">{module.description}</p>
                    </div>
                    <div className="bg-blue-50/50 p-5 rounded-xl border border-blue-100">
                      <h4 className="text-sm font-bold text-blue-900 mb-4 flex items-center gap-2">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"></path></svg>
                        基准均值参考
                      </h4>
                      {averages && (
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-blue-700">7日平均水位</span>
                            <span className="text-lg font-black text-blue-900">
                              {averages.avg7d[0]?.value} <span className="text-xs font-normal">{averages.avg7d[0]?.unit}</span>
                            </span>
                          </div>
                          <div className="h-px bg-blue-200" />
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-blue-700">15日平均水位</span>
                            <span className="text-lg font-black text-blue-900">
                              {averages.avg15d[0]?.value} <span className="text-xs font-normal">{averages.avg15d[0]?.unit}</span>
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>

                {/* 2. 核心看板：全局 & 最新视野 - 优化为紧凑表格型布局 */}
                <Card title="核心指标多维实时观测" className="mb-6">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="text-left border-b border-gray-100">
                          <th className="py-4 px-4 text-sm font-bold text-gray-400 uppercase">关键指标</th>
                          <th className="py-4 px-4 text-sm font-bold text-blue-600 text-center bg-blue-50/30">最新观测值</th>
                          <th className="py-4 px-4 text-sm font-bold text-green-600 text-center">周期平均</th>
                          <th className="py-4 px-4 text-sm font-bold text-purple-600 text-center">周期峰值</th>
                          <th className="py-4 px-4 text-sm font-bold text-orange-600 text-center">周期谷值</th>
                          <th className="py-4 px-4 text-sm font-bold text-gray-500 text-right">单位</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {metricNames.map((name) => {
                          const metricData = metrics.filter(m => m.metricName === name);
                          const latest = [...metricData].sort((a, b) => dayjs(b.metricDate).unix() - dayjs(a.metricDate).unix())[0];
                          const values = metricData.map(m => m.metricValue);
                          const avg = values.reduce((a, b) => a + b, 0) / (values.length || 1);
                          const max = Math.max(...values);
                          const min = Math.min(...values);
                          const unit = latest?.metricUnit || '';
                          
                          // 获取指标定义
                          const metricDef = module.metrics.find(m => m.name === name);

                          return (
                            <tr key={name} className="hover:bg-gray-50/50 transition-colors group">
                              <td className="py-4 px-4">
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{name}</span>
                                  {metricDef && (
                                    <div className="group/tip relative">
                                      <svg className="w-3.5 h-3.5 text-gray-300 hover:text-blue-500 cursor-help" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                      <div className="absolute left-0 bottom-full mb-2 hidden group-hover/tip:block w-48 p-2 bg-gray-900 text-white text-[10px] rounded shadow-xl z-20 leading-relaxed">
                                        {metricDef.description}
                                        <div className="absolute left-4 top-full w-2 h-2 bg-gray-900 rotate-45 -translate-y-1" />
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </td>
                              <td className="py-4 px-4 text-center bg-blue-50/10">
                                <span className="text-xl font-black text-blue-900">{latest?.metricValue.toFixed(unit === '%' ? 1 : 0)}</span>
                              </td>
                              <td className="py-4 px-4 text-center">
                                <span className="text-lg font-bold text-green-700">{avg.toFixed(unit === '%' ? 1 : 0)}</span>
                              </td>
                              <td className="py-4 px-4 text-center">
                                <span className="text-lg font-bold text-purple-700">{max.toFixed(unit === '%' ? 1 : 0)}</span>
                              </td>
                              <td className="py-4 px-4 text-center">
                                <span className="text-lg font-bold text-orange-700">{min.toFixed(unit === '%' ? 1 : 0)}</span>
                              </td>
                              <td className="py-4 px-4 text-right text-gray-400 text-xs font-medium">{unit}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </Card>

                {/* 3. 详情钻取与趋势图 */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
                  <Card title="AI 智能归因分析摘要" className="lg:col-span-1 border-t-4 border-t-indigo-500">
                    <div className="space-y-4">
                      {insights.map((insight, idx) => (
                        <div key={idx} className="p-4 bg-indigo-50/30 rounded-xl border border-indigo-100 flex gap-3">
                          <div className="mt-1">
                            <div className="w-5 h-5 bg-indigo-600 rounded-full flex items-center justify-center text-white text-[10px] font-bold">
                              {idx + 1}
                            </div>
                          </div>
                          <p className="text-xs text-indigo-900 leading-relaxed font-medium">
                            {insight}
                          </p>
                        </div>
                      ))}
                      <div className="pt-4 border-t border-gray-100 mt-4">
                        <p className="text-[10px] text-gray-400 italic">
                          * 结论基于历史 15 天数据波动及 KPI 基准自动推导
                        </p>
                      </div>
                    </div>
                  </Card>

                  <Card title={`${selectedChartMetric || '指标'} 趋势归因与预测`} className="lg:col-span-3">
                    <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold text-gray-400 uppercase">当前观测指标</span>
                          <select
                            value={selectedChartMetric}
                            onChange={(e) => setSelectedChartMetric(e.target.value)}
                            className="bg-transparent font-bold text-gray-900 focus:outline-none cursor-pointer"
                          >
                            {metricNames.map((name: any) => (
                              <option key={name} value={name}>{name}</option>
                            ))}
                          </select>
                        </div>
                        <div className="w-px h-8 bg-gray-200" />
                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold text-orange-400 uppercase">对比归因指标 (Overlay)</span>
                          <select
                            value={secondaryChartMetric}
                            onChange={(e) => setSecondaryChartMetric(e.target.value)}
                            className="bg-transparent font-bold text-orange-600 focus:outline-none cursor-pointer"
                          >
                            <option value="">(不进行对比)</option>
                            {metricNames.filter(n => n !== selectedChartMetric).map((name: any) => (
                              <option key={name} value={name}>{name}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <Badge variant="warning">
                        <span className="flex items-center gap-1.5 px-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                          包含未来 5 天预测水位
                        </span>
                      </Badge>
                    </div>
                    {chartData.length > 0 ? (
                      <TrendChart 
                        data={chartData} 
                        unit={chartData[0]?.metricUnit}
                        secondaryData={secondaryChartMetric ? secondaryChartData : undefined}
                        secondaryName={secondaryChartMetric}
                      />
                    ) : (
                      <div className="h-[400px] flex items-center justify-center text-gray-400">请选择左侧指标进行多维分析</div>
                    )}
                  </Card>
                </div>

                  {/* 3. 业务场景转化漏斗 */}
                  {funnel && (
                    <Card title={`${module.name} 场景转化漏斗 (业务链路全分析)`} className="mb-6">
                      <div className="flex flex-col lg:flex-row items-stretch justify-between gap-4 py-8 px-4">
                        {funnel.funnel.map((step: any, idx: number) => (
                          <div key={idx} className="flex-1 flex items-center gap-4">
                            <div className="flex-1 bg-gradient-to-br from-blue-600 to-indigo-800 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden group hover:shadow-blue-200 transition-all duration-300">
                              <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-30 transition-opacity">
                                <span className="text-6xl font-black italic leading-none">{idx + 1}</span>
                              </div>
                              <p className="text-xs font-black opacity-70 mb-2 tracking-widest uppercase">{step.step}</p>
                              <div className="flex items-baseline gap-2">
                                <p className="text-3xl font-black">{step.count.toLocaleString()}</p>
                                <span className="text-sm opacity-60">次</span>
                              </div>
                              <div className="mt-4 w-full bg-white/20 h-2 rounded-full overflow-hidden">
                                <div className="bg-white h-full transition-all duration-1000" style={{ width: `${step.rate * 100}%` }} />
                              </div>
                              <div className="flex justify-between items-center mt-2">
                                <p className="text-xs font-bold">留存转化: {(step.rate * 100).toFixed(1)}%</p>
                                {idx > 0 && (
                                  <p className="text-[10px] opacity-60">环节损耗: {((funnel.funnel[idx-1].rate - step.rate) * 100).toFixed(1)}%</p>
                                )}
                              </div>
                            </div>
                            {idx < funnel.funnel.length - 1 && (
                              <div className="hidden lg:flex items-center text-blue-300">
                                <svg className="w-10 h-10 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 5l7 7-7 7M5 5l7 7-7 7" /></svg>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </Card>
                  )}

                  {/* 4. 指标明细全量列表 */}
                  <Card 
                    title={`${module.name} 指标明细全量历史回溯 (${dayjs(dateRange.startDate).format('MM.DD')} - ${dayjs(dateRange.endDate).format('MM.DD')})`}
                    headerExtra={
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="搜索指标或日期..."
                          value={tableSearch}
                          onChange={(e) => setTableSearch(e.target.value)}
                          className="pl-8 pr-4 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
                        />
                        <svg className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                      </div>
                    }
                  >
                    <div className="overflow-x-auto max-h-[400px] custom-scrollbar">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-gray-200 sticky top-0 bg-white z-10">
                            <th className="text-left py-3 px-6 font-bold text-gray-400 uppercase tracking-wider">统计日期</th>
                            <th className="text-left py-3 px-6 font-bold text-gray-400 uppercase tracking-wider">指标名称</th>
                            <th className="text-right py-3 px-6 font-bold text-gray-400 uppercase tracking-wider">观测数值</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {metrics
                            .filter(m => 
                              m.metricName.includes(tableSearch) || 
                              m.metricDate.includes(tableSearch)
                            )
                            .sort((a,b) => dayjs(b.metricDate).unix() - dayjs(a.metricDate).unix())
                            .map((metric, idx) => (
                              <tr key={idx} className={`hover:bg-blue-50/50 transition-colors ${selectedChartMetric === metric.metricName ? 'bg-blue-50/30' : ''}`}>
                                <td className="py-3 px-6 font-medium text-gray-500">{metric.metricDate}</td>
                                <td className="py-3 px-6 font-bold text-gray-900">{metric.metricName}</td>
                                <td className="py-3 px-6 text-right font-black">
                                  {metric.metricValue.toFixed(metric.metricUnit === '%' ? 1 : 0)}
                                  <span className="ml-1 text-[10px] font-normal text-gray-400">{metric.metricUnit}</span>
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  </Card>
                </div>
            ) : (
              // 4. 增强对比视图
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                  <Card className="lg:col-span-3" title={`${viewMode === 'day' ? '日环比' : viewMode === 'week' ? '周环比' : '月环比'} 走势深度对比`}>
                    <div className="h-[450px]">
                      <ComparisonChart data={comparisonResults} />
                    </div>
                  </Card>
                  <Card title="关键异动观察">
                    <div className="space-y-4">
                      <div className="p-4 bg-green-50/50 rounded-xl border border-green-100">
                        <p className="text-xs text-green-600 font-bold mb-1">本期增幅最快</p>
                        {comparisonResults.sort((a,b) => b.changeRate - a.changeRate)[0] && (
                          <div>
                            <p className="font-black text-gray-900 truncate">{comparisonResults.sort((a,b) => b.changeRate - a.changeRate)[0].name}</p>
                            <p className="text-xl text-green-700 font-black">+{comparisonResults.sort((a,b) => b.changeRate - a.changeRate)[0].changeRate.toFixed(1)}%</p>
                          </div>
                        )}
                      </div>
                      <div className="p-4 bg-red-50/50 rounded-xl border border-red-100">
                        <p className="text-xs text-red-600 font-bold mb-1">波动幅度最大</p>
                        {comparisonResults.sort((a,b) => Math.abs(b.changeRate) - Math.abs(a.changeRate))[0] && (
                          <div>
                            <p className="font-black text-gray-900 truncate">{comparisonResults.sort((a,b) => Math.abs(b.changeRate) - Math.abs(a.changeRate))[0].name}</p>
                            <p className="text-xl text-red-700 font-black">{comparisonResults.sort((a,b) => Math.abs(b.changeRate) - Math.abs(a.changeRate))[0].changeRate.toFixed(1)}%</p>
                          </div>
                        )}
                      </div>
                      <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100">
                        <p className="text-xs text-blue-600 font-bold mb-1">业务稳定性最佳</p>
                        {comparisonResults.sort((a,b) => b.stability - a.stability)[0] && (
                          <div>
                            <p className="font-black text-gray-900 truncate">{comparisonResults.sort((a,b) => b.stability - a.stability)[0].name}</p>
                            <p className="text-xl text-blue-700 font-black">{comparisonResults.sort((a,b) => b.stability - a.stability)[0].stability.toFixed(1)}%</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                </div>
                
                <Card title="多维环比数据全量矩阵">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b-4 border-gray-100">
                          <th className="text-left py-5 px-4 font-black text-gray-400 uppercase tracking-wider text-[10px]">核心指标</th>
                          <th className="text-right py-5 px-4 font-black text-blue-600 uppercase tracking-wider text-[10px] bg-blue-50/30">本期均值 ({viewMode === 'day' ? 'T' : viewMode === 'week' ? 'W' : 'M'})</th>
                          <th className="text-right py-5 px-4 font-black text-gray-500 uppercase tracking-wider text-[10px]">上期均值 ({viewMode === 'day' ? 'T-1' : viewMode === 'week' ? 'W-1' : 'M-1'})</th>
                          <th className="text-right py-5 px-4 font-black text-purple-600 uppercase tracking-wider text-[10px]">本期峰值</th>
                          <th className="text-right py-5 px-4 font-black text-gray-400 uppercase tracking-wider text-[10px]">业务稳定性</th>
                          <th className="text-right py-5 px-4 font-black text-gray-900 uppercase tracking-wider text-[10px]">环比波动</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {comparisonResults.map((res, idx) => (
                          <tr key={idx} className="hover:bg-gray-50 transition-all group">
                            <td className="py-5 px-4 text-gray-900 font-bold group-hover:text-blue-600 transition-colors text-sm">{res.name}</td>
                            <td className="py-5 px-4 text-right font-black text-blue-900 text-lg bg-blue-50/10">{res.current.toFixed(2)}</td>
                            <td className="py-5 px-4 text-right text-gray-500 font-bold text-sm">{res.previous.toFixed(2)}</td>
                            <td className="py-5 px-4 text-right text-purple-600 font-bold text-sm">{res.currentMax.toFixed(2)}</td>
                            <td className="py-5 px-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <div className="w-16 bg-gray-100 h-1.5 rounded-full overflow-hidden">
                                  <div className="bg-blue-500 h-full transition-all duration-500" style={{ width: `${Math.min(100, res.stability)}%` }} />
                                </div>
                                <span className="text-[10px] font-bold text-gray-400">{res.stability.toFixed(0)}%</span>
                              </div>
                            </td>
                            <td className="py-5 px-4 text-right">
                              <Badge variant={res.changeRate >= 0 ? 'success' : 'error'}>
                                <span className="font-black text-xs">
                                  {res.changeRate >= 0 ? '↑' : '↓'} {Math.abs(res.changeRate).toFixed(1)}%
                                </span>
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </div>
            )}
          </Tabs>
        </div>
      </div>
    </div>
  );
}

// 主应用
export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
      </Routes>
    </Router>
  );
}
