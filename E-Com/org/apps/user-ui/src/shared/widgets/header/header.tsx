'use client'
import Link from "next/link";
import React from "react";
import { Search } from "lucide-react";
import ProfileIcon from "apps/user-ui/src/assets/svgs/profileIcon";
import HeartIcon from "apps/user-ui/src/assets/svgs/heartIcon";
import CartIcon from "apps/user-ui/src/assets/svgs/cartIcon";
import HeaderBottom from "./header-bottom";
import useUser from "apps/user-ui/src/hooks/useUser";

const Header = () => {
  const{user,isLoading} =useUser()
  return (
    <div className="w-fill bg-white">
      <div className="w-[80%] py-5 m-auto flex items-center justify-between">
        <div>
          <Link href={"/"}>
            <span className="text-3xl font-[600] text-red-500">E-Com</span>
          </Link>
        </div>
        <div className="w-[50%] relative">
          <input
            type="text"
            placeholder="Search for products..."
            className="w-full px-4 font-Poppins font-medium border-[2.5px] border-[#3489FF] outline-none h-[55px]"
          />
          <div className="w-[60px] cursor-pointer flex items-center justify-center h-[55px] bg-[#3489FF] absolute top-0 right-0">
            <Search color="#fff" />
          </div>
        </div>
        <div className="flex items-center gap-8 pb-2">
          <div className="flex items-center gap-2">
            {!isLoading && user ? (<>
              <Link href={"/profile"} className="border-2 w-[50px] h-[50px] flex items-center justify-center rounded-full border-[#010f1c1a] ">
              <ProfileIcon />
            </Link>
              <Link href={"/login"}>
              <span className=" font-medium block">Hello,</span>
              <span className="font-semibold">{user.name.split(" ")[0]}</span>
            </Link>
            </>) : (<>
              <Link
              href={"/login"}
              className="border-2 w-[50px] h-[50px] flex items-center justify-center rounded-full border-[#010f1c1a] "
            >
              <ProfileIcon />
            </Link>
              <Link href={"/login"}>
              <span className=" font-medium block">Hello,</span>
              <span className="font-semibold">{isLoading? "...":"Sign In"}</span>
            </Link>
            </>
            )}
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
                <span className="text-white text-xs font-semibold">0</span>
              </div>
            </Link>
          </div>
        </div>
      </div>
      <div className="border-b border-b-[#99999938] "/>
        <HeaderBottom />
    </div>
  );
};

export default Header;
