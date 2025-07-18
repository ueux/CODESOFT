"use client";
import CartIcon from "apps/user-ui/src/assets/svgs/cartIcon";
import HeartIcon from "apps/user-ui/src/assets/svgs/heartIcon";
import ProfileIcon from "apps/user-ui/src/assets/svgs/profileIcon";
import { navItems } from "apps/user-ui/src/configs/constants";
import useUser from "apps/user-ui/src/hooks/useUser";
import { useStore } from "apps/user-ui/src/store";
import { AlignLeft, ChevronDown, X } from "lucide-react";
import Link from "next/link";
import React, { useEffect, useState } from "react";



const HeaderBottom = () => {
  const [show, setShow] = useState(false);
  const [isSticky, setIsSticky] = useState(false);
  const { user, isLoading } = useUser();
  const wishlist = useStore((state: any) => state.wishlist)
  const cart = useStore((state: any) => state.cart)

  useEffect(() => {
    const handleScroll = () => {
      setIsSticky(window.scrollY > 100);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className={`w-full ${isSticky ? "fixed top-0 left-0 z-50 bg-white shadow-md" : "relative"} transition-all duration-300`}>
      <div className={`max-w-7xl mx-auto px-6 flex items-center justify-between ${isSticky ? "py-2" : "py-0"}`}>
        {/* All Departments Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShow(!show)}
            className={`flex items-center gap-3 px-5 py-3 rounded-lg ${
              isSticky ? "bg-blue-600" : "bg-blue-600 hover:bg-blue-700"
            } text-white font-medium transition-colors duration-200`}
          >
            <AlignLeft size={20} />
            <span>All Departments</span>
            <ChevronDown size={18} className={`transition-transform ${show ? "rotate-180" : ""}`} />
          </button>


        </div>

        {/* Navigation Links */}
        <div className="hidden lg:flex items-center space-x-1">
          {navItems.map((item, index) => (
            <Link
              key={index}
              href={item.href}
              className="px-4 py-3 font-medium text-gray-700 hover:text-blue-600 transition-colors duration-200 relative group"
            >
              {item.title}
              <span className="absolute bottom-2 left-1/2 transform -translate-x-1/2 h-0.5 bg-blue-600 w-0 group-hover:w-4/5 transition-all duration-300"></span>
            </Link>
          ))}
        </div>

        {/* Sticky Header Actions */}
        {isSticky && (
          <div className="flex items-center space-x-6">
            <div className="flex items-center gap-3">
              {!isLoading && user ? (
                <>
                  <Link href="/profile" className="relative group">
                    <div className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-50 border-2 border-blue-100 group-hover:border-blue-300 transition-all">
                      <ProfileIcon className="text-blue-600" />
                    </div>
                  </Link>
                  <Link href="/profile" className="hidden md:block">
                    <span className="text-sm font-medium text-gray-600 block">Hello,</span>
                    <span className="text-sm font-semibold text-gray-800">
                      {user.name.split(" ")[0]}
                    </span>
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/login" className="relative group">
                    <div className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-50 border-2 border-blue-100 group-hover:border-blue-300 transition-all">
                      <ProfileIcon className="text-blue-600" />
                    </div>
                  </Link>
                  <Link href="/login" className="hidden md:block">
                    <span className="text-sm font-medium text-gray-600 block">Hello,</span>
                    <span className="text-sm font-semibold text-gray-800">
                      {isLoading ? "..." : "Sign In"}
                    </span>
                  </Link>
                </>
              )}
            </div>

            <div className="flex items-center space-x-4">
              <Link href="/wishlist" className="relative group p-2">
                <HeartIcon className="w-6 h-6 text-gray-700 group-hover:text-red-500 transition-colors" />
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center shadow-sm">
                  <span className="text-white text-xs font-bold">{wishlist?.length}</span>
                </div>
              </Link>

              <Link href="/cart" className="relative group p-2">
                <CartIcon className="w-6 h-6 text-gray-700 group-hover:text-blue-600 transition-colors" />
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center shadow-sm">
                  <span className="text-white text-xs font-bold">{cart?.length}</span>
                </div>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HeaderBottom;