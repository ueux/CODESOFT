'use client'

import {  useQuery, useQueryClient } from '@tanstack/react-query';
import { flexRender, getCoreRowModel, getFilteredRowModel, useReactTable } from '@tanstack/react-table';
import axiosInstance from 'apps/admin-ui/src/utils/axiosInstance';
import { BarChart, ChevronRight, Eye, Pencil, Search, Trash2, Undo2 } from 'lucide-react';
import Link from 'next/link';
import React, { useMemo, useState } from 'react'

const fetchOrders = async () => {
  const res = await axiosInstance.get("/order/api/get-admin-orders");
  return res?.data?.orders;
};

const OrdersPage = () => {
  const [globalFilter, setGlobalFilter] = useState("");

    const { data: orders = [], isLoading } = useQuery({
    queryKey: ["seller-orders"],
    queryFn: fetchOrders,
    staleTime: 1000 * 60 * 5,
    });

    const columns = useMemo(
    () => [
      {
        accessorKey: "id",
        header: "Order ID",
        cell: ({ row }: any) => {

            return  (
                <span className="text-white text-sm truncate">
                    #{row.original.id.slice(-6).toUpperCase()}
                </span>
            )
        },
      },
      {
        accessorKey: "shop.name",
        header: "Shop",
        cell: ({ row }: any) => (
            <span
              className="text-white"
            >
                {row.original.shop?.name??"Unknown Shop"}
            </span>
          )
      },
      {
        accessorKey: "user.name",
        header: "Buyer",
        cell: ({ row }: any) => (
            <span
              className="text-white"
            >
                {row.original.user?.name??"Guest"}
            </span>
          )
      },
      {
        accessorKey: "total",
        header: "Total",
        cell: ({ row }: any) => <span>₹{row.original.total}</span>,
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }: any) => (
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${row.original.status === "Paid" ? "text-white bg-green-600" : "text-white bg-yellow-500"}`}
          >
            {row.original.status}
          </span>
        ),
      },
      {
        accessorKey: "createdAt",
          header: "Date",
                cell: ({ row }: any)=> {
                    const date = new Date(row.original.createdAt).toLocaleDateString()
                    return <span className='text-white text-sm'>{date}</span>
        }
      },
      {
        header: "Actions",
        cell: ({ row }: any) => (
            <Link
              href={`/order/${row.original.id}`}
              className="text-blue-400 hover:text-blue-300 transition"
            >
              <Eye size={18} />
            </Link>
        ),
      },
    ],
    []
  );

    const table = useReactTable({
        data: orders,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        globalFilterFn: "includesString",
        state: { globalFilter },
        onGlobalFilterChange: setGlobalFilter,
    });

  return (
    <div className="w-full min-h-screen p-8">
      {/* Breadcrumbs */}
      <div className="flex items-center mb-4">
        <Link href="/dashboard" className="text-blue-400 cursor-pointer">
          Dashboard
        </Link>
        <ChevronRight size={20} className="text-gray-200" />
        <span className="text-white">All Orders</span>
      </div>

      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl text-white font-semibold">All Orders</h2>
      </div>

      {/* Search Bar */}
      <div className="mb-4 flex items-center bg-gray-900 p-2 rounded-md">
        <Search size={18} className="text-gray-400 mr-2" />
        <input
          type="text"
          placeholder="Search orders..."
          className="w-full bg-transparent text-white outline-none"
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-gray-900 rounded-lg p-4">
        {isLoading ? (
          <p className="text-center text-white">Loading orders...</p>
        ) : (
          <table className="w-full text-white">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className="border-b border-gray-800">
                  {headerGroup.headers.map((header) => (
                    <th key={header.id} className="p-3 text-left">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="border-b border-gray-800">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="p-3">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
              )}
              {
                  !isLoading && orders?.length === 0 && (<p className='text-center py-3 text-white'>
                      No orders found!
                  </p>)
              }
      </div>
    </div>
  )
}

export default OrdersPage

