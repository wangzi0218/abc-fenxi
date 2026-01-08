import React, { useMemo } from 'react';
import dayjs from 'dayjs';
import type { DailyMetric } from '../types';

interface MetricsTimePivotTableProps {
  metrics: DailyMetric[];
  onMetricSelect?: (metricName: string) => void;
  selectedMetric?: string;
}

interface PivotRow {
  metricName: string;
  unit: string;
  dateData: Record<string, { value: number; changeRate: number }>;
  avgValue: number;
  maxValue: number;
  minValue: number;
  trend: 'up' | 'down' | 'stable';
}

/**
 * 指标时间数据透视表组件
 * 将行表结构（每行一条记录）转换为列表结构（日期为列，指标为行）
 * 支持水平对比和趋势分析
 */
export const MetricsTimePivotTable: React.FC<MetricsTimePivotTableProps> = ({
  metrics,
  onMetricSelect,
  selectedMetric
}) => {
  const pivotData = useMemo(() => {
    if (!metrics.length) return [];

    // 第一步：按指标名称分组
    const metricsByName = new Map<string, DailyMetric[]>();
    metrics.forEach(m => {
      if (!metricsByName.has(m.metricName)) {
        metricsByName.set(m.metricName, []);
      }
      metricsByName.get(m.metricName)!.push(m);
    });

    // 第二步：按日期排序，获取唯一日期列表
    const allDates = new Set<string>();
    metrics.forEach(m => allDates.add(m.metricDate));
    // 注意：sortedDates在下面会通过useMemo重新计算并使用

    // 第三步：为每个指标构建数据透视行
    const pivotRows: PivotRow[] = [];
    metricsByName.forEach((metricValues, metricName) => {
      const unit = metricValues[0]?.metricUnit || '';
      const allValues: number[] = [];
      const dateData: Record<string, { value: number; changeRate: number }> = {};

      // 按日期构建数据映射
      metricValues.sort((a, b) => dayjs(a.metricDate).unix() - dayjs(b.metricDate).unix());
      metricValues.forEach((m, idx) => {
        const value = m.metricValue;
        allValues.push(value);
        
        // 计算环比
        let changeRate = 0;
        if (idx > 0) {
          const prevValue = metricValues[idx - 1].metricValue;
          changeRate = prevValue !== 0 ? ((value - prevValue) / prevValue) * 100 : 0;
        }

        dateData[m.metricDate] = { value, changeRate };
      });

      // 计算统计指标
      const avgValue = allValues.length > 0 
        ? allValues.reduce((a, b) => a + b, 0) / allValues.length 
        : 0;
      const maxValue = Math.max(...allValues);
      const minValue = Math.min(...allValues);

      // 判断趋势：比较后三天和前三天的平均值
      const recentDays = Math.min(3, metricValues.length);
      const recent = metricValues.slice(-recentDays).map(m => m.metricValue);
      const earlier = metricValues.slice(0, recentDays).map(m => m.metricValue);
      const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
      const earlierAvg = earlier.reduce((a, b) => a + b, 0) / earlier.length;
      
      let trend: 'up' | 'down' | 'stable' = 'stable';
      if (recentAvg > earlierAvg * 1.02) trend = 'up';
      else if (recentAvg < earlierAvg * 0.98) trend = 'down';

      pivotRows.push({
        metricName,
        unit,
        dateData,
        avgValue,
        maxValue,
        minValue,
        trend
      });
    });

    return pivotRows;
  }, [metrics]);

  const sortedDates = useMemo(() => {
    const dates = new Set<string>();
    metrics.forEach(m => dates.add(m.metricDate));
    return Array.from(dates).sort((a, b) => dayjs(a).unix() - dayjs(b).unix());
  }, [metrics]);

  if (!pivotData.length) {
    return <div className="text-center py-8 text-gray-400">暂无数据</div>;
  }

  return (
    <div className="space-y-6">
      {/* 表格：数据透视展示 */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b-2 border-gray-200 bg-gray-50/50">
              <th className="text-left py-4 px-4 font-bold text-gray-600 sticky left-0 bg-gray-50/50 z-10 min-w-[160px]">
                指标名称
              </th>
              <th className="text-center py-4 px-2 font-bold text-gray-400 text-xs">单位</th>
              {sortedDates.map(date => (
                <th 
                  key={date} 
                  className="text-center py-4 px-3 font-bold text-gray-600 text-xs min-w-[80px] bg-blue-50/30"
                >
                  <div className="font-bold text-gray-700">{dayjs(date).format('MM-DD')}</div>
                  <div className="text-[10px] text-gray-400 font-normal">
                    {dayjs(date).format('ddd').toUpperCase()}
                  </div>
                </th>
              ))}
              <th className="text-center py-4 px-3 font-bold text-gray-600 text-xs min-w-[100px]">
                周期平均
              </th>
              <th className="text-center py-4 px-3 font-bold text-gray-600 text-xs min-w-[100px]">
                峰值/谷值
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {pivotData.map((row) => (
              <tr 
                key={row.metricName}
                className={`hover:bg-blue-50/30 transition-colors cursor-pointer ${
                  selectedMetric === row.metricName ? 'bg-blue-50/50' : ''
                }`}
                onClick={() => onMetricSelect?.(row.metricName)}
              >
                {/* 指标名称列 */}
                <td className="text-left py-4 px-4 font-bold text-gray-900 sticky left-0 bg-white z-10">
                  <div className="flex items-start gap-1.5">
                    <div className="w-0.5 h-5 bg-blue-500 rounded-full opacity-0 transition-opacity flex-shrink-0" style={{ opacity: selectedMetric === row.metricName ? 1 : 0 }} />
                    <div className="flex-1">
                      <div className="font-bold text-gray-900 text-sm leading-tight">{row.metricName}</div>
                      <div className="text-[10px] text-gray-400 leading-tight">
                        {row.trend === 'up' ? (
                          <span className="text-green-600 font-bold">↑</span>
                        ) : row.trend === 'down' ? (
                          <span className="text-red-600 font-bold">↓</span>
                        ) : (
                          <span className="text-gray-500 font-bold">→</span>
                        )}
                      </div>
                    </div>
                  </div>
                </td>

                {/* 单位列 */}
                <td className="text-center py-4 px-2 text-gray-500 font-medium text-xs">
                  {row.unit}
                </td>

                {/* 日期数据列 */}
                {sortedDates.map(date => {
                  const data = row.dateData[date];
                  if (!data) return <td key={date} className="text-center py-4 px-3 text-gray-300">-</td>;

                  const isPositive = data.changeRate >= 0;
                  return (
                    <td 
                      key={date}
                      className="text-center py-4 px-3 bg-blue-50/10"
                    >
                      <div className="font-black text-gray-900">
                        {data.value.toFixed(row.unit === '%' ? 1 : 0)}
                      </div>
                      <div className={`text-[10px] font-bold mt-1 ${
                        isPositive 
                          ? data.changeRate === 0 ? 'text-gray-400' : 'text-green-600'
                          : 'text-red-600'
                      }`}>
                        {data.changeRate === 0 ? '基准' : isPositive ? '+' : ''}{data.changeRate.toFixed(1)}%
                      </div>
                    </td>
                  );
                })}

                {/* 周期平均 */}
                <td className="text-center py-4 px-3">
                  <div className="font-bold text-blue-900 text-lg">
                    {row.avgValue.toFixed(row.unit === '%' ? 1 : 0)}
                  </div>
                  <div className="text-[10px] text-blue-600 mt-1">平均值</div>
                </td>

                {/* 峰值/谷值 */}
                <td className="text-center py-4 px-3">
                  <div className="flex flex-col gap-1">
                    <div>
                      <div className="text-[10px] text-gray-400 mb-0.5">峰</div>
                      <div className="font-bold text-purple-900 text-sm">
                        {row.maxValue.toFixed(row.unit === '%' ? 1 : 0)}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-gray-400 mb-0.5">谷</div>
                      <div className="font-bold text-orange-900 text-sm">
                        {row.minValue.toFixed(row.unit === '%' ? 1 : 0)}
                      </div>
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 指标统计卡片组 - 第三段设计 */}
      {selectedMetric && pivotData.find(p => p.metricName === selectedMetric) && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
            <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
            </svg>
            {selectedMetric} - 详细分析
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {(() => {
              const row = pivotData.find(p => p.metricName === selectedMetric)!;
              const values = Object.values(row.dateData).map(d => d.value);
              const recentValues = values.slice(-3);
              const olderValues = values.slice(0, Math.max(1, values.length - 3));
              const recentAvg = recentValues.length > 0 ? recentValues.reduce((a, b) => a + b) / recentValues.length : 0;
              const olderAvg = olderValues.length > 0 ? olderValues.reduce((a, b) => a + b) / olderValues.length : 0;
              const overallTrend = ((recentAvg - olderAvg) / (olderAvg || 1)) * 100;

              return (
                <>
                  <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                    <p className="text-[10px] font-bold text-blue-600 uppercase mb-2">周期平均</p>
                    <p className="text-3xl font-black text-blue-900">{row.avgValue.toFixed(row.unit === '%' ? 1 : 0)}</p>
                    <p className="text-[10px] text-blue-600 mt-1">{row.unit}</p>
                  </div>

                  <div className="p-4 bg-purple-50 rounded-xl border border-purple-100">
                    <p className="text-[10px] font-bold text-purple-600 uppercase mb-2">周期峰值</p>
                    <p className="text-3xl font-black text-purple-900">{row.maxValue.toFixed(row.unit === '%' ? 1 : 0)}</p>
                    <p className="text-[10px] text-purple-600 mt-1">最高值</p>
                  </div>

                  <div className="p-4 bg-orange-50 rounded-xl border border-orange-100">
                    <p className="text-[10px] font-bold text-orange-600 uppercase mb-2">周期谷值</p>
                    <p className="text-3xl font-black text-orange-900">{row.minValue.toFixed(row.unit === '%' ? 1 : 0)}</p>
                    <p className="text-[10px] text-orange-600 mt-1">最低值</p>
                  </div>

                  <div className={`p-4 rounded-xl border ${
                    overallTrend > 0 
                      ? 'bg-green-50 border-green-100' 
                      : 'bg-red-50 border-red-100'
                  }`}>
                    <p className={`text-[10px] font-bold uppercase mb-2 ${
                      overallTrend > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {overallTrend > 0 ? '整体趋势' : '整体趋势'}
                    </p>
                    <p className={`text-3xl font-black ${
                      overallTrend > 0 ? 'text-green-900' : 'text-red-900'
                    }`}>
                      {overallTrend > 0 ? '↑' : '↓'} {Math.abs(overallTrend).toFixed(1)}%
                    </p>
                    <p className={`text-[10px] mt-1 ${
                      overallTrend > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {overallTrend > 0 ? '近期上升' : '近期下降'}
                    </p>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
};
