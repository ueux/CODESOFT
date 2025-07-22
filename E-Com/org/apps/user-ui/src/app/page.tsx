'use client'

import React from 'react'
import Hero from '../shared/modules/hero'
import SectionTitle from '../shared/components/section/section-title'
import { useQuery } from '@tanstack/react-query'
import axiosInstance from '../utils/axiosInstance'
import ProductCard from '../shared/components/cards/product-card'
import ShopCard from '../shared/components/cards/shop.card'

const Page = () => {
  const { data: products, isLoading, isError } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const res = await axiosInstance.get("/product/api/get-all-products?page=1&limit=10")
      return res.data.products
    },
    staleTime: 1000 * 60 * 2
  })
  const { data: latestProducts } = useQuery({
    queryKey: ["latest-products"],
    queryFn: async () => {
      const res = await axiosInstance.get("/product/api/get-all-products?page=1&limit=10&type=latest")
      return res.data.products
    },
    staleTime: 1000 * 60 * 2
  })
  const { data: shops, isLoading: shopLoading } = useQuery({
    queryKey: ["shops"],
    queryFn: async () => {
      const res = await axiosInstance.get("/product/api/get-top-shops")
      return res.data.shops
    },
    staleTime: 1000 * 60 * 2
  })
  const { data: offers, isLoading:offerLoading } = useQuery({
    queryKey: ["offers"],
    queryFn: async () => {
      const res = await axiosInstance.get("/product/api/get-all-events?page=1&limit=10")
      return res.data.products
    },
    staleTime: 1000 * 60 * 2
  })
  return (
    <div className='bg-gradient-to-b from-gray-50 to-white'>
      <Hero />
      <div className='max-w-7xl w-[90%] my-12 mx-auto'>
        <div className='mb-12'>
          <SectionTitle title='Suggested Products' subtitle='Discover our carefully curated selection' />
        </div>
        {isLoading && (
          <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6'>
            {Array.from({ length: 10 }).map((_, index) => (
              <div key={index} className='h-[300px] bg-gradient-to-r from-gray-100 to-gray-200 animate-pulse rounded-lg shadow-sm' />
            ))}
          </div>
        )}
        {!isLoading && !isError && (
          <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6'>
            {products?.map((product: any) => (
              <ProductCard
                key={product.id}
                product={product}
              />
            ))}
          </div>
        )}
      </div>
      {products?.length === 0 && (<p className='text-center'>No Products Available</p>)}

      {/* Latest Products Section */}
      {latestProducts && (
        <div className='max-w-7xl w-[90%] my-16 mx-auto'>
          <div className='mb-12'>
            <SectionTitle title='New Arrivals' subtitle='Fresh picks just for you' />
          </div>
          <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6'>
            {latestProducts?.map((product: any) => (
              <ProductCard
                key={product.id}
                product={product}
              />
            ))}
          </div>
        </div>
      )}
      {shops && (
        <div className='max-w-7xl w-[90%] my-16 mx-auto'>
          <div className='mb-12'>
            <SectionTitle title='Top Shops' subtitle='Fresh picks just for you' />
          </div>
          <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6'>
            {shops?.map((shop: any) => (
              <ShopCard
                key={shop.id}
                shop={shop}
              />
            ))}

          </div>
        </div>
      )}
      {!offerLoading && (
        <div className='max-w-7xl w-[90%] my-16 mx-auto'>
          <div className='mb-12'>
            <SectionTitle title='Top Offers' subtitle='Fresh picks just for you' />
          </div>
          <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6'>
            {offers?.map((product: any) => (
              <ProductCard
                key={product.id}
                product={product}
                isEvent={true}
              />
            ))}

          </div>
        </div>
      )}
    </div>
  )
}

export default Page