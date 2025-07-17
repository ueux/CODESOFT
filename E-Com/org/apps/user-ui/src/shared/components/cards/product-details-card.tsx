import Image from 'next/image'
import Link from 'next/link'
import React, { useState } from 'react'
import Ratings from '../ratings'
import { Heart, MapPin, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import CartIcon from 'apps/user-ui/src/assets/svgs/cartIcon'

const ProductDetailsCard = ({ data, setOpen }: { data: any, setOpen: (open: boolean) => void }) => {
  const [activeImage, setActiveImage] = useState(0)
  const router=useRouter()
  const [selectedColor,setSelectedColor]=useState(data?.colors?.[0]||"")
  const [selectedSize, setSelectedSize] = useState(data?.sizes?.[0] || "")
  const [quantity, setQuantity] = useState(1)
  const estimatedDelivery = new Date()
  estimatedDelivery.setDate(estimatedDelivery.getDate()+5)
  return (
    <div className='fixed flex items-center justify-center top-0 left-0 h-screen w-full bg-[#0000001d] z-50 ' onClick={() => setOpen(false)}>
      <div className='w-[90%] md:w-[70%] md:mt-14 2xl:mt-0 h-max overflow-scroll min-h-[70vh] p-4 md:p-6 bg-white shadow-md rounded-lg' onClick={(e) => e.stopPropagation()}>
        <div className="w-full flex flex-col md:flex-row">
          <div className='w-full md:w-1/2 h-full'>
            <Image src={data?.images?.[activeImage]?.url} alt={data?.images?.[activeImage].url} width={400} height={400} className='w-full rounded-lg object-contain' />
            <div className='flex gap-2 mt-4'>
              {data?.images?.map((img: any, index: number) => {
                <div key={index} className={`cursor-pointer border rounded-md ${activeImage===index? "border-gray-500 pt-1":"border-transparent"}`} onClick={()=>setActiveImage(index)}>
                  <Image src={img?.url} alt={`Thumbnail ${index}`} width={80} height={80} className='rounded-md'/>
                </div>
              })}
            </div>
          </div>
            <div className='w-full md:w-1/2 md:pl-8 mt-6 md:mt-0'>
              <div className='border-b relative pb-3 border-gray-200 flex items-center justify-between'>
                <div className='flex items-start gap-3'>
                  <Image src={data?.Shop?.avatar} alt='Shop Logo' width={60} height={60} className='rounded-full w-[60px] h-[60px] object-cover'/>
                <div>
                  <Link href={`/sop/${data?.Shop?.id}`} className="text-lg font-medium">{data?.Shop?.name}</Link>
                <span className="block mt-1" ><Ratings rating={data.Shop.ratings} /></span>
                <p className='text-gray-600 mt-1 flex items-center'>
                  <MapPin size={20}/>{" "}{data?.Shop?.address|| "Location Not Available"}
                </p>
                </div>

              </div>
              <button className='flex cursor-pointer items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl' onClick={() => router.push(`/inbox?shopId=${data?.Shop?.id}`)} >💬 Chat with Seller</button>
              <button className='w-full absolute cursor-pointer right-[-5px] top-[-5px] flex justify-end my-2 mt-[-10px] '><X size={25} onClick={()=>setOpen(false)}/></button>
            </div>
            <h3 className='text-xl mt-3 font-semibold'>{data?.title}</h3>
            <p className='mt-2 text-gray-700 whitespace-pre-wrap w-full'>{data?.short_description}</p>
            {data?.brand && (<p className='mt-2'><strong>Brand:</strong>{data.brand}</p>)}

            <div className='flex flex-col md:flex-row items-start gap-5 mt-4'>
              {data?.colors?.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Color:</h4>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {data.colors.map((color:string, index:number) => (
                      <button
                        key={index}
                        className={`w-8 h-8 rounded-full border-2 transition-all ${
                          selectedColor === color
                            ? "border-gray-600 scale-110 shadow-md"
                            : "border-transparent"
                        }`}
                        onClick={() => setSelectedColor(color)}
                        style={{ backgroundColor: color }}
                        aria-label={`Select color ${color}`}
                      />
                    ))}
                  </div>
                </div>
              )}
              {data?.sizes?.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Size:</h4>
                  <div className="flex flex-wrap gap-2">
                    {data.sizes.map((size:string, index:number) => (
                      <button
                        key={index}
                        className={`px-4 py-2 border rounded-md transition-all ${
                          selectedSize === size
                            ? "border-blue-600 bg-blue-50 text-blue-700"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                        onClick={() => setSelectedSize(size)}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                  </div>
              )}
              </div>
                  <div className='mt-5 flex items-center gap-4'>
                    {data?.sale_price && (<h3 className='text-2xl font-semibold text-gray-900'>₹{data.sale_price}</h3>)}
                    {data?.regular_price && (<h3 className='text-lg text-red-600 line-through'>₹{data.regular_price}</h3>)}
                  </div>
              <div className='mt-5 flex items-center gap-5'>
                <div className='flex items-center rounded-md'>
                  <button className='px-3 cursor-pointer py-1 bg-gray-300 hover:bg-gray-400 font-semibold rounded-l-md' onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}>-</button>
                  <span className='px-4 py-1 bg-gray-100'>{quantity}</span>
                  <button className='px-3 cursor-pointer py-1 bg-gray-300 hover:bg-gray-400 font-semibold rounded-r-md' onClick={() => setQuantity((prev) => Math.max(1, prev + 1))}>+</button>
                </div>
                <button className='flex items-center gap-2 px-4 bg-[#ff5722] hover:bg-[#e64a19] text-white font-medium rounded-lg transition'><CartIcon/>Add to Cart</button>
                <button className="opacity-[.7] cursor-pointer ">
                  <Heart size={30} fill='red' color='transparent'/>
                  </button>
            </div>
            <div className='mt-3'>
              {data.stock>0?(<span className='text-green-600 font-semibold'>In Stock</span>):(<span className='text-red-600 font-semibold'>Out of Stock</span>)}
            </div>{" "}
            <div className='mt-3 text-gray-600 text-sm'>
              Estimated Dilivery:{" "}<strong>{estimatedDelivery.toDateString()}</strong>
            </div>
            </div>
          </div>

        </div>
      </div>
  )
}

export default ProductDetailsCard
