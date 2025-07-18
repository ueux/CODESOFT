'use client'
import Link from "next/link";
import React from "react";
import { Search } from "lucide-react";
import ProfileIcon from "apps/user-ui/src/assets/svgs/profileIcon";
import HeartIcon from "apps/user-ui/src/assets/svgs/heartIcon";
import CartIcon from "apps/user-ui/src/assets/svgs/cartIcon";
import HeaderBottom from "./header-bottom";
import useUser from "apps/user-ui/src/hooks/useUser";
import { useStore } from "apps/user-ui/src/store";

const Header = () => {
  const { user, isLoading } = useUser();
    const wishlist = useStore((state: any) => state.wishlist)
    const cart = useStore((state: any) => state.cart)

  return (
    <div className="w-full bg-white sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl px-4 py-4 mx-auto flex items-center justify-between">
        {/* Logo */}
        <div className="flex-shrink-0">
          <Link href="/">
            <span className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-red-600 bg-clip-text text-transparent">
              E-Com
            </span>
          </Link>
        </div>

        {/* Search Bar */}
        <div className="w-full max-w-xl mx-6 relative">
          <input
            type="text"
            placeholder="Search for products..."
            className="w-full px-5 py-3 rounded-full border-2 border-blue-400 focus:border-blue-600 outline-none transition-all duration-300 shadow-sm hover:shadow-md focus:shadow-lg font-medium"
          />
          <button className="absolute right-2 top-1/2 transform -translate-y-1/2 w-12 h-12 flex items-center justify-center bg-gradient-to-r from-blue-500 to-blue-600 rounded-full hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-md">
            <Search color="#fff" size={20} />
          </button>
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
                      {user.name.split(" ")[0]}
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
      <div className="border-b border-gray-100" />
      <HeaderBottom />
    </div>
  );
};

export default Header;