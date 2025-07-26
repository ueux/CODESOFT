"use client";

import React from "react";
import dynamic from "next/dynamic";
const ApexCharts = dynamic(() => import("react-apexcharts"), { ssr: false });

interface SalesData {
  month: string;
  count: number;
  trend?: "up" | "down";
}

export const SalesChart = ({ ordersData }: { ordersData?: SalesData[] }) => {
  const defaultData = [
    { month: "Jan", count: 31, trend: "up" },
    { month: "Feb", count: 40, trend: "up" },
    { month: "Mar", count: 28, trend: "down" },
    { month: "Apr", count: 51, trend: "up" },
    { month: "May", count: 42, trend: "down" },
    { month: "Jun", count: 109, trend: "up" },
  ];

  const data = ordersData || defaultData;

  const options: ApexCharts.ApexOptions = {
    chart: {
      type: "area",
      height: 350,
      toolbar: {
        show: false,
      },
      animations: {
        enabled: true,
        easing: "easeout",
        speed: 800,
        animateGradually: {
          enabled: true,
          delay: 150,
        },
      },
    },
    colors: ["#3b82f6"],
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.7,
        opacityTo: 0.2,
        stops: [0, 100],
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: "smooth",
      width: 3,
    },
    grid: {
      borderColor: "#334155",
      strokeDashArray: 4,
      padding: {
        top: 0,
        right: 20,
        bottom: 0,
        left: 20,
      },
    },
    xaxis: {
      categories: data.map((d) => d.month),
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
      labels: {
        style: {
          colors: "#94a3b8",
          fontSize: "12px",
        },
      },
    },
    yaxis: {
      labels: {
        style: {
          colors: "#94a3b8",
          fontSize: "12px",
        },
        formatter: (val) => `$${val}k`,
      },
    },
    tooltip: {
      custom: ({ series, seriesIndex, dataPointIndex }) => {
        const trend = data[dataPointIndex].trend;
        const trendColor = trend === "up" ? "#10b981" : "#ef4444";
        const trendIcon = trend === "up" ? "↑" : "↓";

        return `
          <div class="bg-slate-800 p-3 rounded-lg shadow-xl border border-slate-700">
            <div class="flex items-center justify-between">
              <span class="font-bold text-white">${data[dataPointIndex].month}</span>
              <span class="font-medium" style="color: ${trendColor}">${trendIcon} ${trend}</span>
            </div>
            <div class="mt-2 text-2xl font-bold text-white">$${series[seriesIndex][dataPointIndex]}k</div>
          </div>
        `;
      },
    },
    markers: {
      size: 5,
      colors: ["#3b82f6"],
      strokeColors: "#fff",
      strokeWidth: 2,
      hover: {
        size: 7,
      },
    },
  };

  const series = [
    {
      name: "Revenue",
      data: data.map((d) => d.count),
    },
  ];

  // Calculate percentage change
  const percentageChange = ((data[data.length - 1].count - data[0].count) / data[0].count * 100);
  const isPositive = percentageChange >= 0;

  return (
    <div className="relative h-full">
      {/* Summary Stats */}
      <div className="absolute top-0 right-0 z-10 flex items-center gap-4">
        <div className="bg-slate-800/80 backdrop-blur-sm p-3 rounded-lg border border-slate-700">
          <div className="text-sm text-slate-300">Total Revenue</div>
          <div className="text-2xl font-bold text-white">
            ${data.reduce((sum, d) => sum + d.count, 0)}k
          </div>
        </div>
        <div className="bg-slate-800/80 backdrop-blur-sm p-3 rounded-lg border border-slate-700">
          <div className="text-sm text-slate-300">6M Change</div>
          <div className={`text-xl font-bold ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
            {isPositive ? '+' : ''}{percentageChange.toFixed(1)}%
          </div>
        </div>
      </div>

      {/* Chart */}
      <ApexCharts
        options={options}
        series={series}
        type="area"
        height={350}
        width="100%"
      />
    </div>
  );
};