'use client'

import { useQuery } from '@tanstack/react-query'
import useDeviceTracking from 'apps/user-ui/src/hooks/useDeviceTracking'
import useLocationTracking from 'apps/user-ui/src/hooks/useLocationTracking'
import useRequireAuth from 'apps/user-ui/src/hooks/useRequiredAuth'
import useUser from 'apps/user-ui/src/hooks/useUser'
import { useStore } from 'apps/user-ui/src/store'
import axiosInstance from 'apps/user-ui/src/utils/axiosInstance'
import { Loader2 } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import {toast} from 'sonner'

const Cart = () => {
    const router = useRouter()
    const { user } = useRequireAuth()
    const location = useLocationTracking()
    const deviceInfo = useDeviceTracking()
    const cart = useStore((state: any) => state.cart)
    const removeFromCart = useStore((state: any) => state.removeFromCart)
    const [loading, setLoading] = useState(false)
    const [discountedProductId, setDiscountedProductId] = useState("")
    const [discountPercent, setDiscountPercent] = useState(0)
    const [discountAmount, setDiscountAmount] = useState(0)
    const [couponCode, setCouponCode] = useState("")
    const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
    const [error, setError] = useState("")
    const [storedCouponCode,setStoredCouponCode]=useState("")
    const decreaseQuantity = (id: string) => {
        useStore.setState((state: any) => ({
            cart: state.cart.map((item: any) => item.id === id && item.quantity > 1 ? { ...item, quantity: item.quantity - 1 } : item)
        }))
    }
    const increaseQuantity = (id: string) => {
        useStore.setState((state: any) => ({
            cart: state.cart.map((item: any) => (item.id === id && item.quantity > 0) ? { ...item, quantity: (item.quantity || 1) + 1 } : item)
        }))
    }
    const subTotal = cart?.reduce((total: number, item: any) => total + (item.quantity * item.sale_price), 0)

    const createPaymentSession = async () => {
        if (addresses?.length === 0) {
            toast.error("Please set your delivery address")
            return
        }
        setLoading(true);
        try {
            const res = await axiosInstance.post("/order/api/create-payment-session", {
                cart,
                selectedAddressId,
                coupon: {
                    code: storedCouponCode,
                    discountAmount,
                    discountPercent,
                    discountedProductId
                },
            })
            const sessionId = res.data.sessionId
            router.push(`/checkout?sessionId=${sessionId}`)
        } catch (error) {
            toast.error("Something went wrong.Please try again")
        } finally {
            setLoading(false)
        }
    }

    const couponCodeApplyHandler =async () => {
        setError("")
        if (!couponCode.trim()) {
            setError("Coupon coe is required!")
            return
        }
        try {
            const res = await axiosInstance.put("/order/api/verify-coupon", {
                couponCode: couponCode.trim(),
                cart
            })
            if (res.data.valid) {
                setStoredCouponCode(couponCode.trim())
                setDiscountAmount(parseFloat(res.data.discountAmount))
                setDiscountPercent(res.data.discount)
                setDiscountedProductId(res.data.discountedProductId)
                setCouponCode("")
            } else {
                setDiscountAmount(0)
                setDiscountPercent(0)
                setDiscountedProductId("")
                setError(res.data.message||"Coupon not valid for any items in cart")
            }
        } catch (error:any) {
                setDiscountAmount(0)
                setDiscountPercent(0)
                setDiscountedProductId("")
                setError(error?.response?.data?.message)
        }
    }

    const { data: addresses, isLoading } = useQuery({
    queryKey: ["shipping-addresses"],
    queryFn: async () => {
      const res = await axiosInstance.get("/api/shipping-addresses");
      return res.data.addresses;
    },
    });
    useEffect(() => {
        console.log(addresses)
        if (addresses?.length > 0 && !selectedAddressId) {
            const defaultAddr = addresses.find((addr: any) => addr.isDefault)
            if (defaultAddr) {
                setSelectedAddressId(defaultAddr.id)
            }
        }
    },[addresses,selectedAddressId])
    return (
        <div className='w-full bg-white'>
            <div className='md:w-[80%] w-[95%] mx-auto min-h-screen'>
                <div className='pb-[50px]'>
                    <h1 className=' md:pt-[50px] font-medium text-[44px] leading-[1] mb-[16px] font-jost'>Shopping Cart</h1>
                    <Link href={'/'} className='text-[#55585b] hover:underline'>Home</Link>
                    <span className='inline-block p-[1.5px] mx-1 bg-[#a8acb0] rounded-full'></span>
                    <span className='text-[#55585b]'>Cart</span>
                </div>
                {cart.length === 0 ? (<div className='text-center text-gray-600 text-lg'>Your Cart is empty! Start adding products.</div>) :
                    (<div className='lg:flex items-start gap-10'>
                        <table className='w-full lg:w-[70%] border-collapse'>
                            <thead className='bg-[#f1f1f4] rounded'>
                                <tr>
                                    <th className='py-3 text-left pl-6 align-middle'>Product</th>
                                    <th className='py-3 text-middle align-middle '>Price</th>
                                    <th className='py-3 text-middle align-middle '>Quantity</th>
                                    <th className='py-3 text-middle align-middle '></th>
                                </tr>
                            </thead>
                            <tbody>
                                {cart?.map((item: any) => (
                                    <tr key={item.id} className='border-b border-b-[#0000000e]'>
                                        <td className='flex items-center gap-4 p-4'>
                                            <Image src={item.images[0]?.url} alt={item.title} width={80} height={80} className="rounded" />
                                            <span >{item.title}</span>
                                            {item?.selectedOptions && (<div className='text-sm text-gray-500'>
                                                {item?.selectedOptions?.color && (<span>Color:{ }<span style={{ backgroundColor: item?.selectedOtions?.color, width: "12px", height: "12px", borderRadius: "100%", display: "inline-block" }} /></span>)}
                                                {item?.selectedOptions?.size && (<span className='ml-2'>Size:{item?.selectedOptions?.size}</span>)}
                                            </div>)}
                                        </td>
                                        <td className='px-6 text-lg text-center'>{item?.id === discountedProductId ? (<div className='flex flex-col items-center'>
                                            <span className='line-through text-gray-500 text'>{item.sale_price.toFixed(2)}</span>{" "}
                                            <span className='text-green-600 font-semibold'>{((item.sale_price * (100 - discountPercent)) / 100).toFixed(2)}</span>
                                            <span className='text-green-700 text-xs bg-green-50'>Discount Applied</span>
                                        </div>) : (<span>₹{item.sale_price.toFixed(2)}</span>)}
                                        </td>
                                        <td><div className='flex justify-center items-center border border-gray-200 rounded-[20px] w-[90px] p-[2px]'>
                                            <button className='text-black cursor-pointer text-xl' onClick={() => decreaseQuantity(item.id)}>-</button>
                                            <span className='px-4'>{item?.quantity}</span>
                                            <button className='text-black cursor-pointer text-xl' onClick={() => increaseQuantity(item.id)}>+</button>
                                        </div></td>
                                        <td className='text-center'><button className="text-[#818487] cursor-pointer hover:text-[#ff1826] transition duration-200"
                                            onClick={() => removeFromCart(item.id, user, location, deviceInfo)}>x Remove</button></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <div className='p-6 shadow-md w-full lg:w-[30%] bg-[#f9f9f9] rounded-lg'>
                            {discountAmount > 0 && (<div className='flex justify-between items-center text-[#010f1c] text-base font-mediun pb-1'>
                                <span className="font-jost">Discount ({discountPercent}%)</span>
                                <span className="text-green-600">- ₹{discountAmount.toFixed(2)}</span>
                            </div>)}
                            <div className='flex justify-between items-center text-[#010f1c] text-[20px] font-[550] pb-3'>
                                <span className="font-jost">Subtotal</span>
                                <span>₹{(subTotal - discountAmount).toFixed(2)}</span>
                            </div>
                            <hr className="my-4 text-slate-200" />
                            <div className='mb-4'>
                                <h4 className='mb-[7px] font-[500] text-[15px]'>
                                    Have a Coupon ?
                                </h4>
                                <div className='flex'>
                                    <input type="text" onChange={(e: any) => setCouponCode(e.target.value)} placeholder="Enter coupon code" value={couponCode}
                                        className="w-full p-2 border-gray-200 rounded-l-md focus:border-blue-500" />
                                    <button className='bg-blue-500 cursor-pointer text-white px-4 rounded-r-md hover:bg-blue-600 transition-all'
                                      onClick={() => couponCodeApplyHandler()}
                                    >Apply</button>
                                </div>
                                {error && (<p className='text-sm pt-2 text-red-500'>{error}</p>)}
                                <hr className="my-4 text-slate-200" />
                                <div className="mb-4">
                                    <h4 className="mb-[7px] font-medium text-[15px]">Select Shipping Address</h4>
                                    <select
                                        className="w-full p-2 border-gray-200 rounded-md focus:outline-none focus:border-blue-500"
                                        value={selectedAddressId || ''}
                                        onChange={(e) => setSelectedAddressId(e.target.value || null)}
                                        required
                                    >
                                        <option value="">Select an address</option>
                                        {addresses?.map((address:any) => (
                                            <option key={address.id} value={address.id}>
                                                {address.name} - {address.street}, {address.city}, {address.state} {address.zip}
                                            </option>
                                        ))}
                                    </select>
                                    {addresses?.length === 0 && (<p className='text-sm text-slate-800'>
                                        Please add an address from profileto create an order!
                                    </p>)}
                                    </div>
                                <hr className="my-4 text-slate-200" />
                                <div className="flex justify-between items-center text-center text-[#010f1c] text-[20px] font-[550] pb-3">
                                    <span className="font-jost">Total</span>
                                    <span>₹{(subTotal - discountAmount).toFixed(2)} </span>
                                </div>
                                <button onClick={createPaymentSession} disabled={loading} className='w-full flex items-center justify-center gap-2 cursor-pointer mt-4 py-3 bg-[#010f1c] text-white hover:bg-[#0989FF] translation-all rounded-lg'>
                                    {loading && <Loader2 className="animate-spin w-5 h-5" />}
                                    {loading ? "Redirecting..." : "Proceed to Checkout"}
                                </button>
                            </div>
                        </div>
                    </div>
                    )}
            </div>
        </div>
    )
}

export default Cart
