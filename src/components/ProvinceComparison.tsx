/**
 * 省份时间对标分析组件
 * 显示本期 vs 上期省份数据的对比
 */

import React from 'react';

interface ProvinceComparisonProps {
  currentData: Array<{ province: string; value: number; percentage: number }>;
  previousData: Array<{ province: string; value: number; percentage: number }>;
  title?: string;
}

export const ProvinceComparison: React.FC<ProvinceComparisonProps> = ({
  currentData,
  previousData,
  title = '省份本期 vs 上期对标分析',
}) => {
  // 计算对标数据
  const comparisonList = currentData.map(current => {
    const previous = previousData.find(p => p.province === current.province);
    const prevValue = previous?.value || 0;
    const change = current.value - prevValue;
    const changeRate = prevValue !== 0 ? (change / prevValue) * 100 : 0;

    return {
      province: current.province,
      currentValue: current.value,
      previousValue: prevValue,
      change,
      changeRate,
      currentPercentage: current.percentage,
      previousPercentage: previous?.percentage || 0,
      percentageChange: current.percentage - (previous?.percentage || 0),
    };
  });

  // 按环比排序
  const sortedByChange = [...comparisonList].sort((a, b) => b.changeRate - a.changeRate);
  const topGrowth = sortedByChange.slice(0, 3);
  const topDecline = sortedByChange.slice(-3).reverse();

  return (
    <div className="space-y-6">
      {/* 标题 */}
      <div>
        <h3 className="text-lg font-bold text-gray-900">{title}</h3>
        <p className="text-sm text-gray-500 mt-1">
          对比周期内各省份使用数据的变化趋势，帮助识别增长/衰退关键地域
        </p>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* 总体环比 */}
        <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200">
          <p className="text-xs font-bold text-blue-600 uppercase mb-2">平均环比</p>
          <p className="text-3xl font-black text-blue-900">
            {(comparisonList.reduce((sum, item) => sum + item.changeRate, 0) / comparisonList.length).toFixed(1)}%
          </p>
          <p className="text-xs text-blue-600 mt-2">全省平均</p>
        </div>

        {/* 增长城市数 */}
        <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200">
          <p className="text-xs font-bold text-green-600 uppercase mb-2">增长城市</p>
          <p className="text-3xl font-black text-green-900">
            {comparisonList.filter(item => item.changeRate > 0).length}
          </p>
          <p className="text-xs text-green-600 mt-2">个省份</p>
        </div>

        {/* 下降城市数 */}
        <div className="p-4 bg-gradient-to-br from-red-50 to-red-100 rounded-xl border border-red-200">
          <p className="text-xs font-bold text-red-600 uppercase mb-2">下降城市</p>
          <p className="text-3xl font-black text-red-900">
            {comparisonList.filter(item => item.changeRate < 0).length}
          </p>
          <p className="text-xs text-red-600 mt-2">个省份</p>
        </div>

        {/* 稳定城市数 */}
        <div className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200">
          <p className="text-xs font-bold text-gray-600 uppercase mb-2">稳定城市</p>
          <p className="text-3xl font-black text-gray-900">
            {comparisonList.filter(item => Math.abs(item.changeRate) <= 5).length}
          </p>
          <p className="text-xs text-gray-600 mt-2">个省份</p>
        </div>
      </div>

      {/* TOP 增长与衰退 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* TOP 3 增长 */}
        <div className="p-4 bg-green-50/50 rounded-xl border border-green-200">
          <h4 className="text-sm font-bold text-green-900 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
            </svg>
            TOP 3 增长省份
          </h4>
          <div className="space-y-3">
            {topGrowth.map((item, idx) => (
              <div key={item.province} className="flex items-center justify-between p-3 bg-white rounded-lg">
                <div className="flex items-center gap-3 flex-1">
                  <span className="font-bold text-green-600 text-lg">#{idx + 1}</span>
                  <span className="font-bold text-gray-900">{item.province}</span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-green-700">
                    +{item.change.toLocaleString()}
                  </p>
                  <p className="text-xs text-green-600">
                    +{item.changeRate.toFixed(1)}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* TOP 3 衰退 */}
        <div className="p-4 bg-red-50/50 rounded-xl border border-red-200">
          <h4 className="text-sm font-bold text-red-900 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" />
            </svg>
            TOP 3 衰退省份
          </h4>
          <div className="space-y-3">
            {topDecline.map((item, idx) => (
              <div key={item.province} className="flex items-center justify-between p-3 bg-white rounded-lg">
                <div className="flex items-center gap-3 flex-1">
                  <span className="font-bold text-red-600 text-lg">#{idx + 1}</span>
                  <span className="font-bold text-gray-900">{item.province}</span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-red-700">
                    {item.change.toLocaleString()}
                  </p>
                  <p className="text-xs text-red-600">
                    {item.changeRate.toFixed(1)}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 完整对标表格 */}
      <div className="p-4 bg-gray-50/50 rounded-xl border border-gray-200">
        <h4 className="text-sm font-bold text-gray-900 mb-4">全省份对标数据矩阵</h4>
        <div className="overflow-x-auto max-h-[400px] custom-scrollbar">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 sticky top-0 bg-white z-10">
                <th className="text-left py-3 px-4 font-bold text-gray-400 uppercase tracking-wider">省份</th>
                <th className="text-right py-3 px-4 font-bold text-gray-400 uppercase tracking-wider">本期</th>
                <th className="text-right py-3 px-4 font-bold text-gray-400 uppercase tracking-wider">上期</th>
                <th className="text-right py-3 px-4 font-bold text-gray-400 uppercase tracking-wider">变化</th>
                <th className="text-right py-3 px-4 font-bold text-gray-400 uppercase tracking-wider">环比</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sortedByChange.map((item, idx) => {
                const isGrowth = item.changeRate >= 0;
                const arrowClass = isGrowth ? 'text-green-700' : 'text-red-700';
                const arrow = isGrowth ? '↑' : '↓';
                
                return (
                  <tr key={item.province} className="hover:bg-blue-50/30 transition-colors group">
                    <td className="py-3 px-4 font-bold text-gray-900">{item.province}</td>
                    <td className="py-3 px-4 text-right">
                      <span className="font-black text-blue-900">{item.currentValue.toLocaleString()}</span>
                    </td>
                    <td className="py-3 px-4 text-right text-gray-500">
                      {item.previousValue.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right font-bold">
                      <span className={isGrowth ? 'text-green-600' : 'text-red-600'}>
                        {isGrowth ? '+' : ''}{item.change.toLocaleString()}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className={`font-black text-sm ${arrowClass}`}>
                        {arrow} {Math.abs(item.changeRate).toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ProvinceComparison;
