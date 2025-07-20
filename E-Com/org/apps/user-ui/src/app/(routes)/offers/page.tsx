'use client'

import { useQuery } from '@tanstack/react-query'
import ProductCard from 'apps/user-ui/src/shared/components/cards/product-card'
import axiosInstance from 'apps/user-ui/src/utils/axiosInstance'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { Range } from "react-range"
import { FiFilter, FiX, FiChevronLeft, FiChevronRight } from 'react-icons/fi'
import { FaSpinner } from 'react-icons/fa'

const MIN_PRICE = 0
const MAX_PRICE = 1199

const Offers = () => {
    const [isOffersLoading, setIsOffersLoading] = useState(false)
    const [priceRange, setPriceRange] = useState([MIN_PRICE, MAX_PRICE])
    const [selectedCategories, setSelectedCategories] = useState<string[]>([])
    const [selectedSizes, setSelectedSizes] = useState<string[]>([])
    const [selectedColors, setSelectedColors] = useState<string[]>([])
    const [page, setPage] = useState(1)
    const [offers, setOffers] = useState<any[]>([])
    const [totalPages, setTotalPages] = useState(1)
    const [tempPriceRange, setTempPriceRange] = useState([MIN_PRICE, MAX_PRICE])
    const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)

    const colors = [{ name: "Black", code: "#000" }]
    const sizes = ["XS", "S", "M", "L", "XL", "XXL"]

    const router = useRouter()

    const updateURL = () => {
        const params = new URLSearchParams()
        params.set("priceRange", priceRange.join(","))
        if (selectedCategories.length > 0) params.set("categories", selectedCategories.join(","))
        if (selectedColors.length > 0) params.set("colors", selectedColors.join(","))
        if (selectedSizes.length > 0) params.set("sizes", selectedSizes.join(","))
        params.set("page", page.toString())
        router.replace(`/offers?${decodeURIComponent(params.toString())}`)
    }

    const fetchFilteredOffers = async () => {
        setIsOffersLoading(true)
        try {
            const query = new URLSearchParams()
            query.set("priceRange", priceRange.join(","))
            if (selectedCategories.length > 0) query.set("categories", selectedCategories.join(","))
            if (selectedColors.length > 0) query.set("colors", selectedColors.join(","))
            if (selectedSizes.length > 0) query.set("sizes", selectedSizes.join(","))
            query.set("page", page.toString())
            query.set("limit", "12")
            const res = await axiosInstance.get(`/product/api/get-filtered-events?${query.toString()}`)
            setOffers(res.data.offers)
            setTotalPages(res.data.pagination.totalPages)
        } catch (error) {
            console.error("Failed to fetch filtered offers", error)
        } finally {
            setIsOffersLoading(false)
        }
    }

    useEffect(() => {
        updateURL()
        fetchFilteredOffers()
    }, [priceRange, selectedCategories, selectedColors, selectedSizes, page])

    const { data, isLoading } = useQuery({
        queryKey: ["categories"],
        queryFn: async () => {
            const res = await axiosInstance.get("/product/api/get-categories")
            return res.data
        },
        staleTime: 1000 * 60 * 30
    })

    const toggleCategory = (label: string) => {
        setSelectedCategories(prev => prev.includes(label) ? prev.filter(cat => cat !== label) : [...prev, label])
        setPage(1)
    }

    const toggleColor = (color: string) => {
        setSelectedColors(prev => prev.includes(color) ? prev.filter(c => c !== color) : [...prev, color])
        setPage(1)
    }

    const toggleSize = (size: string) => {
        setSelectedSizes(prev => prev.includes(size) ? prev.filter(c => c !== size) : [...prev, size])
        setPage(1)
    }

    const clearAllFilters = () => {
        setPriceRange([MIN_PRICE, MAX_PRICE])
        setTempPriceRange([MIN_PRICE, MAX_PRICE])
        setSelectedCategories([])
        setSelectedColors([])
        setSelectedSizes([])
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
                        <FilterSection title="Price Range">
                            <div className="space-y-4">
                                <Range
                                    step={1}
                                    min={MIN_PRICE}
                                    max={MAX_PRICE}
                                    values={tempPriceRange}
                                    onChange={(values) => setTempPriceRange(values)}
                                    renderTrack={({ props, children }) => {
                                        // Destructure the key from props to avoid spreading it
                                        const { key, ...restProps } = props;
                                        return (
                                            <div
                                                key={key}  // Add key directly
                                                {...restProps}  // Spread remaining props
                                                className="h-2 bg-gray-200 rounded-full relative"
                                            >
                                                {/* Background track */}
                                                <div className="absolute inset-0 rounded-full bg-gray-200" />

                                                {/* Selected range track */}
                                                <div
                                                    className="absolute h-full bg-blue-600 rounded-full"
                                                    style={{
                                                        left: `${((tempPriceRange[0] - MIN_PRICE) / (MAX_PRICE - MIN_PRICE) * 100)}%`,
                                                        width: `${((tempPriceRange[1] - tempPriceRange[0]) / (MAX_PRICE - MIN_PRICE) * 100)}%`,
                                                    }}
                                                />
                                                {children}
                                            </div>
                                        );
                                    }}
                                    renderThumb={({ index, props }) => {
                                        // Destructure the key from props to avoid spreading it
                                        const { key, ...restProps } = props;
                                        return (
                                            <div
                                                key={key}  // Add key directly
                                                {...restProps}  // Spread remaining props
                                                className={`w-5 h-5 bg-white rounded-full shadow-md border-2 ${index === 0 ? 'border-blue-500' : 'border-blue-700'
                                                    } focus:outline-none focus:ring-2 focus:ring-blue-300`}
                                            >
                                                {/* Optional: Add different styling or indicators for each thumb */}
                                                {index === 0 && (
                                                    <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs font-medium text-gray-700">
                                                        Min
                                                    </div>
                                                )}
                                                {index === 1 && (
                                                    <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs font-medium text-gray-700">
                                                        Max
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    }}
                                />
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                        <div className="text-sm bg-gray-100 px-2 py-1 rounded">
                                            ₹{tempPriceRange[0]}
                                        </div>
                                        <div className="text-sm bg-gray-100 px-2 py-1 rounded">
                                            ₹{tempPriceRange[1]}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => {
                                            setPriceRange(tempPriceRange);
                                            setPage(1);
                                        }}
                                        className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition"
                                    >
                                        Apply
                                    </button>
                                </div>
                            </div>
                        </FilterSection>

                        <FilterSection title="Categories">
                            <ul className="space-y-2">
                                {isLoading ? (
                                    <div className="flex justify-center">
                                        <FaSpinner className="animate-spin h-5 w-5 text-blue-600" />
                                    </div>
                                ) : (
                                    data?.categories?.map((category: any) => (
                                        <li key={category}>
                                            <label className="flex items-center space-x-3">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedCategories.includes(category)}
                                                    onChange={() => toggleCategory(category)}
                                                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                />
                                                <span className="text-gray-700">{category}</span>
                                            </label>
                                        </li>
                                    ))
                                )}
                            </ul>
                        </FilterSection>

                        <FilterSection title="Colors">
                            <ul className="space-y-2">
                                {colors.map((color) => (
                                    <li key={color.name}>
                                        <label className="flex items-center space-x-3">
                                            <input
                                                type="checkbox"
                                                checked={selectedColors.includes(color.name)}
                                                onChange={() => toggleColor(color.name)}
                                                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                            />
                                            <div className="flex items-center space-x-2">
                                                <span
                                                    className="w-5 h-5 rounded-full border border-gray-200"
                                                    style={{ backgroundColor: color.code }}
                                                />
                                                <span className="text-gray-700">{color.name}</span>
                                            </div>
                                        </label>
                                    </li>
                                ))}
                            </ul>
                        </FilterSection>

                        <FilterSection title="Sizes">
                            <div className="grid grid-cols-3 gap-2">
                                {sizes.map((size) => (
                                    <label
                                        key={size}
                                        className={`flex items-center justify-center p-2 border rounded-md cursor-pointer transition ${selectedSizes.includes(size)
                                            ? 'bg-blue-600 text-white border-blue-600'
                                            : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
                                            }`}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={selectedSizes.includes(size)}
                                            onChange={() => toggleSize(size)}
                                            className="sr-only"
                                        />
                                        {size}
                                    </label>
                                ))}
                            </div>
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
                                All Offers
                            </li>
                        </ol>
                    </nav>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">All Offers</h1>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Desktop filters */}
                    <aside className="hidden lg:block w-64 shrink-0">
                        <div className="bg-white p-6 rounded-lg shadow-sm sticky top-4">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-lg font-medium text-gray-900">Filters</h2>
                                {(selectedCategories.length > 0 || selectedColors.length > 0 || selectedSizes.length > 0 || priceRange[0] !== MIN_PRICE || priceRange[1] !== MAX_PRICE) && (
                                    <button
                                        onClick={clearAllFilters}
                                        className="text-sm text-blue-600 hover:text-blue-800"
                                    >
                                        Clear all
                                    </button>
                                )}
                            </div>

                            <FilterSection title="Price Range">
                                <div className="space-y-4">
                                    <Range
                                        step={1}
                                        min={MIN_PRICE}
                                        max={MAX_PRICE}
                                        values={tempPriceRange}
                                        onChange={(values) => setTempPriceRange(values)}
                                        renderTrack={({ props: trackProps, children }) => {
                                            const { key, ...restTrackProps } = trackProps;
                                            return (
                                                <div
                                                    key={key}
                                                    {...restTrackProps}
                                                    className="h-2 bg-gray-200 rounded-full relative"
                                                >
                                                    {/* Background track */}
                                                    <div className="absolute inset-0 rounded-full bg-gray-200" />

                                                    {/* Selected range track */}
                                                    <div
                                                        className="absolute h-full bg-blue-600 rounded-full"
                                                        style={{
                                                            left: `${((tempPriceRange[0] - MIN_PRICE) / (MAX_PRICE - MIN_PRICE) * 100)}%`,
                                                            width: `${((tempPriceRange[1] - tempPriceRange[0]) / (MAX_PRICE - MIN_PRICE) * 100)}%`,
                                                        }}
                                                    />
                                                    {children}
                                                </div>
                                            );
                                        }}
                                        renderThumb={({ index, props: thumbProps }) => {
                                            const { key, ...restThumbProps } = thumbProps;
                                            return (
                                                <div
                                                    key={key}
                                                    {...restThumbProps}
                                                    className={`w-5 h-5 bg-white rounded-full shadow-md border-2 ${index === 0 ? 'border-blue-500' : 'border-blue-700'
                                                        } focus:outline-none focus:ring-2 focus:ring-blue-300`}
                                                >
                                                </div>
                                            );
                                        }}
                                    />
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-2">
                                            <div className="text-sm bg-gray-100 px-2 py-1 rounded">
                                                ₹{tempPriceRange[0]}
                                            </div>
                                            <div className="text-sm bg-gray-100 px-2 py-1 rounded">
                                                ₹{tempPriceRange[1]}
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => {
                                                setPriceRange(tempPriceRange);
                                                setPage(1);
                                            }}
                                            className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition"
                                        >
                                            Apply
                                        </button>
                                    </div>
                                </div>
                            </FilterSection>

                            <FilterSection title="Categories">
                                <ul className="space-y-2">
                                    {isLoading ? (
                                        <div className="flex justify-center">
                                            <FaSpinner className="animate-spin h-5 w-5 text-blue-600" />
                                        </div>
                                    ) : (
                                        data?.categories?.map((category: any) => (
                                            <li key={category}>
                                                <label className="flex items-center space-x-3">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedCategories.includes(category)}
                                                        onChange={() => toggleCategory(category)}
                                                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                    />
                                                    <span className="text-gray-700">{category}</span>
                                                </label>
                                            </li>
                                        ))
                                    )}
                                </ul>
                            </FilterSection>

                            <FilterSection title="Colors">
                                <ul className="space-y-2">
                                    {colors.map((color) => (
                                        <li key={color.name}>
                                            <label className="flex items-center space-x-3">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedColors.includes(color.name)}
                                                    onChange={() => toggleColor(color.name)}
                                                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                />
                                                <div className="flex items-center space-x-2">
                                                    <span
                                                        className="w-5 h-5 rounded-full border border-gray-200"
                                                        style={{ backgroundColor: color.code }}
                                                    />
                                                    <span className="text-gray-700">{color.name}</span>
                                                </div>
                                            </label>
                                        </li>
                                    ))}
                                </ul>
                            </FilterSection>

                            <FilterSection title="Sizes">
                                <div className="grid grid-cols-3 gap-2">
                                    {sizes.map((size) => (
                                        <label
                                            key={size}
                                            className={`flex items-center justify-center p-2 border rounded-md cursor-pointer transition ${selectedSizes.includes(size)
                                                ? 'bg-blue-600 text-white border-blue-600'
                                                : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
                                                }`}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={selectedSizes.includes(size)}
                                                onChange={() => toggleSize(size)}
                                                className="sr-only"
                                            />
                                            {size}
                                        </label>
                                    ))}
                                </div>
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

                            {(selectedCategories.length > 0 || selectedColors.length > 0 || selectedSizes.length > 0 || priceRange[0] !== MIN_PRICE || priceRange[1] !== MAX_PRICE) && (
                                <div className="flex items-center space-x-2 overflow-x-auto py-2 px-1">
                                    {priceRange[0] !== MIN_PRICE || priceRange[1] !== MAX_PRICE ? (
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                            ₹{priceRange[0]} - ₹{priceRange[1]}
                                            <button
                                                type="button"
                                                className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full text-blue-400 hover:bg-blue-200 hover:text-blue-500"
                                                onClick={() => {
                                                    setPriceRange([MIN_PRICE, MAX_PRICE])
                                                    setTempPriceRange([MIN_PRICE, MAX_PRICE])
                                                }}
                                            >
                                                <FiX className="w-3 h-3" />
                                            </button>
                                        </span>
                                    ) : null}

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

                                    {selectedColors.map((color) => (
                                        <span key={color} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                            {color}
                                            <button
                                                type="button"
                                                className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full text-gray-400 hover:bg-gray-200 hover:text-gray-500"
                                                onClick={() => toggleColor(color)}
                                            >
                                                <FiX className="w-3 h-3" />
                                            </button>
                                        </span>
                                    ))}

                                    {selectedSizes.map((size) => (
                                        <span key={size} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                            {size}
                                            <button
                                                type="button"
                                                className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full text-gray-400 hover:bg-gray-200 hover:text-gray-500"
                                                onClick={() => toggleSize(size)}
                                            >
                                                <FiX className="w-3 h-3" />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Offers grid */}
                        {isOffersLoading ? (
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
                        ) : offers?.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {offers?.map((offer: any) => (
                                    <ProductCard key={offer.id} product={offer} isEvent={true} />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <h3 className="text-lg font-medium text-gray-900">No offers found</h3>
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

export default Offers