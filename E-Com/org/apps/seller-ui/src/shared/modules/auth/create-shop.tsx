import { useMutation } from '@tanstack/react-query';
import { shopCategories } from 'apps/seller-ui/src/utils/shopCategories';
import axios from 'axios';
import React from 'react'
import { useForm } from 'react-hook-form'

const CreateShop = ({ sellerId, setActiveStep }: { sellerId: string, setActiveStep: (step: number) => void }) => {
    const { register, handleSubmit, formState: { errors } }=useForm();
    const shopCreateMutation = useMutation({
        mutationFn: async (data: FormData) => {
            const response = await axios.post(`${process.env.NEXT_PUBLIC_SERVER_URI}/api/create-shop`, data)
            return response.data;
        }, onSuccess: () => {
            setActiveStep(3)
        }
    })
    const onSubmit = async (data: any) => {
        const shopData = { ...data, sellerId }
        shopCreateMutation.mutate(shopData)
    }
    const countWords=(text:string)=>text.trim().split(/\s+/).length
  return (
      <div>
          <form onSubmit={handleSubmit(onSubmit)}>
              <h3 className="text-2xl font-semibold text-center mb-4">
                                  Setup new Shop
                              </h3>
                <label className="block mb-1 text-gray-700">Name</label>
              <input type="text" placeholder="Shop Name" className="w-full p-2 border border-gray-300 rounded-[4px] mb-1 outline-0 focus:outline-none focus:ring-2 focus:ring-blue-500" {...register("name", { required: "Name is required", })} />
                {errors.name && (<p className="text-red-500 text-sm">{String(errors.name.message)}</p>)}

                <label className="block mb-1 text-gray-700">Bio (Max 100 words) </label>
              <input type="text" placeholder="Shop Bio" className="w-full p-2 border border-gray-300 rounded-[4px] mb-1 outline-0 focus:outline-none focus:ring-2 focus:ring-blue-500" {...register("bio", { required: "Name is required",validate:(value)=>countWords(value)<=100||"Bio can't exceed 100 words" })} />
                {errors.bio && (<p className="text-red-500 text-sm">{String(errors.bio.message)}</p>)}
<label className="block mb-1 text-gray-700">Address </label>
              <input type="text" placeholder="Shop Location" className="w-full p-2 border border-gray-300 rounded-[4px] mb-1 outline-0 focus:outline-none focus:ring-2 focus:ring-blue-500" {...register("address", { required: "Shop Address is required",})} />
                {errors.address && (<p className="text-red-500 text-sm">{String(errors.address.message)}</p>)}
<label className="block mb-1 text-gray-700">Opening Hours </label>
              <input type="text" placeholder="e.g., Mon-Fri 9AM-6PM" className="w-full p-2 border border-gray-300 rounded-[4px] mb-1 outline-0 focus:outline-none focus:ring-2 focus:ring-blue-500" {...register("opening_hours", { required: "Opening Hours is required", })} />
                {errors.opening_hours && (<p className="text-red-500 text-sm">{String(errors.opening_hours.message)}</p>)}
<label className="block mb-1 text-gray-700">Website </label>
              <input type="url" placeholder="https://example.com" className="w-full p-2 border border-gray-300 rounded-[4px] mb-1 outline-0 focus:outline-none focus:ring-2 focus:ring-blue-500" {...register("website", { pattern:{value:/^(https?:\/\/)?([\w\d-]+\.)+w{2,}(\/.*)?$/, message:"Enter a valid URL"}})} />
                {errors.website && (<p className="text-red-500 text-sm">{String(errors.website.message)}</p>)}
<label className="block mb-1 text-gray-700">Category </label>
                <select className="w-full p-2 border border-gray-300 rounded-[4px] mb-1 outline-0 focus:outline-none focus:ring-2 focus:ring-blue-500" {...register("category", { required: "Category is required" })}>
                                                  <option value="">Select a category</option>
                                                  {shopCategories.map((category) => (
                                                      <option key={category.value} value={category.value}>
                                                          {category.label}
                                                      </option>
                                                  ))}
                                                </select>
        {errors.category && (<p className="text-red-500 text-sm">{String(errors.category.message)}</p>)}
        <button
          type="submit"
                    // disabled={signupMutation.isPending}
                    className="w-full bg-blue-500 mt-4 text-white py-2 rounded-[4px] hover:bg-blue-600 transition-colors"
                    >
          {/* {signupMutation.isPending? "Signing up...":"Create"} */}
          Create
                              </button>


          </form>
    </div>
  )
}

export default CreateShop
