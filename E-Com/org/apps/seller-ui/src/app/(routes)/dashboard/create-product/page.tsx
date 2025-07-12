'use client'
import ImagePlaceholder from 'apps/seller-ui/src/shared/components/image-placeholder'
import { ChevronRight } from 'lucide-react'
import ColorSelector from 'packages/components/color-selector'
import CustomSpecifications from 'packages/components/custom-specifications'
import Input from 'packages/components/input'
import React, { useState } from 'react'
import { useForm } from 'react-hook-form'

const CreateProduct = () => {
    const { register, control, watch, setValue, handleSubmit, formState: { errors } } = useForm()
    const [openImageModal, setOpenImageModal] = useState(false)
    const [isChanged, setIsChanged] = useState(false)
    const [images, setImages] = useState<(File | null)[]>([null])
    const [loading, isLoading] = useState(false)

    const handleImageChange = (file: File | null, index: number) => {
        const updateImages = [...images]
        updateImages[index] = file;
        if (index === images.length - 1 && images.length < 8) {
            updateImages.push(null)
        }
        setImages(updateImages)
        setValue("images",updateImages)

    }
    const handleRemoveImage = ( index: number) => {
        setImages((prevImages) => {
            let updatedImages = [...prevImages]
            if (index == -1){
                updatedImages[0] = null;
            } else {
                updatedImages.splice(index,1)
            }
            if (!updatedImages.includes(null) && updatedImages.length < 8) {
                updatedImages.push(null)
            }
            return updatedImages
        })
        setValue("images",images)

    }
    const onSubmit = (data: any) => {

    }
  return (
      <form className='w-full mx-auto p-8 shadow-md rounded-lg text-white' onSubmit={handleSubmit(onSubmit)}>
          <h2 className='text-2xl py-2 font-semibold font-Poppins text-white'>Create Product</h2>
          <div className='flex items-center'>
              <span className='text-[#80Deea] cursor-pointer'>Dashboard</span>
              <ChevronRight size={20} className='opacity-[.8]' />
              <span>Create Product</span>
          </div>
          <div className='py-4 w-full flex gap-6'>
              <div className='md:w-[35%]'>
                  {images?.length>0 && (
                      <ImagePlaceholder size='765 x 850' small={false} index={0} onImageChange={handleImageChange} setOpenImageModal={setOpenImageModal} onRemove={handleRemoveImage} />)}
                  <div className='grid grid-cols-2 gap-3 mt-4'>
                  {images.slice(1).map((_, index) => (

                      <ImagePlaceholder size='765 x 850' small key={index} index={index+1} onImageChange={handleImageChange} setOpenImageModal={setOpenImageModal} onRemove={handleRemoveImage} />
                  ))}
              </div>
              </div>

              <div className="md:w-[65%]">
              <div className='w-full flex gap-6'>
                      <div className='w-2/4'>
                          <div className='mt-2'>
                              <Input label="Product Title" placeholder='Enter product title' {...register("title", { required: "Title is required" })} />
                        {errors.title && (<p className="text-red-500 text-sm">{String(errors.title.message)}</p>)}

                          </div>
                          <div className='mt-2'>
                                                    <Input type='textarea' label="Short Description (Max 150 words)" rows={7} cols={10} placeholder='Enter product description for quick view' {...register("description", { required: "description is required", validate:(value)=>{
                            const wordCount=value.trim().split(/\s+/).length
                            return (wordCount <=150 || `Description cannot exceed 150 words(Current:${wordCount})`)
                          } })} />
                          {errors.description && (<p className="text-red-500 text-sm">{String(errors.description.message)}</p>)}

                          </div>
                          <div className='mt-2'>
                          <Input label="Tags" placeholder='apple,flagship' {...register("tags", { required: "Seperate releted products tags with a coma" })} />
                        {errors.tags && (<p className="text-red-500 text-sm">{String(errors.tags.message)}</p>)}
                          </div>
                          <div className='mt-2'>
                          <Input label="Warranty" placeholder='1 Year / No Warranty' {...register("warranty", { required: "Warranty is required!" })} />
                        {errors.warranty && (<p className="text-red-500 text-sm">{String(errors.warranty.message)}</p>)}
                          </div>
                          <div className='mt-2'>
                              <Input label="Slug" placeholder='product_slug' {...register("slug", {
                                  required: "Slug is required!", pattern: { value: /^[a-z0-9]+(?:-[a-z0-9]+)*$/, message: "Invalid slug format! Use only lowercase letters, numbers and " },
                                  minLength:{value:3, message:"Slug must be at least 3 characters long"}, maxLength:{value:50,message:"Slug cannot be longer than 50 characters."}
                              })} />
                        {errors.slug && (<p className="text-red-500 text-sm">{String(errors.slug.message)}</p>)}
                          </div>
                          <div className='mt-2'>
                          <Input label="Brand" placeholder='Apple' {...register("brand", { required: "Seperate releted products brand with a coma" })} />
                        {errors.brand && (<p className="text-red-500 text-sm">{String(errors.brand.message)}</p>)}
                          </div>
                          <div className='mt-2'>
                              <ColorSelector control={control} errors={errors} />
                          </div>
                          <div className='mt-2'>
                              <CustomSpecifications control={control} errors={errors}/>
                          </div>
                  </div>
                </div>
          </div>
          </div>

    </form>
  )
}

export default CreateProduct
