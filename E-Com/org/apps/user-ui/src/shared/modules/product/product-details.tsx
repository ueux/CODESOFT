'use client'

import React, { useEffect, useState } from "react";
import {
  Heart,
  ChevronLeft,
  ChevronRight,
  MapPin,
  ShoppingCart,
  MessageSquareText,
  Package,
  WalletMinimal,
} from "lucide-react";
import Link from "next/link";
import { useStore } from "apps/user-ui/src/store";
import useUser from "apps/user-ui/src/hooks/useUser";
import useLocationTracking from "apps/user-ui/src/hooks/useLocationTracking";
import useDeviceTracking from "apps/user-ui/src/hooks/useDeviceTracking";
import Ratings from "../../components/ratings";
import Zoom from 'react-medium-image-zoom'
import 'react-medium-image-zoom/dist/styles.css'
import ProductCard from "../../components/cards/product-card";
import axiosInstance from "apps/user-ui/src/utils/axiosInstance";

const ProductDetails = ({ productDetails }: { productDetails: any }) => {
  // State management
  const [currentImage, setCurrentImage] = useState(
    productDetails?.images[0]?.url
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState(productDetails?.colors?.[0] || "");
  const [selectedSize, setSelectedSize] = useState(productDetails?.sizes?.[0] || "");
  const [quantity, setQuantity] = useState(1);
  const [priceRange, setPriceRange] = useState([productDetails?.sale_price, 1199])

  const [recomendedProducts, setRecommendedProducts] = useState([])

  // Store hooks
  const { user, isLoading: userLoading } = useUser();
  const location = useLocationTracking();
  const deviceInfo = useDeviceTracking();

  // Cart and wishlist functionality
  const wishlist = useStore((state: any) => state.wishlist);
  const isWishlisted = wishlist.some((item: any) => item.id === productDetails?.id);
  const addToWishlist = useStore((state: any) => state.addToWishlist);
  const removeFromWishlist = useStore((state: any) => state.removeFromWishlist);

  const cart = useStore((state: any) => state.cart);
  const isInCart = cart.some((item: any) => item.id === productDetails?.id);
  const addToCart = useStore((state: any) => state.addToCart);

  // Image navigation
  const prevImage = () => {
    if (currentIndex > 0) {
      const newIndex = currentIndex - 1;
      setCurrentIndex(newIndex);
      setCurrentImage(productDetails?.images[newIndex]?.url);
    }
  };

  const nextImage = () => {
    if (currentIndex < productDetails?.images.length - 1) {
      const newIndex = currentIndex + 1;
      setCurrentIndex(newIndex);
      setCurrentImage(productDetails?.images[newIndex]?.url);
    }
  };

  // Quantity handlers
  const increaseQuantity = () => {
    if (quantity < 10) setQuantity(quantity + 1);
  };

  const decreaseQuantity = () => {
    if (quantity > 1) setQuantity(quantity - 1);
  };

  // Calculate discount percentage
  const discountPercentage = productDetails?.regular_price
    ? Math.round(
        ((productDetails.regular_price - (productDetails.sale_price || productDetails.regular_price)) /
          productDetails.regular_price) *
          100
      )
    : 0;

  const fetchFilteredProducts = async () => {
    try {
      const query = new URLSearchParams()
      query.set("priceRange", priceRange.join(","));
      query.set("page", "1");
      query.set("limit", "5")
      const res = await axiosInstance.get(`/product/api/get-filtered-products?${query.toString()}`)
      setRecommendedProducts(res.data.products)

    } catch (error) {
console.error("Failed to fetch filtered products",error)
    }
  }

  useEffect(() => {
    fetchFilteredProducts()

  },[priceRange])
  return (
    <div className="w-full bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr_1fr] gap-8 p-6">
          {/* Left Column - Product Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative w-full aspect-square items-center flex bg-gray-100 rounded-lg overflow-hidden">
              <Zoom>
              <img
                src={currentImage}
                alt={productDetails?.title || "Product image"}
                className="w-full h-full object-contain"
              />
              </Zoom>
            </div>

            {/* Thumbnail Gallery */}
            <div className="relative">
              {productDetails?.images?.length > 4 && (
                <button
                  onClick={prevImage}
                  disabled={currentIndex === 0}
                  className="absolute left-0 top-1/2 -translate-y-1/2 bg-white p-2 rounded-full shadow-md z-10 hover:bg-gray-50 transition-colors"
                >
                  <ChevronLeft size={20} className="text-gray-600" />
                </button>
              )}

              <div className="flex overflow-x-auto gap-2 py-2 px-1 scrollbar-hide">
                {productDetails?.images?.map((img: any, index: number) => (
                  <img
                    key={index}
                    src={img?.url}
                    alt={`Thumbnail ${index + 1}`}
                    className={`w-16 h-16 object-cover rounded-md cursor-pointer border-2 transition-all ${
                      currentIndex === index ? "border-blue-500" : "border-transparent hover:border-gray-300"
                    }`}
                    onClick={() => {
                      setCurrentIndex(index);
                      setCurrentImage(img.url);
                    }}
                  />
                ))}
              </div>

              {productDetails?.images?.length > 4 && (
                <button
                  onClick={nextImage}
                  disabled={currentIndex === productDetails?.images.length - 1}
                  className="absolute right-0 top-1/2 -translate-y-1/2 bg-white p-2 rounded-full shadow-md z-10 hover:bg-gray-50 transition-colors"
                >
                  <ChevronRight size={20} className="text-gray-600" />
                </button>
              )}
            </div>
          </div>

          {/* Middle Column - Product Details */}
          <div className="space-y-6">
            {/* Title and Rating */}
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{productDetails?.title || "Product Title"}</h1>
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-2">
                  <Ratings rating={productDetails?.rating || 0} />
                  <Link href="#reviews" className="text-blue-500 text-sm hover:underline">
                    ({productDetails?.reviewCount || 0} Reviews)
                  </Link>
                </div>
                <button
                  onClick={() => {
                    if (isWishlisted) {
                      removeFromWishlist(productDetails?.id, user, location, deviceInfo);
                    } else {
                      addToWishlist(
                        {
                          ...productDetails,
                          quantity,
                          selectedOptions: {
                            color: selectedColor,
                            size: selectedSize,
                          },
                        },
                        user,
                        location,
                        deviceInfo
                      );
                    }
                  }}
                  className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                  disabled={userLoading}
                >
                  <Heart
                    size={24}
                    fill={isWishlisted ? "red" : "transparent"}
                    color={isWishlisted ? "red" : "#6b7280"}
                  />
                </button>
              </div>
            </div>
            <div className="py-2 border-b border-gray-500">
              <span className="text-gray-500">

                Brand:{" "}<span className="text-blue-500">{productDetails?.brand || "No Brand"}</span>
              </span>
            </div>
            {/* Price Section */}
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className="text-3xl font-bold text-orange-500">
                  ₹{productDetails?.sale_price || productDetails?.regular_price || "0.00"}
                </span>
                {productDetails?.regular_price && productDetails?.sale_price && (
                  <span className="text-gray-400 line-through">
                    ₹{productDetails.regular_price}
                  </span>
                )}
                {discountPercentage > 0 && (
                  <span className="text-sm bg-orange-100 text-orange-600 px-2 py-1 rounded">
                    {discountPercentage}% OFF
                  </span>
                )}
              </div>

            {/* Color Options */}
            {productDetails?.colors?.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Color:</h3>
                <div className="flex gap-3">
                  {productDetails.colors.map((color: string, index: number) => (
                    <button
                      key={index}
                      className={`w-10 h-10 rounded-full border-2 transition-all ${
                        selectedColor === color ? "border-gray-600 scale-110" : "border-transparent hover:border-gray-300"
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() => setSelectedColor(color)}
                      aria-label={`Select color ${color}`}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Size Options */}
            {productDetails?.sizes?.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Size:</h3>
                <div className="flex flex-wrap gap-2">
                  {productDetails.sizes.map((size: string, index: number) => (
                    <button
                      key={index}
                      className={`px-4 py-2 text-sm rounded-md transition-colors ${
                        selectedSize === size
                          ? "bg-gray-800 text-white"
                          : "bg-gray-100 hover:bg-gray-200"
                      }`}
                      onClick={() => setSelectedSize(size)}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Selector */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Quantity:</h3>
              <div className="flex items-center border border-gray-300 rounded-md w-fit">
                <button
                  className="px-3 py-2 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 transition-colors"
                  onClick={decreaseQuantity}
                  disabled={quantity <= 1}
                >
                  -
                </button>
                <span className="px-4 py-2 w-12 text-center">{quantity}</span>
                <button
                  className="px-3 py-2 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 transition-colors"
                  onClick={increaseQuantity}
                  disabled={quantity >= 10}
                >
                  +
                </button>
              </div>
            </div>

              {/* Stock Status */}
              <div>
                {productDetails?.stock > 0 ? (
                  <span className="text-green-600 font-medium">
                    In Stock <span className="text-gray-500">({productDetails.stock} available)</span>
                  </span>
                ) : (
                  <span className="text-red-600 font-medium">Out of Stock</span>
                )}
              </div>
            </div>

            {/* Add to Cart Button */}
            <button
              className={`w-full py-3 px-4 rounded-md font-medium flex items-center justify-center gap-2 transition-colors ${
                isInCart || productDetails?.stock === 0
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-[#ff5722] hover:bg-[#e64a19] text-white"
              }`}
              disabled={isInCart || productDetails?.stock === 0}
              onClick={() => {
                if (!isInCart && productDetails?.stock > 0) {
                  addToCart(
                    {
                      ...productDetails,
                      quantity,
                      selectedOptions: {
                        color: selectedColor,
                        size: selectedSize,
                      },
                    },
                    user,
                    location,
                    deviceInfo
                  );
                }
              }}
            >
              <ShoppingCart size={18} />
              {isInCart ? "Added to Cart" : "Add to Cart"}
            </button>
          </div>

          {/* Right Column - Seller Info */}
          <div className="space-y-6">

            {/* Delivery Info */}
            <div className="py-3 border-y border-gray-200">
              <span className="text-sm text-gray-500">Delivery Option</span>
              <div className="flex items-center gap-2 mt-1">
                <MapPin size={18} className="text-gray-500" />
                <span className="text-gray-700">
                  {location?.city || "Unknown"}, {location?.country || "Unknown"}
                </span>
              </div>
            </div>

            {/* Return & Warranty */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Return & Warranty</h3>

              <div className="flex items-center gap-3 mb-2">
                <Package size={18} className="text-gray-500" />
                <span className="text-gray-700">7 Days Returns</span>
              </div>

              <div className="flex items-center gap-3">
                <WalletMinimal size={18} className="text-gray-500" />
                <span className="text-gray-700">Warranty not available</span>
              </div>
            </div>

            {/* Seller Card */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start">
                <span className="text-sm text-gray-500">Sold by</span>
                <span className="font-medium">{productDetails?.shop?.name || "E-Shop"}</span>
              </div>

              <Link
                href="#"
                className="inline-flex items-center gap-1 text-blue-500 text-sm mt-3 hover:underline"
              >
                <MessageSquareText size={16} /> Chat with Seller
              </Link>

              <div className="grid grid-cols-3 gap-4 mt-4">
                <div>
                  <p className="text-xs text-gray-500">Positive Seller Rating</p>
                  <p className="text-lg font-semibold">100%</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Ship on Time</p>
                  <p className="text-lg font-semibold">100%</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Chat Response</p>
                  <p className="text-lg font-semibold">100%</p>
                </div>
              </div>

              <Link
                href={`/shop/${productDetails?.shop?.id}`}
                className="block text-center text-blue-500 text-sm mt-4 hover:underline"
              >
                Visit Store
              </Link>
            </div>
          </div>
        </div>
      </div>
        <div className="w-[90%- lg:w-[80%] mx-auto mt-5">
        <div className="bg-white min-h-[60vh] h-full p-5">
          <h3 className="text-lg font-semibold">
            Product details of {productDetails?.title}
          </h3>
          <div className="prose prose-sm text-slate-200 max-w-none" dangerouslySetInnerHTML={{__html:productDetails?.detailed_description}}/>
          </div>
      </div>
      <div className="w-[90%] lg:w-[80%] mx-auto">
        <div className="bg-white min-h-[50vh] h-full mt-5 p-5">
          <h3 className="text-lg font-semibold">
            Ratings & Rewiews of {productDetails?.title}
          </h3>
          <p className="text-center pt-14">
            No Reviews available yet!
          </p>
        </div>
      </div>
      <div className="w-[90%] lg:w-[80%] mx-auto">
        <div className="w-full h-full my-5 p-5">
          <h3 className="text-xl font-semibold mb-2">You may also like</h3>
          <div className="m-auto grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5" >
            {recomendedProducts?.map((i: any) =>(<ProductCard key={i?.id} product={i}/>))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;