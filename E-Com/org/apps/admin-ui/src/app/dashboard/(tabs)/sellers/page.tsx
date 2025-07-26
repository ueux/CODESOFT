"use client";
import React, { useMemo, useState, useDeferredValue } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  getFilteredRowModel,
} from "@tanstack/react-table";
import { Search, Download, Ban } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "apps/admin-ui/src/utils/axiosInstance";
import Image from "next/image";

interface Seller {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  shop: {
    name: string;
    avatar: string;
    address: string;
  };
}

interface SellersResponse {
  data: Seller[];
  meta: {
    totalSellers: number;
  };
}

const SellersPage = () => {
  const [globalFilter, setGlobalFilter] = useState("");
  const [page, setPage] = useState(1);
  const [selectedSeller, setSelectedSeller] = useState<Seller | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const deferredGlobalFilter = useDeferredValue(globalFilter);
  const limit = 10;
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery<SellersResponse, Error>({
    queryKey: ["sellers-list", page],
    queryFn: async () => {
      const res = await axiosInstance.get(
        `/admin/api/get-all-sellers?page=${page}&limit=${limit}`
      );
      return res.data;
    },
    staleTime: 1000 * 60 * 5,
  });

  const banSellerMutation = useMutation({
    mutationFn: async (sellerId: string) => {
      await axiosInstance.put(`/admin/api/ban-seller/${sellerId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sellers-list"] });
      setIsModalOpen(false);
      setSelectedSeller(null);
    },
  });

  const allSellers = data?.data || [];
  const filteredSellers = useMemo(() => {
    return allSellers.filter(seller => {
      return deferredGlobalFilter
        ? Object.values(seller)
            .join(" ")
            .toLowerCase()
            .includes(deferredGlobalFilter.toLowerCase())
        : true;
    });
  }, [allSellers, deferredGlobalFilter]);

  const totalPages = Math.ceil((data?.meta?.totalSellers ?? 0) / limit);

  const columns = useMemo(
    () => [
      {
        accessorKey: "shop.avatar",
        header: "Avatar",
            cell: ({ row }: { row: { original: Seller } }) => {
                const imageUrl=row.original.shop.avatar
                return (
                    <div className="w-10 h-10 relative rounded-full overflow-hidden">
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
                )
            },
      },
      {
        accessorKey: "name",
        header: "Name",
      },
      {
        accessorKey: "email",
        header: "Email",
      },
      {
        accessorKey: "shop.name",
        header: "Shop Name",
      },
      {
        accessorKey: "shop.address",
        header: "Location",
        cell: ({ row }: { row: { original: Seller } }) => (
          <span className="text-gray-300">
            {row.original.shop.address || "Not specified"}
          </span>
        ),
      },
      {
        accessorKey: "createdAt",
        header: "Joined",
        cell: ({ row }: { row: { original: Seller } }) => (
          <span className="text-gray-300">
            {new Date(row.original.createdAt).toLocaleDateString()}
          </span>
        ),
      },
      {
        id: "actions",
        cell: ({ row }: { row: { original: Seller } }) => (
          <button
            onClick={() => {
              setSelectedSeller(row.original);
              setIsModalOpen(true);
            }}
            className="text-red-500 hover:text-red-400 transition-colors"
          >
            <Ban size={18} />
          </button>
        ),
      },
    ],
    []
  );

  const table = useReactTable({
    data: filteredSellers,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
  });

  const exportToCSV = () => {
    const headers = [
      "Title",
      "Price",
      "Stock",
      "Category",
      "Rating",
      "Shop",
      "Date",
    ].join(",");

    const rows = filteredSellers.map((seller: Seller) =>
      [
        `"${seller.name}"`,
        seller.email,
        seller.shop.name,
        seller.shop.address,
        new Date(seller.createdAt).toLocaleDateString(),
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
    <div className="w-full min-h-screen p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Sellers Management</h1>
        <button
          onClick={exportToCSV}
          className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded flex items-center gap-2"
        >
          <Download size={16} /> Export CSV
        </button>
      </div>

      {/* Search */}
      <div className="mb-6 flex items-center bg-gray-800 rounded-lg p-2">
        <Search className="text-gray-400 mr-2" size={18} />
        <input
          placeholder="Search sellers..."
          className="w-full bg-transparent text-white outline-none"
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-gray-900 rounded-lg p-4">
        {isLoading ? (
          <p className="text-center text-white">Loading sellers...</p>
        ) : (
          <table className="w-full text-white">
            <thead>
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id} className="border-b border-gray-800">
                  {headerGroup.headers.map(header => (
                    <th key={header.id} className="p-3 text-left">
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
              {table.getRowModel().rows.map(row => (
                <tr
                  key={row.id}
                  className="border-b border-gray-800 hover:bg-gray-800 transition-colors"
                >
                  {row.getVisibleCells().map(cell => (
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
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 flex justify-center">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1 bg-gray-800 rounded-l disabled:opacity-50"
          >
            Previous
          </button>
          <span className="px-4 py-1 bg-gray-800 text-white">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-1 bg-gray-800 rounded-r disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      {/* Ban Confirmation Modal */}
      {isModalOpen && selectedSeller && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-2xl shadow-lg w-[90%] max-w-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <h3 className="text-white text-lg font-semibold">Ban Seller</h3>
            </div>

            <div className="mb-6">
              <p className="text-gray-300 leading-6">
                <span className="text-yellow-400 font-semibold">
                  ▲ Important:{" "}
                </span>
                Are you sure you want to ban{" "}
                <span className="text-red-400 font-medium">
                  {selectedSeller.name}
                </span>
                ? This will also disable their shop.
              </p>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-sm text-white rounded"
              >
                Cancel
              </button>
              <button
                onClick={() => banSellerMutation.mutate(selectedSeller.id)}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-sm text-white rounded flex items-center gap-2"
                disabled={banSellerMutation.isPending}
              >
                <Ban size={16} /> Confirm Ban
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellersPage;