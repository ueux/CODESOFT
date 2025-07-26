"use client";
import React, { useDeferredValue, useMemo, useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { Download, Eye, Search, Star } from "lucide-react";
import axiosInstance from "apps/admin-ui/src/utils/axiosInstance";
import { Button } from "apps/admin-ui/src/shared/components/button";
import { Skeleton } from "apps/admin-ui/src/shared/components/skeleton";
import Pagination from "apps/admin-ui/src/shared/components/pagination";

interface Events {
  id: string;
  title: string;
  slug: string;
  sale_price: number;
  stock: number;
  category: string;
  ratings?: number;
  starting_date: string;
  ending_date: string;
  shop?: {
    name: string;
  };
  images: Array<{ url: string }>;
  createdAt: string;
}

const AllEvents = () => {
  const [globalFilter, setGlobalFilter] = useState("");
  const deferredFilter = useDeferredValue(globalFilter);
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data, isLoading, isError } = useQuery({
    queryKey: ["all-events", page],
    queryFn: async () => {
      const res = await axiosInstance.get(
        `/admin/api/get-all-events?page=${page}&limit=${limit}`
      );
      return res?.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const allEvents = data?.data || [];
  const totalPages = Math.ceil((data?.meta?.totalProducts ?? 0) / limit);

  const filteredEvents = useMemo(() => {
    return allEvents.filter((product: Events) =>
      Object.values(product)
        .join(" ")
        .toLowerCase()
        .includes(deferredFilter.toLowerCase())
    );
  }, [allEvents, deferredFilter]);

  const columns = useMemo<ColumnDef<Events>[]>(
    () => [
      {
        accessorKey: "image",
        header: "Image",
        cell: ({ row }) => {
          const imageUrl = row.original.images[0]?.url;
          return (
            <div className="w-12 h-12 relative">
              {imageUrl ? (
                <Image
                  src={imageUrl}
                  alt="Event Image"
                  fill
                  className="rounded-md object-cover"
                  sizes="48px"
                />
              ) : (
                <div className="w-full h-full rounded-md bg-gray-700 flex items-center justify-center text-xs text-gray-300">
                  N/A
                </div>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: "Title",
        header: "Title",
        cell: ({ row }) => {
          const title = row.original.title;
          const truncatedTitle =
            title.length > 25 ? `${title.substring(0, 25)}...` : title;
          return (
            <Link
              href={`${process.env.NEXT_PUBLIC_USER_UI_LINK}/product/${row.original.slug}`}
              className="text-blue-400 hover:underline whitespace-nowrap"
              title={title}
              target="_blank"
            >
              {truncatedTitle}
            </Link>
          );
        },
      },
      {
        accessorKey: "price",
        header: "Price",
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-green-500">
            ₹{row.original.sale_price.toLocaleString()}
          </span>
        ),
      },
      {
        accessorKey: "stock",
        header: "Stock",
        cell: ({ row }) => (
          <span
            className={row.original.stock < 10 ? "text-red-500" : "text-white"}
          >
            {row.original.stock} left
          </span>
        ),
      },
      {
        accessorKey: "starting_date",
        header: "Start",
        cell: ({ row }) => (
          <div className="text-yellow-300">{new Date(row.original.starting_date).toLocaleDateString() }</div>
        ),
      },
      {
        accessorKey: "ending_date",
        header: "End",
        cell: ({ row }) => (
          <div className="text-yellow-300">{ new Date(row.original.ending_date).toLocaleDateString()}</div>
        ),
      },
      {
        accessorKey: "shop",
        header: "Shop",
        cell: ({ row }) => (
          <span className="text-white">
            {row.original.shop?.name || "Unknown Shop"}
          </span>
        ),
      },
    ],
    []
  );

  const table = useReactTable({
    data: filteredEvents,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: {
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
  });

  const exportCSV = () => {
    const headers = [
      "Title",
      "Price",
      "Stock",
      "Start",
      "End",
      "Shop",
    ].join(",");

    const rows = filteredEvents.map((product: Events) =>
      [
        `"${product.title}"`,
        product.sale_price,
        product.stock,
        product.starting_date,
        product.ending_date,
        product.shop?.name || "Unknown",
      ].join(",")
    );

    const csvContent = [headers, ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `products_${new Date().toISOString()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full min-h-screen p-4 md:p-8">
      {/* Breadcrumbs */}
      <div className="flex items-center mb-4 text-sm">
        <Link
          href="/dashboard"
          className="text-blue-400 hover:underline cursor-pointer"
        >
          Dashboard
        </Link>
        <span className="mx-2 text-gray-400">/</span>
        <span className="text-white">All Events</span>
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <h2 className="text-2xl text-white font-semibold">All Events</h2>
        <Button
          onClick={exportCSV}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Download size={16} className="mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Search Bar */}
      <div className="mb-6 flex items-center bg-gray-900 p-2 rounded-md border border-gray-700">
        <Search size={18} className="text-gray-400 mr-2" />
        <input
          type="text"
          placeholder="Search events..."
          className="w-full bg-transparent text-white outline-none placeholder-gray-400"
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-gray-900 rounded-lg border border-gray-700">
        {isLoading ? (
          <div className="p-4 space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="w-full h-12 bg-gray-800 rounded" />
            ))}
          </div>
        ) : isError ? (
          <div className="p-4 text-center text-red-400">
            Failed to load events
          </div>
        ) : (
          <>
            <table className="w-full">
              <thead>
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr
                    key={headerGroup.id}
                    className="border-b border-gray-800"
                  >
                    {headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        className="p-3 text-left text-gray-300 font-medium text-sm"
                      >
                        {flexRender(
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
                  <tr
                    key={row.id}
                    className="border-b border-gray-800 hover:bg-gray-800/50 transition-colors"
                  >
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

            {filteredEvents.length === 0 && (
              <div className="p-4 text-center text-gray-400">
                No events found
              </div>
            )}
          </>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex justify-center">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </div>
      )}
    </div>
  );
};

export default AllEvents;