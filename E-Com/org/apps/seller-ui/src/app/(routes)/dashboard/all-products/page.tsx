"use client";
import React, { useMemo, useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "apps/seller-ui/src/utils/axiosInstance";
import Image from "next/image";
import Link from "next/link";
import { BarChart, ChevronRight, Eye, Pencil, Search, Star, Trash2, Undo2 } from "lucide-react";
import DeleteConfirmationModal from "apps/seller-ui/src/shared/components/delete-confirm-modal";

interface Product {
  id: string;
  title: string;
  slug: string;
  sale_price: number;
  stock: number;
  category: string;
  ratings?: number;
  images: Array<{ url: string }>;
  isDeleted?: boolean;
}

const fetchProducts = async (): Promise<Product[]> => {
  const res = await axiosInstance.get("/product/api/get-shop-products");
  return res?.data?.products || [];
};

const ProductList = () => {
  const [globalFilter, setGlobalFilter] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const queryClient = useQueryClient();

  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ["shop-products"],
    queryFn: fetchProducts,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const deleteMutation = useMutation({
    mutationFn: (productId: string) =>
      axiosInstance.delete(`/product/api/delete-product/${productId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shop-products"] });
      setShowDeleteModal(false);
      // Add toast notification: "Product deleted successfully"
    },
  });

  const restoreMutation = useMutation({
    mutationFn: (productId: string) =>
      axiosInstance.put(`/product/api/restore-product/${productId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shop-products"] });
      setShowDeleteModal(false);
      // Add toast notification: "Product restored successfully"
    },
  });

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
        accessorKey: "title",
        header: "Product Name",
        cell: ({ row }) => {
          const title = row.original.title;
          const truncatedTitle = title.length > 25 ? `${title.substring(0, 25)}...` : title;
          return (
            <Link
              href={`${process.env.NEXT_PUBLIC_USER_UI_LINK}/product/${row.original.slug}`}
              className="text-blue-400 hover:underline"
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
        cell: ({ row }) => <span>₹{row.original.sale_price.toLocaleString()}</span>,
      },
      {
        accessorKey: "stock",
        header: "Stock",
        cell: ({ row }) => (
          <span className={row.original.stock < 10 ? "text-red-500" : "text-white"}>
            {row.original.stock} left
          </span>
        ),
      },
      {
        accessorKey: "category",
        header: "Category",
        cell: ({ row }) => <span className="capitalize">{row.original.category}</span>,
      },
      {
        accessorKey: "ratings",
        header: "Rating",
        cell: ({ row }) => (
          <div className="flex items-center gap-1 text-yellow-400">
            <Star fill="#fde047" size={18} />
            <span className="text-white">{row.original.ratings?.toFixed(1) || "5.0"}</span>
          </div>
        ),
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <div className="flex gap-3">
            <Link
              href={`${process.env.NEXT_PUBLIC_USER_UI_LINK}/product/${row.original.id}`}
              className="text-blue-400 hover:text-blue-300 transition"
              title="View"
            >
              <Eye size={18} />
            </Link>
            <Link
              href={`/product/edit/${row.original.id}`}
              className="text-yellow-400 hover:text-yellow-300 transition"
              title="Edit"
            >
              <Pencil size={18} />
            </Link>
            <button
              className={`${
                row.original.isDeleted
                  ? "text-green-400 hover:text-green-300"
                  : "text-red-400 hover:text-red-300"
              } transition`}
              onClick={() => {
                setSelectedProduct(row.original);
                setShowDeleteModal(true);
              }}
              title={row.original.isDeleted ? "Restore" : "Delete"}
            >
              {row.original.isDeleted ? <Undo2 size={18} /> : <Trash2 size={18} />}
            </button>
          </div>
        ),
      },
    ],
    []
  );

  const table = useReactTable({
    data: products,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
  });

  return (
    <div className="w-full min-h-screen p-4 md:p-8">
      {/* Breadcrumbs */}
      <div className="flex items-center mb-4 text-sm">
        <Link href="/dashboard" className="text-blue-400 hover:underline">
          Dashboard
        </Link>
        <ChevronRight size={16} className="text-gray-400 mx-2" />
        <span className="text-white">All Products</span>
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <h2 className="text-2xl text-white font-semibold">All Products</h2>
        <Link
          href="/dashboard/create-product"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg whitespace-nowrap"
        >
          Create Product
        </Link>
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
              <div key={i} className="w-full h-12 bg-gray-800 rounded animate-pulse" />
            ))}
          </div>
        ) : (
          <>
            <table className="w-full">
              <thead>
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id} className="border-b border-gray-800">
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

            {products.length === 0 && !isLoading && (
              <div className="p-4 text-center text-gray-400">No products found</div>
            )}
          </>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedProduct && (
        <DeleteConfirmationModal
          product={selectedProduct}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={() => deleteMutation.mutate(selectedProduct.id)}
          onRestore={() => restoreMutation.mutate(selectedProduct.id)}

        />
      )}
    </div>
  );
};

export default ProductList;