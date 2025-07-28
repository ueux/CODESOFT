'use client'
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { Search } from "lucide-react";
import ProfileIcon from "apps/user-ui/src/assets/svgs/profileIcon";
import HeartIcon from "apps/user-ui/src/assets/svgs/heartIcon";
import CartIcon from "apps/user-ui/src/assets/svgs/cartIcon";
import HeaderBottom from "./header-bottom";
import useUser from "apps/user-ui/src/hooks/useUser";
import { useStore } from "apps/user-ui/src/store";
import axios from "axios";
import { useRouter } from "next/navigation";
import axiosInstance from "apps/user-ui/src/utils/axiosInstance";
import useRequireAuth from "apps/user-ui/src/hooks/useRequiredAuth";
import useLayout from "apps/user-ui/src/hooks/useLayout";
import Image from "next/image";

const Header = () => {
  const { user, isLoading } = useUser();
  const wishlist = useStore((state: any) => state.wishlist);
  const cart = useStore((state: any) => state.cart);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState("");
  const router = useRouter();
  const {layout}=useLayout()

  // Search products function
  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    setSearchError("");

    try {
      // Adjust this endpoint to match your actual API route
      const response = await axiosInstance.get(`/product/api/search-products?q=${encodeURIComponent(searchQuery)}`);
      setSearchResults(response.data.products || []);
      setShowResults(true);
    } catch (error) {
      console.error("Search error:", error);
      setSearchError("Failed to search products");
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Debounced search as user types
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim()) {
        handleSearch();
      } else {
        setSearchResults([]);
        setShowResults(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleResultClick = (slug: string) => {
    router.push(`/product/${slug}`);
    setShowResults(false);
    setSearchQuery("");
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.search-container')) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="w-full bg-white sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl px-4 py-2.5 mx-auto flex items-center justify-between">
        {/* Logo */}
        <div className="flex-shrink-0">
          <Link href="/">
            {layout?.logo? <Image src={layout.logo} width={300} height={100} alt="" className="h-[70px] ml-[-50px] mb-[-30px] object-cover"/>
            :<span className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-red-600 bg-clip-text text-transparent">
              E-Com
            </span>}
          </Link>
        </div>

        {/* Search Bar */}
        <div className="w-full max-w-xl mx-6 relative search-container">
          <form onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="Search for products..."
              className="w-full px-5 py-3 rounded-full border-2 border-blue-400 focus:border-blue-600 outline-none transition-all duration-300 shadow-sm hover:shadow-md focus:shadow-lg font-medium"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => searchQuery && setShowResults(true)}
            />
          </form>

          {/* Search Results Dropdown */}
          {showResults && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
              {isSearching ? (
                <div className="p-3 text-center text-gray-500">Searching...</div>
              ) : searchError ? (
                <div className="p-3 text-center text-red-500">{searchError}</div>
              ) : searchResults.length > 0 ? (
                searchResults.map((product: any) => (
                  <div
                    key={product.id}
                    className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                    onClick={() => handleResultClick(product.slug)}
                  >
                    <div className="font-medium text-gray-800">{product.title}</div>
                  </div>
                ))
              ) : searchQuery ? (
                <div className="p-3 text-center text-gray-500">No products found</div>
              ) : null}
            </div>
          )}
        </div>

        {/* User Actions */}
        <div className="flex items-center space-x-6">
          {/* Profile */}
          <div className="flex items-center gap-3">
            {!isLoading && user ? (
              <>
                <Link href="/profile" className="group relative">
                  <div className="w-10 h-10 flex items-center justify-center rounded-full bg-gradient-to-r from-blue-50 to-blue-100 border-2 border-blue-100 group-hover:border-blue-300 transition-all duration-300">
                    <ProfileIcon className="text-blue-600" />
                  </div>
                </Link>
                <Link href="/profile">
                  <div className="hidden md:block">
                    <span className="text-sm font-medium text-gray-600 block">Hello,</span>
                    <span className="text-sm font-semibold text-gray-800 truncate max-w-[120px]">
                      {user?.name.split(" ")[0]}
                    </span>
                  </div>
                </Link>
              </>
            ) : (
              <>
                <Link href="/login" className="group relative">
                  <div className="w-10 h-10 flex items-center justify-center rounded-full bg-gradient-to-r from-blue-50 to-blue-100 border-2 border-blue-100 group-hover:border-blue-300 transition-all duration-300">
                    <ProfileIcon className="text-blue-600" />
                  </div>
                </Link>
                <Link href="/login">
                  <div className="hidden md:block">
                    <span className="text-sm font-medium text-gray-600 block">Hello,</span>
                    <span className="text-sm font-semibold text-gray-800">
                      {isLoading ? "..." : "Sign In"}
                    </span>
                  </div>
                </Link>
              </>
            )}
          </div>

          {/* Wishlist and Cart */}
          <div className="flex items-center space-x-5">
            <Link href="/wishlist" className="relative group">
              <div className="p-2 rounded-full group-hover:bg-red-50 transition-all duration-300">
                <HeartIcon className="w-6 h-6 text-gray-700 group-hover:text-red-500" />
              </div>
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center shadow-sm">
                <span className="text-white text-xs font-bold">{wishlist?.length}</span>
              </div>
            </Link>

            <Link href="/cart" className="relative group">
              <div className="p-2 rounded-full group-hover:bg-blue-50 transition-all duration-300">
                <CartIcon className="w-6 h-6 text-gray-700 group-hover:text-blue-600" />
              </div>
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center shadow-sm">
                <span className="text-white text-xs font-bold">{cart?.length}</span>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom Border and Navigation */}
      <div className="border-b border-gray-100 " />
      <HeaderBottom />
    </div>
  );
};

export default Header;