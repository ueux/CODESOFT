"use client";

import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { SalesChart } from "../../shared/components/charts/sales.chart";
import GeographicalMap from "../../shared/components/charts/geographicalMap.chart";

// Device data
const deviceData = [
  { name: "Phone", value: 55 },
  { name: "Tablet", value: 20 },
  { name: "Computer", value: 25 },
];

const COLORS = ["#0088FE", "#00C49F", "#FFBB28"];

const OrdersTable = () => {
  // This would normally come from your data or API
  const orders = [
    { id: "ORD-001", customer: "John Doe", amount: "$250", status: "Paid" },
    { id: "ORD-002", customer: "Jane Smith", amount: "$180", status: "Pending" },
    { id: "ORD-003", customer: "Alice Johnson", amount: "$340", status: "Paid" },
    { id: "ORD-004", customer: "Bob Lee", amount: "$90", status: "Failed" },
  ];

  const columns = [
    {
      accessorKey: "id",
      header: "Order ID",
    },
    {
      accessorKey: "customer",
      header: "Customer",
    },
    {
      accessorKey: "amount",
      header: "Amount",
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ getValue }: any) => {
        const value = getValue();
        const color =
          value === "Paid"
            ? "text-green-400"
            : value === "Pending"
            ? "text-yellow-400"
            : "text-red-400";
        return <span className={`font-medium ${color}`}>{value}</span>;
      },
    },
  ];

  return (
    <div className="mt-6">
      <h2 className="text-white text-xl font-semibold">
        Recent Orders
        <span className="block text-sm text-slate-400 font-normal">
          A quick snapshot of your latest transactions
        </span>
      </h2>
      <div className="mt-4 rounded-xl shadow-xl bg-slate-800 p-4">
        <table className="w-full">
          <thead>
            <tr>
              {columns.map((column) => (
                <th
                  key={column.accessorKey}
                  className="text-left p-3 text-slate-300 font-medium"
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-b border-slate-700">
                {columns.map((column) => {
                  const value = order[column.accessorKey as keyof typeof order];
                  return (
                    <td key={column.accessorKey} className="p-3 text-slate-200">
                      {column.cell
                        ? column.cell({ getValue: () => value })
                        : value}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const DashboardPage = () => {
  return (
    <div className="p-6">
      {/* Top Charts */}
      <div className="w-full flex gap-8">
        {/* Revenue Chart */}
        <div className="w-[65%]">
          <div className="rounded-2xl shadow-xl bg-slate-800 p-6">
            <h2 className="text-white text-xl font-semibold">
              Revenue
              <span className="block text-sm text-slate-400 font-normal">
                Last 6 months performance
              </span>
            </h2>
            <SalesChart />
          </div>
        </div>

        {/* Device Usage */}
        <div className="w-[35%] rounded-2xl shadow-xl bg-slate-800 p-6">
          <h2 className="text-white text-xl font-semibold mb-2">
            Device Usage
            <span className="block text-sm text-slate-400 font-normal">
              How users access your platform
            </span>
          </h2>
          <div className="mt-14">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <defs>
                  <filter
                    id="shadow"
                    x="-10%"
                    y="-10%"
                    width="120%"
                    height="120%"
                  >
                    <feDropShadow
                      dx="0"
                      dy="0"
                      stdDeviation="4"
                      floodColor="#000"
                      floodOpacity="0.2"
                    />
                  </filter>
                </defs>
                <Pie
                  data={deviceData}
                  dataKey="value"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={3}
                  stroke="#0f172a"
                  strokeWidth={2}
                  isAnimationActive
                  filter="url(#shadow)"
                >
                  {deviceData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1e293b",
                    border: "none",
                    borderRadius: "8px",
                  }}
                  labelStyle={{ color: "#fff" }}
                  itemStyle={{ color: "#fff" }}
                />
                <Legend
                  layout="horizontal"
                  verticalAlign="bottom"
                  align="center"
                  iconType="circle"
                  formatter={(value:any) => (
                    <span className="text-white text-sm ml-1">{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Geo Map + Orders */}
      <div className="w-full flex gap-8 mt-8">
        {/* Map */}
        <div className="w-[60%]">
          <h2 className="text-white text-xl font-semibold mt-6">
            User & Seller Distribution
            <span className="block text-sm text-slate-400 font-normal">
              Visual breakdown of global user & seller activity
            </span>
          </h2>
          {/* <GeographicalMap /> */}
        </div>

        {/* Orders Table */}
        <div className="w-[40%]">
          <OrdersTable />
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;