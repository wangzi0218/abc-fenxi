import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useDashboardStore } from './stores/dashboardStore';
import { MODULES, MODULE_LIST } from './types';
import { Card, Tabs } from './components/ui';
import { fetchMetrics, fetchFunnel, fetchModuleAverages, fetchProvinceData } from './services/api';
import { Loading, EmptyState, Badge } from './components/ui';
import { TrendChart, ComparisonChart } from './components/Charts';
import { MetricsTimePivotTable } from './components/MetricsTimePivotTable';
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
  const [secondaryChartMetric, setSecondaryChartMetric] = useState<string>('');
  const [insights, setInsights] = useState<string[]>([]);
  const [tableSearch, setTableSearch] = useState('');
  const [selectedSegment, setSelectedSegment] = useState<'all' | 'pharmacy' | 'clinic'>('all'); // 拍单入库的客群筛选
  const [provinceData, setProvinceData] = useState<any[]>([]); // 省份维度数据
  const [selectedPivotMetric, setSelectedPivotMetric] = useState<string>(''); // 透视表选中指标

  // 演示模式常量（后续可配置化）
  const isDemoMode = true;

  // 获取当前模块的所有指标名称
  // 对拍单入库模块，根据客群筛选过滤
  let displayMetrics = metrics;
  if (selectedModule === 'photo_inventory') {
    // 拍单入库模块根据客群筛选过滤
    const segmentSuffix = selectedSegment === 'all' ? '' : selectedSegment === 'pharmacy' ? '-药店' : '-诊所';
    displayMetrics = metrics.filter(m => {
      // 仅可以显示当前客群的指标
      if (selectedSegment === 'all') {
        // 展示三个客群的指标
        return m.metricName.includes('-') === false || m.metricName.includes('-药店') || m.metricName.includes('-诊所');
      } else {
        // 仅显示选中客群的指标
        return m.metricName.endsWith(segmentSuffix);
      }
    });
    // 转换指标名称，去掉客群后缀，为了在控件中正常显示
    displayMetrics = displayMetrics.map(m => ({
      ...m,
      metricName: m.metricName.replace(/-药店$|-诊所$/, '')
    }));
  }
  
  const metricNames = Array.from(new Set(displayMetrics.map(m => m.metricName)));

  // 为图表过滤数据
  const rawChartData = displayMetrics
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

      // 获取漯斗数据
      const funnelResp = await fetchFunnel(selectedModule, dateRange.startDate, dateRange.endDate);
      setFunnel(funnelResp.data);
      
      // 获取省份维度数据（为地图渲染告稆准备）
      const provinceResp = await fetchProvinceData(selectedModule, dateRange.startDate, dateRange.endDate);
      setProvinceData(provinceResp.data);
      
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
  }, [selectedModule, viewMode, dateRange]);

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

              {/* 功能操作 - 导出和其他操作将移到具体卡片内 */}
              <div className="flex items-center gap-3">
                {/* 预留位置供后续功能使用 */}
              </div>
          </div>
        </div>
      </div>

      {/* 二级导航栏 - 模块选择 + 维度筛选 */}
      <div className="sticky top-[72px] z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-3">
          {/* 第一行：模块导航 */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-gray-400 uppercase">模块</span>
            <div className="flex items-center gap-0.5">
              {MODULE_LIST.map((m, idx) => (
                <div key={m.code} className="flex items-center">
                  <button
                    onClick={() => setSelectedModule(m.code)}
                    className={`px-2.5 py-1.5 text-sm transition-all font-medium ${
                      selectedModule === m.code
                        ? 'text-blue-600 border-b-2 border-blue-600'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {m.name}
                  </button>
                  {idx < MODULE_LIST.length - 1 && <span className="text-gray-300 mx-0.5">/</span>}
                </div>
              ))}
            </div>
          </div>

          {/* 第二行：维度筛选 - 仅拍单入库显示 */}
          {selectedModule === 'photo_inventory' && (
            <div className="mt-3 pt-3 flex items-center gap-2">
              <span className="text-xs font-bold text-gray-400 uppercase">客群</span>
              <div className="flex items-center gap-0.5">
                {[
                  { value: 'all', label: '全部' },
                  { value: 'pharmacy', label: '药店' },
                  { value: 'clinic', label: '诊所' }
                ].map((seg, idx, arr) => (
                  <div key={seg.value} className="flex items-center">
                    <button
                      onClick={() => setSelectedSegment(seg.value as any)}
                      className={`px-2.5 py-1.5 text-sm transition-all font-medium ${
                        selectedSegment === seg.value
                          ? 'text-blue-600 border-b-2 border-blue-600'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      {seg.label}
                    </button>
                    {idx < arr.length - 1 && <span className="text-gray-300 mx-0.5">|</span>}
                  </div>
                ))}
              </div>
            </div>
          )}
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
                <Card 
                  title="核心指标多维实时观测" 
                  className="mb-6"
                  headerExtra={
                    <button
                      onClick={() => {
                        const csvHeader = ['指标名称', '最新观测值', '周期平均', '周期峰值', '周期谷值', '单位'].join(',');
                        const csvData = metricNames.map((name) => {
                          const metricData = displayMetrics.filter(m => m.metricName === name);
                          const latest = [...metricData].sort((a, b) => dayjs(b.metricDate).unix() - dayjs(a.metricDate).unix())[0];
                          const values = metricData.map(m => m.metricValue);
                          const avg = values.reduce((a, b) => a + b, 0) / (values.length || 1);
                          const max = Math.max(...values);
                          const min = Math.min(...values);
                          const unit = latest?.metricUnit || '';
                          return [name, latest?.metricValue.toFixed(unit === '%' ? 1 : 0), avg.toFixed(unit === '%' ? 1 : 0), max.toFixed(unit === '%' ? 1 : 0), min.toFixed(unit === '%' ? 1 : 0), unit].join(',');
                        }).join('\n');
                        
                        const csvContent = 'data:text/csv;charset=utf-8,' + encodeURIComponent([csvHeader, csvData].join('\n'));
                        const link = document.createElement('a');
                        link.setAttribute('href', csvContent);
                        link.setAttribute('download', `${selectedModule}_core_metrics_${dayjs(dateRange.startDate).format('YYYYMMDD')}_${dayjs(dateRange.endDate).format('YYYYMMDD')}.csv`);
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                      }}
                      className="px-3 py-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-1"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 16v-4m0 0V8m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      <span>导出</span>
                    </button>
                  }
                >
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="text-left border-b border-gray-100 bg-gray-50/50 hover:bg-gray-50/50">
                          <th className="py-4 px-4 text-sm font-bold text-gray-400 uppercase bg-gray-50/50 sticky left-0 z-10 hover:bg-gray-50/50">关键指标</th>
                          <th className="py-4 px-4 text-sm font-bold text-blue-600 text-center bg-blue-50/30 hover:bg-blue-50/30">最新观测值</th>
                          <th className="py-4 px-4 text-sm font-bold text-green-600 text-center bg-gray-50/50 hover:bg-gray-50/50">周期平均</th>
                          <th className="py-4 px-4 text-sm font-bold text-purple-600 text-center bg-gray-50/50 hover:bg-gray-50/50">周期峰值</th>
                          <th className="py-4 px-4 text-sm font-bold text-orange-600 text-center bg-gray-50/50 hover:bg-gray-50/50">周期谷值</th>
                          <th className="py-4 px-4 text-sm font-bold text-gray-500 text-right bg-gray-50/50 hover:bg-gray-50/50">单位</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {metricNames.map((name) => {
                          const metricData = displayMetrics.filter(m => m.metricName === name);
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

                {/* 2.5 省份分布展示 */}
                {provinceData.length > 0 && (
                  <Card title="省份使用分布与对标分析" className="mb-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {/* 左侧：省份排行表 */}
                      <div className="lg:col-span-1 max-h-[500px] overflow-y-auto custom-scrollbar">
                        <div className="space-y-2">
                          {provinceData.slice(0, 10).map((prov, idx) => (
                            <div key={prov.province} className="p-3 bg-gray-50 rounded-lg hover:bg-blue-50 transition-colors group">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-gray-400 text-xs w-6">#{idx + 1}</span>
                                  <span className="font-bold text-gray-900 text-sm">{prov.province}</span>
                                </div>
                                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded group-hover:bg-blue-100 transition-colors">
                                  {prov.percentage}%
                                </span>
                              </div>
                              <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                                <div 
                                  className="bg-gradient-to-r from-blue-500 to-blue-600 h-full transition-all duration-300" 
                                  style={{ width: `${prov.percentage}%` }} 
                                />
                              </div>
                              <div className="text-[10px] text-gray-400 mt-1 font-medium">
                                {prov.value.toLocaleString()} 使用次数
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* 右侧：统计卡片 + TOP 5 柱状图 */}
                      <div className="lg:col-span-2">
                        <div className="space-y-4">
                          {/* 统计概览卡片 */}
                          <div className="grid grid-cols-3 gap-3">
                            <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                              <p className="text-[10px] font-bold text-blue-600 uppercase mb-2">覆盖省份</p>
                              <p className="text-3xl font-black text-blue-900">{provinceData.length}</p>
                              <p className="text-[10px] text-blue-600 mt-1">个省份</p>
                            </div>
                            <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200">
                              <p className="text-[10px] font-bold text-purple-600 uppercase mb-2">总使用次数</p>
                              <p className="text-3xl font-black text-purple-900">
                                {(provinceData.reduce((sum: number, p: any) => sum + p.value, 0) / 1000).toFixed(1)}
                              </p>
                              <p className="text-[10px] text-purple-600 mt-1">千次</p>
                            </div>
                            <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200">
                              <p className="text-[10px] font-bold text-green-600 uppercase mb-2">人均使用</p>
                              <p className="text-3xl font-black text-green-900">
                                {(provinceData.reduce((sum: number, p: any) => sum + p.value, 0) / provinceData.length).toFixed(0)}
                              </p>
                              <p className="text-[10px] text-green-600 mt-1">次/省</p>
                            </div>
                          </div>

                          {/* TOP 5 柱状图 */}
                          <div className="p-4 bg-gray-50/50 rounded-xl border border-gray-200">
                            <h4 className="text-sm font-bold text-gray-900 mb-4">TOP 5 省份排行</h4>
                            <div className="space-y-3">
                              {provinceData.slice(0, 5).map((prov, idx) => {
                                const maxValue = provinceData[0].value;
                                const barWidth = (prov.value / maxValue) * 100;
                                return (
                                  <div key={prov.province}>
                                    <div className="flex items-center justify-between mb-1">
                                      <span className="text-xs font-bold text-gray-700 w-12">{prov.province}</span>
                                      <span className="text-xs font-bold text-gray-900">{prov.value.toLocaleString()}</span>
                                    </div>
                                    <div className="w-full bg-gray-200 h-3 rounded overflow-hidden">
                                      <div 
                                        className={`h-full transition-all duration-500 ${
                                          idx === 0 ? 'bg-blue-600' : 
                                          idx === 1 ? 'bg-blue-500' : 
                                          idx === 2 ? 'bg-blue-400' :
                                          idx === 3 ? 'bg-blue-300' : 'bg-blue-200'
                                        }`}
                                        style={{ width: `${barWidth}%` }}
                                      />
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                )}

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

                  {/* 4. 指标明细全量数据透视表 */}
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
                    <MetricsTimePivotTable 
                      metrics={displayMetrics.filter(m => 
                        m.metricName.includes(tableSearch) || 
                        m.metricDate.includes(tableSearch)
                      )}
                      selectedMetric={selectedPivotMetric}
                      onMetricSelect={setSelectedPivotMetric}
                    />
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
