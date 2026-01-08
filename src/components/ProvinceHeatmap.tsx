/**
 * 省份热力图组件
 * 用于展示中国地图上各省份的数据分布情况
 */

import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';

interface ProvinceHeatmapProps {
  data: Array<{ province: string; value: number; percentage: number }>;
  title?: string;
  height?: number;
  comparingData?: Array<{ province: string; value: number; percentage: number }>;
}

/**
 * 省份名称映射表 - 从简体名称映射到 ECharts 地图的标准名称
 */
const PROVINCE_NAME_MAP: Record<string, string> = {
  '北京': '北京',
  '上海': '上海',
  '广东': '广东',
  '浙江': '浙江',
  '江苏': '江苏',
  '四川': '四川',
  '湖北': '湖北',
  '湖南': '湖南',
  '福建': '福建',
  '山东': '山东',
  '云南': '云南',
  '陕西': '陕西',
  '重庆': '重庆',
  '天津': '天津',
  '河南': '河南',
  '安徽': '安徽',
  '江西': '江西',
  '河北': '河北',
  '贵州': '贵州',
  '山西': '山西',
  '吉林': '吉林',
  '黑龙江': '黑龙江',
  '辽宁': '辽宁',
  '内蒙古': '内蒙古自治区',
  '新疆': '新疆维吾尔自治区',
  '宁夏': '宁夏回族自治区',
  '青海': '青海',
  '西藏': '西藏自治区',
  '甘肃': '甘肃',
  '广西': '广西壮族自治区',
  '海南': '海南',
  '台湾': '台湾',
  '香港': '香港',
  '澳门': '澳门',
};

export const ProvinceHeatmap: React.FC<ProvinceHeatmapProps> = ({
  data,
  title = '省份使用热力分布',
  height = 500,
  comparingData,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // 初始化 chart
    if (!chartRef.current) {
      chartRef.current = echarts.init(containerRef.current);
    }

    // 转换数据格式
    const heatmapData = data.map(item => ({
      name: PROVINCE_NAME_MAP[item.province] || item.province,
      value: item.value,
      itemStyle: {
        areaColor: item.value > 0 ? undefined : '#f0f0f0',
      },
    }));

    // 计算对标数据（如果有）
    let comparisonText = '';
    if (comparingData) {
      const comparison = data.map(current => {
        const previous = comparingData.find(p => p.province === current.province);
        if (!previous) return 0;
        return ((current.value - previous.value) / (previous.value || 1)) * 100;
      });
      const avgChange = comparison.reduce((a, b) => a + b, 0) / comparison.length;
      comparisonText = `\n本期均值: ${avgChange > 0 ? '+' : ''}${avgChange.toFixed(1)}%`;
    }

    // 准备 options
    const option: echarts.EChartsOption = {
      title: {
        text: title + comparisonText,
        left: 'center',
        textStyle: {
          fontSize: 14,
          fontWeight: 'bold',
        },
      },
      tooltip: {
        trigger: 'item',
        formatter: (params: any) => {
          if (params.componentSubType === 'map') {
            const item = data.find(d => 
              PROVINCE_NAME_MAP[d.province] === params.name || d.province === params.name
            );
            if (item) {
              let html = `<div class="p-2">
                <strong>${item.province}</strong><br/>
                使用次数: ${item.value.toLocaleString()}<br/>
                占比: ${item.percentage.toFixed(2)}%`;
              
              if (comparingData) {
                const prev = comparingData.find(p => p.province === item.province);
                if (prev) {
                  const change = ((item.value - prev.value) / (prev.value || 1)) * 100;
                  html += `<br/>环比: ${change > 0 ? '+' : ''}${change.toFixed(1)}%`;
                }
              }
              html += '</div>';
              return html;
            }
          }
          return params.name;
        },
      },
      geo: {
        map: 'china',
        roam: true,
        label: {
          emphasis: {
            show: true,
          },
        },
        itemStyle: {
          normal: {
            areaColor: '#f3f3f3',
            borderColor: '#999',
          },
          emphasis: {
            areaColor: '#e0e7ff',
          },
        },
      },
      visualMap: {
        min: Math.min(...data.map(d => d.value)),
        max: Math.max(...data.map(d => d.value)),
        splitNumber: 5,
        inRange: {
          color: ['#e0ffff', '#006edd'],
        },
        textStyle: {
          color: '#666',
        },
        bottom: 20,
        left: 'left',
      },
      series: [
        {
          type: 'map',
          geoIndex: 0,
          data: heatmapData,
          symbolSize: ['100%', '100%'],
          showLegendSymbol: false,
          itemStyle: {
            emphasis: {
              shadowOffsetX: 0,
              shadowOffsetY: 0,
              shadowBlur: 20,
              shadowColor: 'rgba(0, 0, 0, 0.5)',
            },
          },
        },
      ],
    };

    // 注册中国地图（内置）
    chartRef.current.setOption(option);

    // 处理窗口resize
    const handleResize = () => {
      chartRef.current?.resize();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [data, title, comparingData]);

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: `${height}px`,
      }}
      className="rounded-lg border border-gray-200 bg-white"
    />
  );
};

export default ProvinceHeatmap;
