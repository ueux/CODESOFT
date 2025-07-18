import Image from 'next/image'
import Link from 'next/link'
import React, { useState } from 'react'
import Ratings from '../ratings'
import { Heart, MapPin, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import CartIcon from 'apps/user-ui/src/assets/svgs/cartIcon'
import { useStore } from 'apps/user-ui/src/store'
import useUser from 'apps/user-ui/src/hooks/useUser'
import useLocationTracking from 'apps/user-ui/src/hooks/useLocationTracking'
import useDeviceTracking from 'apps/user-ui/src/hooks/useDeviceTracking'

const ProductDetailsCard = ({ data, setOpen }: { data: any, setOpen: (open: boolean) => void }) => {
  const [activeImage, setActiveImage] = useState(0)
  const router = useRouter()
  const [selectedColor, setSelectedColor] = useState(data?.colors?.[0] || "")
  const [selectedSize, setSelectedSize] = useState(data?.sizes?.[0] || "")
  const [quantity, setQuantity] = useState(1)
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const wishlist = useStore((state: any) => state.wishlist)
  const isWishlisted=wishlist.some((item:any)=>item.id===data.id)
  const addToWishlist=useStore((state:any)=>state.addToWishlist)
  const removeFromWishlist = useStore((state: any) => state.removeFromWishlist)
  const user = useUser()
  const location = useLocationTracking()
  const deviceInfo=useDeviceTracking()
  const addToCart = useStore((state: any) => state.addToCart)
  const cart = useStore((state: any) => state.cart)
  const isInCart=cart.some((item:any)=>item.id===data.id)

  // Calculate estimated delivery date (3-7 business days)
  const estimatedDelivery = new Date()
  const deliveryDays = 3 // Random 3-7 days
  estimatedDelivery.setDate(estimatedDelivery.getDate() + deliveryDays)

  // Calculate discount percentage
  const discountPercentage = data?.regular_price
    ? Math.round(((data.regular_price - data.sale_price) / data.regular_price * 100))
    : 0
  const handleAddToCart = () => {
    setIsAddingToCart(true)
    const payload = {
      ...data,
      selectedColor,
      selectedSize,
      quantity,
    };
    addToCart(payload, user, location, deviceInfo);

    setActiveImage(0)
      setIsAddingToCart(false)
  }

  return (
    <div className='fixed flex items-center justify-center top-0 left-0 h-screen w-full bg-black/30 z-50 backdrop-blur-sm' onClick={() => setOpen(false)}>
      <div className='w-[80%] md:w-[70%] md:mt-14 2xl:mt-0 h-max overflow-y-auto max-h-[80vh] min-h-[70vh] p-4 md:p-6 bg-white shadow-xl rounded-xl border border-gray-200' onClick={(e) => e.stopPropagation()}>
        <div className="w-full flex flex-col md:flex-row gap-6">
        {/* Close Button */}
        <button
          className='absolute right-4 top-4 z-10 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors'
          onClick={() => setOpen(false)}
          aria-label="Close product details"
        >
          <X size={24} className='text-gray-700' />
        </button>

        {/* Left Column - Images */}
        <div className='w-full md:w-1/2 bg-gray-50 p-4'>
          <div className='relative aspect-square rounded-lg overflow-hidden'>
            {data?.images?.[activeImage]?.url ? (
              <Image
                src={data.images[activeImage].url}
                alt={data?.title || "Product image"}
                fill
                className='object-contain transition-opacity duration-300'
                priority
              />
            ) : (
              <div className='absolute inset-0 flex items-center justify-center bg-gray-200'>
                <span className='text-gray-500'>No image available</span>
              </div>
            )}
          </div>

          {/* Thumbnail Gallery */}
          <div className='flex gap-3 mt-4 overflow-x-auto pb-2 scrollbar-hide'>
            {data?.images?.map((img: any, index: number) => (
              <button
                key={index}
                className={`shrink-0 relative aspect-square w-16 h-16 rounded-md overflow-hidden border-2 transition-all ${
                  activeImage === index
                    ? "border-blue-500 scale-105 shadow-sm"
                    : "border-transparent hover:border-gray-300"
                }`}
                onClick={() => setActiveImage(index)}
              >
                <Image
                  src={img?.url}
                  alt={`Thumbnail ${index}`}
                  fill
                  className='object-cover'
                />
              </button>
            ))}
          </div>
        </div>

        {/* Right Column - Details */}
        <div className='w-full md:w-1/2 p-6 overflow-y-auto'>
          {/* Shop Info */}
          <div className='flex items-start gap-4 pb-4 border-b border-gray-200'>
            <div className='relative w-14 h-14 rounded-full border-2 border-white shadow-sm overflow-hidden'>
              {data?.Shop?.avatar ? (
                <Image
                  src={data.Shop.avatar}
                  alt={data?.Shop?.name || "Shop logo"}
                  fill
                  className='object-cover'
                />
              ) : (
                <div className='absolute inset-0 bg-gradient-to-r from-blue-100 to-purple-100 flex items-center justify-center'>
                  <span className='text-xs font-medium text-gray-600'>
                    {data?.Shop?.name?.charAt(0) || 'S'}
                  </span>
                </div>
              )}
            </div>

            <div className='flex-1'>
              <Link
                href={`/shop/${data?.Shop?.id}`}
                className="text-lg font-semibold hover:text-blue-600 transition-colors"
              >
                {data?.Shop?.name}
              </Link>
              <div className="mt-1 flex items-center gap-2">
                <Ratings rating={data.Shop.ratings} starSize="w-3 h-3" />
                <span className='text-sm text-gray-500'>
                  ({data.Shop.reviews?.length || 0} reviews)
                </span>
              </div>
              <p className='text-gray-600 mt-1 flex items-center text-sm'>
                <MapPin size={16} className='mr-1 text-blue-500'/>
                {data?.Shop?.address || "Location Not Available"}
              </p>
            </div>

            <button
              className='flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors shadow-sm whitespace-nowrap'
              onClick={() => router.push(`/inbox?shopId=${data?.Shop?.id}`)}
            >
              <span>💬</span>
              <span>Chat</span>
            </button>
          </div>

          {/* Product Info */}
          <h1 className='text-2xl md:text-3xl font-bold mt-4 text-gray-900'>{data?.title}</h1>

          {discountPercentage > 0 && (
            <span className='inline-block mt-2 bg-red-100 text-red-700 text-sm font-bold px-2 py-1 rounded-full'>
              {discountPercentage}% OFF
            </span>
          )}

          <p className='mt-3 text-gray-700 whitespace-pre-wrap'>
            {data?.short_description}
          </p>

          {data?.brand && (
            <p className='mt-3 text-gray-600'>
              <strong className='font-medium text-gray-800'>Brand:</strong> {data.brand}
            </p>
          )}

          {/* Price Display */}
          <div className='mt-4 flex items-baseline gap-3'>
            <span className='text-2xl font-bold text-gray-900'>
              ₹{data?.sale_price?.toLocaleString('en-IN')}
            </span>
            {data?.regular_price && (
              <span className='text-lg text-gray-500 line-through'>
                ₹{data.regular_price.toLocaleString('en-IN')}
              </span>
            )}
          </div>

          {/* Color Selection */}
          {data?.colors?.length > 0 && (
            <div className='mt-6'>
              <h4 className="font-medium text-gray-800 mb-2">Color:</h4>
              <div className="flex flex-wrap gap-3">
                {data.colors.map((color: string, index: number) => (
                  <button
                    key={index}
                    className={`w-10 h-10 rounded-full border-2 transition-all flex items-center justify-center ${
                      selectedColor === color
                        ? "border-gray-800 scale-110 shadow-sm"
                        : "border-transparent hover:border-gray-400"
                    }`}
                    onClick={() => setSelectedColor(color)}
                    style={{ backgroundColor: color }}
                    aria-label={`Select color ${color}`}
                  >
                    {
                    selectedColor === color && (
                      <span className="text-white text-xs">✓</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Size Selection */}
          {data?.sizes?.length > 0 && (
            <div className='mt-6'>
              <h4 className="font-medium text-gray-800 mb-2">Size:</h4>
              <div className="flex flex-wrap gap-2">
                {data.sizes.map((size: string, index: number) => (
                  <button
                    key={index}
                    className={`px-4 py-2 border rounded-md transition-all font-medium ${
                      selectedSize === size
                        ? "border-blue-600 bg-blue-50 text-blue-700 shadow-inner"
                        : "border-gray-200 hover:border-gray-300 bg-white"
                    }`}
                    onClick={() => setSelectedSize(size)}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity & Actions */}
          <div className='mt-8 pt-4 border-t border-gray-200'>
            <div className='flex items-center gap-4'>
              <div className='flex items-center border border-gray-300 rounded-lg overflow-hidden'>
                <button
                  className='px-4 py-2 bg-gray-100 hover:bg-gray-200 transition-colors text-gray-700 font-medium'
                  onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                  disabled={quantity <= 1}
                >
                  -
                </button>
                <span className='px-4 py-2 bg-white font-medium w-12 text-center'>
                  {quantity}
                </span>
                <button
                  className='px-4 py-2 bg-gray-100 hover:bg-gray-200 transition-colors text-gray-700 font-medium'
                  onClick={() => setQuantity(prev => prev + 1)}
                >
                  +
                </button>
              </div>

              <button
                className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 ${
                  isAddingToCart ? 'bg-orange-500' : 'bg-orange-600 hover:bg-orange-700'
                } text-white font-medium rounded-lg transition-colors shadow-sm`}
                onClick={handleAddToCart}
                disabled={isInCart}
              >
                {isAddingToCart ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Adding...
                  </>
                ) : (
                  isInCart?<Link href={`/cart`}>Buy Now</Link>:<>
                    <CartIcon className="w-5 h-5" />
                    Add to Cart
                  </>
                )}
              </button>

              <button
                className={`p-3 rounded-full transition-colors ${isWishlisted ? 'text-red-500 bg-red-50' : 'text-gray-400 hover:text-red-500 hover:bg-red-50'}`}
                onClick={() => (isWishlisted) ? removeFromWishlist(data.id, user, location, deviceInfo) :
                                addToWishlist({...data,quantity:1}, user, location, deviceInfo) }
                aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
              >
                <Heart size={24} fill={isWishlisted ? 'currentColor' : 'none'} />
              </button>
            </div>

            {/* Stock & Delivery */}
            <div className='mt-6 space-y-2'>
              <div className='flex items-center gap-2'>
                <span className={`w-3 h-3 rounded-full ${
                  data.stock > 0 ? 'bg-green-500' : 'bg-red-500'
                }`}></span>
                <span className={data.stock > 0 ? 'text-green-600' : 'text-red-600'}>
                  {data.stock > 0 ? `In Stock (${data.stock} available)` : 'Out of Stock'}
                </span>
              </div>

              <div className='flex items-center gap-2 text-gray-600'>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>
                  Estimated Delivery: <strong className='text-gray-800'>{estimatedDelivery.toDateString()}</strong>
                </span>
              </div>
            </div>
          </div>
          </div>
          </div>
      </div>
    </div>
  )
}

export default ProductDetailsCard