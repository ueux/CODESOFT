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

interface Product {
  id: string;
  title: string;
  slug: string;
  sale_price: number;
  stock: number;
  category: string;
  ratings?: number;
  shop?: {
    name: string;
  };
  images: Array<{ url: string }>;
  createdAt: string;
}

const ProductList = () => {
  const [globalFilter, setGlobalFilter] = useState("");
  const deferredFilter = useDeferredValue(globalFilter);
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data, isLoading, isError } = useQuery({
    queryKey: ["all-products", page],
    queryFn: async () => {
      const res = await axiosInstance.get(
        `/admin/api/get-all-products?page=${page}&limit=${limit}`
      );
      return res?.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const allProducts = data?.data || [];
  const totalPages = Math.ceil((data?.meta?.totalProducts ?? 0) / limit);

  const filteredProducts = useMemo(() => {
    return allProducts.filter((product: Product) =>
      Object.values(product)
        .join(" ")
        .toLowerCase()
        .includes(deferredFilter.toLowerCase())
    );
  }, [allProducts, deferredFilter]);

  const columns = useMemo<ColumnDef<Product>[]>(
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
                  alt="Product Image"
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
        accessorKey: "name",
        header: "Product Name",
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
        accessorKey: "sale_price",
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
        accessorKey: "category",
        header: "Category",
        cell: ({ row }) => (
          <span className="capitalize text-blue-100">{row.original.category}</span>
        ),
      },
      {
        accessorKey: "rating",
        header: "Rating",
        cell: ({ row }) => (
          <div className="flex items-center gap-1 text-yellow-400">
            <Star fill="#fde047" size={18} />
            <span className="text-white">
              {row.original.ratings?.toFixed(1) || "5.0"}
            </span>
          </div>
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
      {
        accessorKey: "createdAt",
        header: "Date",
        cell: ({ row }) => {
          const date = new Date(row.original.createdAt).toLocaleDateString();
          return <span className="text-white text-sm">{date}</span>;
        },
      },
      {
        id: "actions",
        cell: ({ row }) => (
          <div className="flex gap-3">
            <Link
              href={`${process.env.NEXT_PUBLIC_USER_UI_LINK}/product/${row.original.slug}`}
              className="text-blue-400 hover:text-blue-300 transition"
              target="_blank"
            >
              <Eye size={18} />
            </Link>
          </div>
        ),
      },
    ],
    []
  );

  const table = useReactTable({
    data: filteredProducts,
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
      "Category",
      "Rating",
      "Shop",
      "Date",
    ].join(",");

    const rows = filteredProducts.map((product: Product) =>
      [
        `"${product.title}"`,
        product.sale_price,
        product.stock,
        product.category,
        product.ratings || 5,
        product.shop?.name || "Unknown",
        new Date(product.createdAt).toLocaleDateString(),
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
        <span className="text-white">All Products</span>
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <h2 className="text-2xl text-white font-semibold">All Products</h2>
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
          placeholder="Search products..."
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
            Failed to load products
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

            {filteredProducts.length === 0 && (
              <div className="p-4 text-center text-gray-400">
                No products found
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

export default ProductList;