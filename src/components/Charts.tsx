import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  Line,
} from 'recharts';

interface TrendChartProps {
  data: any[];
  secondaryData?: any[];
  secondaryName?: string;
  xKey?: string;
  yKey?: string;
  unit?: string;
}

export function TrendChart({ 
  data, 
  secondaryData, 
  secondaryName,
  xKey = 'metricDate', 
  yKey = 'metricValue', 
  unit = '' 
}: TrendChartProps) {
  // 分离预测数据和非预测数据
  // const normalData = data.filter(d => !d.isPrediction);
  // const predictionData = data.filter(d => d.isPrediction);
  
  // 如果有预测数据，不过预测竟有一些数据死区

  // 辅助函数：根据日期合并 secondaryData
  const mergedData = data.map(d => {
    const second = secondaryData?.find(s => s[xKey] === d[xKey]);
    return {
      ...d,
      secondaryValue: second?.[yKey]
    };
  });

  return (
    <div className="h-[400px] w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={mergedData}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorSecondary" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
          <XAxis 
            dataKey={xKey} 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#6b7280', fontSize: 12 }}
            dy={10}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#6b7280', fontSize: 12 }}
            unit={unit}
          />
          <Tooltip 
            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px' }}
            itemStyle={{ fontWeight: 'bold' }}
          />
          <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
          
          {/* 主指标 - 正常部分 */}
          <Area
            type="monotone"
            dataKey={(d) => d.isPrediction ? null : d[yKey]}
            name="实际值"
            stroke="#3b82f6"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#colorValue)"
            connectNulls
          />
          
          {/* 主指标 - 预测部分 (虚线) */}
          <Line
            type="monotone"
            data={mergedData}
            dataKey={(d) => (d.isPrediction || data[data.indexOf(d) + 1]?.isPrediction) ? d[yKey] : null}
            name="预测趋势"
            stroke="#3b82f6"
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={false}
            connectNulls
          />

          {/* 对比指标 (如果有) */}
          {secondaryData && (
            <Area
              type="monotone"
              dataKey="secondaryValue"
              name={secondaryName || "对比指标"}
              stroke="#f59e0b"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorSecondary)"
            />
          )}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ComparisonChart({ data }: { data: Array<{ name: string; current: number; previous: number }> }) {
  return (
    <div className="h-[400px] w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
          <XAxis 
            dataKey="name" 
            axisLine={false} 
            tickLine={false}
            tick={{ fill: '#6b7280', fontSize: 12 }}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false}
            tick={{ fill: '#6b7280', fontSize: 12 }}
          />
          <Tooltip 
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
          />
          <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
          <Bar dataKey="current" name="本期" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
          <Bar dataKey="previous" name="上期" fill="#94a3b8" radius={[4, 4, 0, 0]} barSize={40} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
