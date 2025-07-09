"use client";
import CartIcon from "apps/user-ui/src/assets/svgs/cartIcon";
import HeartIcon from "apps/user-ui/src/assets/svgs/heartIcon";
import ProfileIcon from "apps/user-ui/src/assets/svgs/profileIcon";
import { navItems } from "apps/user-ui/src/configs/constants";
import { AlignLeft, ChevronDown } from "lucide-react";
import Link from "next/link";
import React, { useEffect, useState } from "react";
const HomeIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    viewBox="0 0 24 24"
    {...props}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3 9.75L12 3l9 6.75V21a1 1 0 01-1 1h-5a1 1 0 01-1-1v-6H9v6a1 1 0 01-1 1H4a1 1 0 01-1-1V9.75z"
    />
  </svg>
);

const InfoIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    viewBox="0 0 24 24"
    {...props}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 18v-6m0-6h.01M21 12c0 4.97-4.03 9-9 9S3 16.97 3 12 7.03 3 12 3s9 4.03 9 9z"
    />
  </svg>
);

const ServiceIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    viewBox="0 0 24 24"
    {...props}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M4 6h16M4 12h8m-8 6h16"
    />
  </svg>
);

const BlogIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    viewBox="0 0 24 24"
    {...props}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M8 16h8M8 12h4m-1-8.5a9 9 0 100 18 9 9 0 000-18z"
    />
  </svg>
);

const ContactIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    viewBox="0 0 24 24"
    {...props}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M21 12.79V21a1 1 0 01-1 1h-7v-5H11v5H4a1 1 0 01-1-1v-8.21a2 2 0 01.553-1.387l8-8.4a2 2 0 012.894 0l8 8.4A2 2 0 0121 12.79z"
    />
  </svg>
);

const HeaderBottom = () => {
  const [show, setShow] = useState(false);
  const [isSticky, setIsSticky] = useState(false);
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 100) {
        setIsSticky(true);
      } else {
        setIsSticky(false);
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);
  return (
    <div
      className={`w-full  ${
        isSticky ? "fixed top-0 left-0 z-[100] bg-white shadow-lg" : "relative"
      } transition-all duration-300`}
    >
      <div
        className={`w-[80%] m-auto flex items-center justify-between relative  ${
          isSticky ? "pt-3" : "py-0"
        }`}
      >
        {/*All Dropdown*/}
        <div
          className={`w-[260px] ${
            isSticky && "-mb-2"
          } flex items-center justify-between cursor-pointer px-5 h-[50px] bg-[#3489ff] `}
          onClick={() => setShow(!show)}
        >
          <div className="flex items-center gap-2 ">
            <AlignLeft color="white" />
            <span className="text-white font-medium">All Departments</span>
          </div>
          <ChevronDown color="white" />
        </div>
        {/*Dropdown Menu*/}
        {show && (
          <div className={`absolute left-0 ${isSticky? "top-[70px]":"top-[50px]"}  w-[260px] h[400px] bg-[#f5f5f5] `}>
            <ul className="p-2">
              <li className="flex items-center gap-2 p-2 hover:bg-gray-100 cursor-pointer">
                <HomeIcon className="w-5 h-5" />
                Home
              </li>
              <li className="flex items-center gap-2 p-2 hover:bg-gray-100 cursor-pointer">
                <InfoIcon className="w-5 h-5" />
                About Us
              </li>
              <li className="flex items-center gap-2 p-2 hover:bg-gray-100 cursor-pointer">
                <ServiceIcon className="w-5 h-5" />
                Services
              </li>
              <li className="flex items-center gap-2 p-2 hover:bg-gray-100 cursor-pointer">
                <BlogIcon className="w-5 h-5" />
                Blog
              </li>
              <li className="flex items-center gap-2 p-2 hover:bg-gray-100 cursor-pointer">
                <ContactIcon className="w-5 h-5" />
                Contact Us
              </li>
            </ul>
          </div>
        )}
        {/*Navigation Links*/}
        <div className="flex items-center gap-5">
          {navItems.map((item:NavItemsTypes, index:number) => (
            <Link className="px-5 font-medium text-lg" href={item.href} key={index}>
                {item.title}
            </Link>
          ))}
        </div>
        <div>
          {isSticky && (
            <div className="flex items-center gap-8 pb-2">
            <div className="flex items-center gap-2">
            <Link
              href={"/login"}
              className="border-2 w-[50px] h-[50px] flex items-center justify-center rounded-full border-[#010f1c1a] "
            >
              <ProfileIcon />
            </Link>
            <Link href={"/login"}>
              <span className=" font-medium block">Hello,</span>
              <span className="font-semibold">Sign In</span>
            </Link>
          </div>
          <div className="flex items-center gap-5">
            <Link href={"/wishlist"} className="relative">
              <HeartIcon className="w-7 h-7 text-gray-700 " />
              <div className="w-5 h-5 bg-red-500 rounded-full absolute top-[-10px] right-[-10px]  flex items-center justify-center">
                <span className="text-white text-xs font-semibold">0</span>
              </div>
            </Link>
            <Link href={"/cart"} className="relative">
              <CartIcon className="w-7 h-7 text-gray-700  " />
              <div className="w-5 h-5 bg-red-500 rounded-full absolute top-[-10px] right-[-10px]  flex items-center justify-center">
                <span className="text-white text-xs font-semibold">9+</span>
              </div>
            </Link>
              </div>
              </div>)
          }
        </div>
      </div>
    </div>
  );
};

export default HeaderBottom;
