'use client'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import DeleteDiscountCodeModal from 'apps/seller-ui/src/shared/components/delete-discount-code-modal'
import axiosInstance from 'apps/seller-ui/src/utils/axiosInstance'
import { AxiosError } from 'axios'
import { ChevronRight, Copy, Plus, Trash, X } from 'lucide-react'
import Link from 'next/link'
import Input from 'packages/components/input'
import React, { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'react-hot-toast'



const DiscountCodes = () => {
  const [showModal, setShowModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedDiscount, setSelectedDiscount] = useState<any>()

  const {
    data: discountCodes = [],
    isLoading,
  } = useQuery({
    queryKey: ["shop-discounts"],
    queryFn: async () => {
      const res = await axiosInstance.get("/product/api/get-discount-codes")
      return res?.data?.discount_codes || []
    }
  })

  const queryClient = useQueryClient()
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      public_name: "",
      discountType: "percentage",
      discountValue: "",
      discountCode: "",
    },
  })

  // Mutation for creating discount code
  const createDiscountCodeMutation = useMutation({
    mutationFn: async (data: any) => {
      await axiosInstance.post("/product/api/create-discount-code", data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shop-discounts"] })
      toast.success("Discount code created successfully!")
      reset()
      setShowModal(false)
    },
    onError: (error: AxiosError<{message: string}>) => {
      toast.error(error.response?.data?.message || "Failed to create discount code")
    }
  })
  const deleteDiscountCodeMutation = useMutation({
    mutationFn: async (discountId) => {
      await axiosInstance.delete(`/product/api/delete-discount-code/${discountId}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shop-discounts"] })
      setShowDeleteModal(false)
    },
    onError: (error: AxiosError<{message: string}>) => {
      toast.error(error.response?.data?.message || "Failed to delete discount code")
    }
    })


  const onSubmit = (data: any) => {
    if (discountCodes.length >= 8) {
      toast.error("You can only create up to 8 discount codes.")
      return
    }
    createDiscountCodeMutation.mutate(data)
  }

  const handleDeleteClick = (discount: any) => {
    setSelectedDiscount(discount)
    setShowDeleteModal(true)
  }

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    toast.success("Discount code copied to clipboard!")
  }


  return (
    <div className='w-full min-h-screen p-8'>
      <div className='flex justify-between items-center mb-1'>
        <h2 className='text-2xl text-white font-semibold'>Discount Codes</h2>
        <button
          onClick={() => setShowModal(true)}
          className='bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg flex items-center gap-2'
        >
          <Plus size={18}/>Create Discount
        </button>
      </div>

      <div className='flex items-center text-white'>
        <Link href={"/dashboard"} className='text-[#80Deea] cursor-pointer'>Dashboard</Link>
        <ChevronRight size={20} className='opacity-[.8]' />
        <span>Discount Codes</span>
      </div>

      <div className="mt-8 bg-gray-800 p-6 rounded-lg shadow-lg">
        <h3 className="text-lg font-semibold text-white mb-4">
          Your Discount Codes
        </h3>

        {isLoading ? (
          <p className="text-gray-400 text-center">Loading discounts...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-white">
              <thead>
                <tr className="border-b border-gray-600">
                  <th className="p-3 text-left">Title</th>
                  <th className="p-3 text-left">Type</th>
                  <th className="p-3 text-left">Value</th>
                  <th className="p-3 text-left">Code</th>
                  <th className="p-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {discountCodes.map((code:any) => (
                  <tr key={code.id} className="border-b border-gray-700 hover:bg-gray-700 transition">
                    <td className="p-3">{code.public_name}</td>
                    <td className="p-3 capitalize">{code.discountType === "percentage" ? "Percentage (%)" : "Flat (₹)"}</td>
                    <td className="p-3">{code.discountType === "percentage" ? `${code.discountValue}%` : `₹${code.discountValue}`}</td>
                    <td className="p-3 font-mono">{code.discountCode}</td>
                    <td className="p-3 flex items-center gap-3">
                      <button
                        className="text-blue-400 hover:text-blue-300 transition-colors"
                        onClick={() => handleCopyCode(code.discountCode)}
                        title="Copy code"
                      >
                        <Copy size={18}/>
                      </button>
                      <button
                        className="text-red-400 hover:text-red-300 transition-colors"
                        onClick={() => handleDeleteClick(code)}
                        title="Delete code"
                      >
                        <Trash size={18}/>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!isLoading && discountCodes?.length === 0 && (
          <p className='w-full pt-4 block text-center text-gray-400'>No Discount Codes Available</p>
        )}
      </div>

      {/* Create Discount Modal */}
      {showModal && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <div className="bg-gray-800 p-6 rounded-lg w-full max-w-md shadow-lg">
            <div className="flex justify-between items-center border-b border-gray-700 pb-3">
              <h3 className="text-xl text-white">Create Discount Code</h3>
              <button
                onClick={() => setShowModal(false)}
                className='text-gray-400 hover:text-white transition-colors'
              >
                <X size={22} />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4">
              <div>
                <Input
                  label="Title (Public Name)"
                  {...register("public_name", {
                    required: "Title is required",
                    maxLength: {
                      value: 50,
                      message: "Title cannot exceed 50 characters"
                    }
                  })}
                />
                {errors.public_name && (
                  <p className="text-red-500 text-sm mt-1">{String(errors.public_name.message)}</p>
                )}
              </div>

              <div>
                <label className="block font-semibold text-gray-300 mb-1">
                  Discount Type
                </label>
                <Controller
                  control={control}
                  name="discountType"
                  render={({ field }) => (
                    <select
                      {...field}
                      className="w-full border outline-none border-gray-700 bg-gray-900 rounded px-3 py-2 text-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="percentage" className='bg-gray-800 text-gray-200'>Percentage (%)</option>
                      <option value="flat" className='bg-gray-800 text-gray-200'>Flat Amount (₹)</option>
                    </select>
                  )}
                />
              </div>

              <div>
                <Input
                  label="Discount Value"
                  type='number'
                  {...register("discountValue", {
                    required: "Value is required",
                    min: {
                      value: 1,
                      message: "Value must be at least 1"
                    },
                    max: {
                      value: 100,
                      message: "Value cannot exceed 100"
                    }
                  })}
                />
                {errors.discountValue && (
                  <p className="text-red-500 text-sm mt-1">{String(errors.discountValue.message)}</p>
                )}
              </div>

              <div>
                <Input
                  label="Discount Code"
                  {...register("discountCode", {
                    required: "Discount Code is required",
                    pattern: {
                      value: /^[A-Z0-9_-]+$/i,
                      message: "Only letters, numbers, hyphens and underscores allowed"
                    }
                  })}
                />
                {errors.discountCode && (
                  <p className="text-red-500 text-sm mt-1">{String(errors.discountCode.message)}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={createDiscountCodeMutation.isPending}
                className='mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md font-semibold flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed'
              >
                <Plus size={18}/>
                {createDiscountCodeMutation.isPending ? "Creating..." : "Create"}
              </button>

              {createDiscountCodeMutation.isError && (
                <p className="text-red-500 text-sm mt-2">
                  {(createDiscountCodeMutation.error as AxiosError<{message: string}>)?.response?.data?.message || "Something went wrong"}
                </p>
              )}
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedDiscount (
        <DeleteDiscountCodeModal discount={selectedDiscount} onClose={()=>setShowDeleteModal(false)} onConfirm={()=>deleteDiscountCodeMutation.mutate(selectedDiscount?.id)} />
      )}
    </div>
  )
}

export default DiscountCodes