'use client'

import { useQuery } from '@tanstack/react-query'
import ProductCard from 'apps/user-ui/src/shared/components/cards/product-card'
import axiosInstance from 'apps/user-ui/src/utils/axiosInstance'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { FiFilter, FiX, FiChevronLeft, FiChevronRight } from 'react-icons/fi'
import { FaSpinner } from 'react-icons/fa'
import { categories } from 'apps/user-ui/src/configs/categories'
import ShopCard from 'apps/user-ui/src/shared/components/cards/shop.card'
import { countries } from 'apps/user-ui/src/configs/countries'


const Shops = () => {
  const [isShopLoading, setIsShopLoading] = useState(false)
  const [selectedCategories, setSelectedCategories] = useState<any[]>([])
  const [selectedCountries, setSelectedCountries] = useState<string[]>([])
  const [page, setPage] = useState(1)
  const [shops, setShops] = useState<any[]>([])
  const [totalPages, setTotalPages] = useState(1)
  const [tempPriceRange, setTempPriceRange] = useState([0, 1199])
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)

  const router = useRouter()

  const updateURL = () => {
    const params = new URLSearchParams()
    if (selectedCategories.length > 0) params.set("categories", selectedCategories.join(","))
    if (selectedCountries.length > 0) params.set("colors", selectedCountries.join(","))
    params.set("page", page.toString())
    router.replace(`/shops?${decodeURIComponent(params.toString())}`)
  }

  const fetchFilteredShops = async () => {
    setIsShopLoading(true)
    try {
      const query = new URLSearchParams()
      if (selectedCategories.length > 0) query.set("categories", selectedCategories.join(","))
      if (selectedCountries.length > 0) query.set("colors", selectedCountries.join(","))
      query.set("page", page.toString())
      query.set("limit", "12")
      const res = await axiosInstance.get(`/product/api/get-filtered-shops?${query.toString()}`)
      setShops(res.data.shops)
      setTotalPages(res.data.pagination.totalPages)
    } catch (error) {
      console.error("Failed to fetch filtered products", error)
    } finally {
      setIsShopLoading(false)
    }
  }

  useEffect(() => {
    updateURL()
    fetchFilteredShops()
  }, [selectedCategories, page])

  console.log(shops)

  const toggleCategory = (label: string) => {
    setSelectedCategories(prev => prev.includes(label) ? prev.filter(cat => cat !== label) : [...prev, label])
    setPage(1)
  }

  const toggleCountry = (country: string) => {
    setSelectedCountries(prev => prev.includes(country) ? prev.filter(c => c !== country) : [...prev, country])
    setPage(1)
  }

  const clearAllFilters = () => {
    setTempPriceRange([0, 1199])
    setSelectedCategories([])
    setSelectedCountries([])
    setPage(1)
  }

  const FilterSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="py-4 border-b border-gray-100 last:border-0">
      <h3 className="text-lg font-medium text-gray-900 mb-3">{title}</h3>
      {children}
    </div>
  )

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Mobile filter dialog */}
      <div className={`fixed inset-0 z-40 lg:hidden ${mobileFiltersOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-black bg-opacity-25" onClick={() => setMobileFiltersOpen(false)} />
        <div className="fixed inset-y-0 left-0 w-full max-w-xs bg-white shadow-xl overflow-y-auto">
          <div className="p-4 flex items-center justify-between border-b">
            <h2 className="text-lg font-medium text-gray-900">Filters</h2>
            <button
              type="button"
              className="-mr-2 w-10 h-10 flex items-center justify-center"
              onClick={() => setMobileFiltersOpen(false)}
            >
              <FiX className="h-6 w-6 text-gray-500" />
            </button>
          </div>
          <div className="p-4">

            <FilterSection title="Categories">
              <ul className="space-y-2">
                {
                  categories?.map((category: any) => (
                    <li key={category.value}>
                      <label className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={selectedCategories.includes(category.value)}
                          onChange={() => toggleCategory(category.value)}
                          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-gray-700">{category.label}</span>
                      </label>
                    </li>
                  ))
                }
              </ul>
            </FilterSection>
            <FilterSection title="Countries">
              <ul className="space-y-2">
                {
                  countries?.map((country: any) => (
                    <li key={country}>
                      <label className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={selectedCategories.includes(country)}
                          onChange={() => toggleCountry(country)}
                          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-gray-700">{country}</span>
                      </label>
                    </li>
                  ))
                }
              </ul>
            </FilterSection>

          </div>
          <div className="p-4 border-t">
            <button
              onClick={clearAllFilters}
              className="w-full py-2 px-4 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 transition"
            >
              Clear all filters
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumbs and title */}
        <div className="mb-8">
          <nav className="flex mb-4" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-2 text-sm">
              <li>
                <Link href="/" className="text-gray-500 hover:text-gray-700">
                  Home
                </Link>
              </li>
              <li>
                <span className="text-gray-400">/</span>
              </li>
              <li className="text-gray-700" aria-current="page">
                All Shops
              </li>
            </ol>
          </nav>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">All Shops</h1>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Desktop filters */}
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="bg-white p-6 rounded-lg shadow-sm sticky top-4">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-medium text-gray-900">Filters</h2>
                {(selectedCategories.length > 0) && (
                  <button
                    onClick={clearAllFilters}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    Clear all
                  </button>
                )}
              </div>

              <FilterSection title="Categories">
                <ul className="space-y-2">
                  {categories?.map((category: any) => (
                    <li key={category.value}>
                      <label className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={selectedCategories.includes(category.value)}
                          onChange={() => toggleCategory(category.value)}
                          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-gray-700">{category.label}</span>
                      </label>
                    </li>
                  ))
                  }
                </ul>
              </FilterSection>
              <FilterSection title="Countries">
              <ul className="space-y-2">
                {
                  countries?.map((country: any) => (
                    <li key={country}>
                      <label className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={selectedCategories.includes(country)}
                          onChange={() => toggleCountry(country)}
                          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-gray-700">{country}</span>
                      </label>
                    </li>
                  ))
                }
              </ul>
            </FilterSection>
            </div>
          </aside>

          {/* Main content */}
          <div className="flex-1">
            {/* Mobile filter bar */}
            <div className="lg:hidden mb-4 flex items-center justify-between">
              <button
                type="button"
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
                onClick={() => setMobileFiltersOpen(true)}
              >
                <FiFilter className="h-5 w-5" />
                Filters
              </button>

              {(selectedCategories.length > 0) && (
                <div className="flex items-center space-x-2 overflow-x-auto py-2 px-1">

                  {selectedCategories.map((category) => (
                    <span key={category} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {category}
                      <button
                        type="button"
                        className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full text-gray-400 hover:bg-gray-200 hover:text-gray-500"
                        onClick={() => toggleCategory(category)}
                      >
                        <FiX className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                  {selectedCountries.map((country) => (
                    <span key={country} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {country}
                      <button
                        type="button"
                        className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full text-gray-400 hover:bg-gray-200 hover:text-gray-500"
                        onClick={() => toggleCountry(country)}
                      >
                        <FiX className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Shop grid */}
            {isShopLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {Array.from({ length: 8 }).map((_, index) => (
                  <div key={index} className="bg-white rounded-lg overflow-hidden shadow-sm animate-pulse">
                    <div className="bg-gray-200 h-64 w-full"></div>
                    <div className="p-4 space-y-3">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : shops.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {shops?.map((shop: any) => (
                  <ShopCard key={shop.id} shop={shop} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <h3 className="text-lg font-medium text-gray-900">No Shops found</h3>
                <p className="mt-2 text-gray-500">Try adjusting your search or filter to find what you're looking for.</p>
                <button
                  onClick={clearAllFilters}
                  className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Clear all filters
                </button>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-10 flex items-center justify-between border-t border-gray-200 pt-6">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-md ${page === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100'}`}
                >
                  <FiChevronLeft className="h-5 w-5" />
                  Previous
                </button>
                <div className="hidden md:flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }).map((_, index) => {
                    // Show pages around current page
                    let pageNum
                    if (totalPages <= 5) {
                      pageNum = index + 1
                    } else if (page <= 3) {
                      pageNum = index + 1
                    } else if (page >= totalPages - 2) {
                      pageNum = totalPages - 4 + index
                    } else {
                      pageNum = page - 2 + index
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        className={`w-10 h-10 flex items-center justify-center rounded-md ${page === pageNum
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                          }`}
                      >
                        {pageNum}
                      </button>
                    )
                  })}
                  {totalPages > 5 && page < totalPages - 2 && (
                    <>
                      <span className="px-2">...</span>
                      <button
                        onClick={() => setPage(totalPages)}
                        className="w-10 h-10 flex items-center justify-center rounded-md text-gray-700 hover:bg-gray-100"
                      >
                        {totalPages}
                      </button>
                    </>
                  )}
                </div>
                <div className="md:hidden text-sm text-gray-700">
                  Page {page} of {totalPages}
                </div>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-md ${page === totalPages ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100'}`}
                >
                  Next
                  <FiChevronRight className="h-5 w-5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Shops