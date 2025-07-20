import ProductDetails from 'apps/user-ui/src/shared/modules/product/product-details'
import axiosInstance from 'apps/user-ui/src/utils/axiosInstance'
import { Metadata } from 'next'
import React from 'react'

async function fetchProductDetails(slug: string) {
  const response = await axiosInstance.get(`/product/api/get-product/${slug}`)
  return response.data.product
}
export async function generateMetadata({ params }: { params: { slug: string } }) :Promise<Metadata>{
  const product = await fetchProductDetails(params.slug)
  return {
    title: `${product?.title} | E-Com`,
    description: product?.short_description,
    openGraph: {
      title: product?.title,
      description: product?.short_description,
      images: [product?.images?.[0]?.url],
      type:"website"
    },
    twitter: {
      card:"summary_large_image",
      title: product?.title,
      description: product?.short_description,
      images: [product?.images?.[0]?.url],
    }
  }
}
const ProductPage = async({ params }: { params: { slug: string } }) => {
  const productDetails = await fetchProductDetails(params.slug)
  return (<ProductDetails productDetails={productDetails}/>
  )
}

export default ProductPage
