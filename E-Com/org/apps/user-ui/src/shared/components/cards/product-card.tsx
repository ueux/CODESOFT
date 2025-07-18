import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import Ratings from '../ratings'
import { Eye, Heart, ShoppingBag } from 'lucide-react'
import ProductDetailsCard from './product-details-card'
import Image from 'next/image'
import { useStore } from 'apps/user-ui/src/store'
import useUser from 'apps/user-ui/src/hooks/useUser'
import useLocationTracking from 'apps/user-ui/src/hooks/useLocationTracking'
import useDeviceTracking from 'apps/user-ui/src/hooks/useDeviceTracking'

const ProductCard = ({ product, isEvent }: { product: any, isEvent?: boolean }) => {
    const [timeLeft, setTimeLeft] = useState("")
    const [open, setOpen] = useState(false)
    const addToWishlist=useStore((state:any)=>state.addToWishlist)
    const removeFromWishlist = useStore((state: any) => state.removeFromWishlist)
    const wishlist = useStore((state: any) => state.wishlist)
    const isWishlisted=wishlist.some((item:any)=>item.id===product.id)
    const addToCart = useStore((state: any) => state.addToCart)
    const removeFromCart=useStore((state:any)=>state.removeFromCart)
    const cart = useStore((state: any) => state.cart)
    const isInCart=cart.some((item:any)=>item.id===product.id)
    const [isHovered, setIsHovered] = useState(false)

    const user = useUser()
    const location = useLocationTracking()
    const deviceInfo=useDeviceTracking()

    // Calculate discount percentage if not provided
    const discountPercentage = product?.discountPercentage ||
        (product?.regular_price ?
            Math.round(((product.regular_price - product.sale_price) / product.regular_price) * 100) :
            0)

    useEffect(() => {
        if (isEvent && product?.ending_date) {
            const calculateTimeLeft = () => {
                const endTime = new Date(product.ending_date).getTime()
                const now = Date.now()
                const diff = endTime - now

                if (diff <= 0) {
                    setTimeLeft("Offer Expired")
                    return
                }

                const days = Math.floor(diff / (1000 * 60 * 60 * 24))
                const hours = Math.floor((diff / (1000 * 60 * 60)) % 24)
                const minutes = Math.floor((diff / (1000 * 60)) % 60)
                setTimeLeft(`${days}d ${hours}h ${minutes}m left`)
            }

            // Calculate immediately
            calculateTimeLeft()

            // Then set interval
            const interval = setInterval(calculateTimeLeft, 60000)
            return () => clearInterval(interval)
        }
    }, [isEvent, product?.ending_date])

    return (
        <div
            className='w-full min-h-[380px] h-max bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 relative border border-gray-200 overflow-hidden'
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {open && (
                <ProductDetailsCard data={product} setOpen={setOpen} />
            )}

            {/* Badges */}
            <div className='absolute top-3 left-3 right-3 flex justify-between z-10'>
                <div className='flex gap-2'>
                    {isEvent && (
                        <span className='bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full shadow-sm'>
                            {discountPercentage > 0 ? `-${discountPercentage}%` : 'OFFER'}
                        </span>
                    )}
                    {product?.status === 'Pending' && (
                        <span className='bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-sm'>
                            PENDING
                        </span>
                    )}
                </div>

                {product?.stock <= 5 && (
                    <span className='bg-yellow-400 text-gray-800 text-xs font-bold px-2 py-1 rounded-full shadow-sm'>
                        Only {product.stock} left
                    </span>
                )}
            </div>

            {/* Quick Actions - Show on hover */}
            {isHovered && (
                <div className='absolute z-10 flex flex-col gap-3 right-3 top-12'>
                    <button
                        className='bg-white rounded-full p-2 shadow-md hover:scale-110 transition-transform'
                        onClick={(e) => {
                                (isWishlisted) ? removeFromWishlist(product.id, user, location, deviceInfo) :
                                addToWishlist({...product,quantity:1}, user, location, deviceInfo)
                        }}
                        aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                    >
                        <Heart
                            size={18}
                            fill={isWishlisted ? 'red' : 'none'}
                            stroke={isWishlisted ? 'red' : '#4b5563'}
                            className='transition-colors'
                        />
                    </button>
                    <button
                        className='bg-white rounded-full p-2 shadow-md hover:scale-110 transition-transform'
                        onClick={(e) => {
                            e.preventDefault()
                            setOpen(true)
                        }}
                        aria-label="Quick view"
                    >
                        <Eye size={18} className='text-gray-700'/>
                    </button>
                    <button
                        className='bg-white rounded-full p-2 shadow-md hover:scale-110 transition-transform'
                        onClick={(e) =>
                            (isInCart) ? removeFromCart(product.id, user, location, deviceInfo) :
                                addToCart({...product,quantity:1}, user, location, deviceInfo)
                        }
                        aria-label="Add to cart"
                    >
                         <ShoppingBag
                            size={18}
                            className={
                                isInCart
                                    ? "text-green-500"
                                    : "text-gray-500 hover:text-gray-700"
                            }
                        />
                    </button>
                </div>
            )}

            {/* Product Image */}
            <Link href={`/product/${product?.slug}`} className='block relative aspect-square group'>
                {product?.images?.[0]?.url ? (
                    <Image
                        src={product.images[0].url}
                        alt={product?.title || "Product image"}
                        fill
                        className={`object-cover transition-transform duration-300 ${isHovered ? 'scale-105' : ''}`}
                        priority
                    />
                ) : (
                    <div className='w-full h-full bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center'>
                        <span className='text-gray-400'>No image available</span>
                    </div>
                )}

                {/* Image overlay effect */}
                <div className={`absolute inset-0 bg-black/10 transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}></div>
            </Link>

            {/* Product Info */}
            <div className='p-4'>
                <Link
                    href={`/shop/${product?.Shop?.id}`}
                    className='block text-blue-600 text-sm font-medium mb-1 hover:underline truncate'
                    title={product?.Shop?.name || "Unknown Shop"}
                >
                    {product?.Shop?.name || "Unknown Shop"}
                </Link>

                <Link
                    href={`/product/${product?.slug}`}
                    className='text-base font-semibold text-gray-800 hover:text-blue-600 transition-colors line-clamp-2 h-[3rem]'
                    title={product?.title}
                >
                    {product?.title}
                </Link>

                <div className='mt-2 flex items-center gap-1'>
                    <Ratings
                        rating={product?.ratings || 4.9}
                        showNumber
                        precision={1}
                        starSize="w-3 h-3"
                        className="text-sm"
                    />
                </div>

                {/* Price Section */}
                <div className='mt-3 flex justify-between items-center'>
                    <div className='flex items-baseline gap-2'>
                        <span className='text-lg font-bold text-gray-900'>
                            ₹{product?.sale_price?.toLocaleString('en-IN') || '0'}
                        </span>
                        {product?.regular_price && (
                            <span className='text-sm line-through text-gray-400'>
                                ₹{product.regular_price.toLocaleString('en-IN')}
                            </span>
                        )}
                    </div>
                    <span className='text-green-600 text-xs font-medium bg-green-100 px-2 py-1 rounded-full'>
                        {product?.totalSales || 0} sold
                    </span>
                </div>

                {/* Event Timer */}
                {isEvent && timeLeft && (
                    <div className={`mt-3 text-xs font-medium px-3 py-1.5 rounded-full inline-block ${
                        timeLeft === "Offer Expired"
                            ? 'bg-gray-100 text-gray-600'
                            : 'bg-orange-50 text-orange-600'
                    }`}>
                        ⏳ {timeLeft}
                    </div>
                )}

                {/* Additional Info */}
                <div className='mt-3 flex justify-between items-center text-xs text-gray-500'>
                    <span className='truncate max-w-[50%]' title={product?.category}>
                        {product?.category || 'No category'}
                    </span>
                    <span>
                        {product?.deliveryTime || '3-5 days'}
                    </span>
                </div>

                {/* Stock Status */}
                <div className='mt-2'>
                    {product?.stock > 0 ? (
                        <div className='flex items-center gap-1 text-xs'>
                            <span className='w-2 h-2 rounded-full bg-green-500'></span>
                            <span className='text-green-600 font-medium'>
                                In Stock ({product.stock} available)
                            </span>
                        </div>
                    ) : (
                        <div className='flex items-center gap-1 text-xs'>
                            <span className='w-2 h-2 rounded-full bg-red-500'></span>
                            <span className='text-red-600 font-medium'>
                                Out of Stock
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default ProductCard