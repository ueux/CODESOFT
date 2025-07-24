import React from "react";
import { Menu, Moon, Search, Settings, Sun } from "lucide-react";
import Link from "next/link";
import { useAppDispatch, useAppSelector } from "@/app/redux";
import { setIsDarkMode, setIsSidebarCollapsed } from "@/state";
import { useGetAuthUserQuery } from "@/state/api";
import { signOut } from "@aws-amplify/auth";
import Image from "next/image";

const Navbar = () => {
  const dispatch = useAppDispatch();
  const isSidebarCollapsed = useAppSelector(
    (state) => state.global.isSidebarCollapsed,
  );
  const isDarkMode = useAppSelector((state) => state.global.isDarkMode);
  const { data: currentUser } = useGetAuthUserQuery();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Error signing out", error);
    }
  };

  if (!currentUser) return null;
  const currentUserDetails = currentUser?.userDetails;
  return (
    <header className="navbar">
      <div className="navbar-section">
        <button
          onClick={() => dispatch(setIsSidebarCollapsed(!isSidebarCollapsed))}
          className={`menu-button ${!isSidebarCollapsed ? "md:opacity-0 md:invisible" : ""}`}
          aria-label="Toggle sidebar"
        >
          <Menu className="menu-icon" />
        </button>

        <div className="search-container">
          <div className="search-icon">
            <Search />
          </div>
          <input
            type="search"
            placeholder="Search..."
            className="search-input"
          />
        </div>
      </div>

      <div className="navbar-section">
        <button
          onClick={() => dispatch(setIsDarkMode(!isDarkMode))}
          className="action-button"
          aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
        >
          {isDarkMode ? (
            <Sun className="theme-icon light-icon" />
          ) : (
            <Moon className="theme-icon dark-icon" />
          )}
        </button>

        <Link href="/settings" className="action-button" aria-label="Settings">
          <Settings className="menu-icon" />
        </Link>

        <div className="divider hidden md:block"></div>

        {/* User Profile Section */}
        <div className="flex items-center gap-2 ml-2">
          {currentUserDetails?.profilePictureUrl && (
            <div className="h-8 w-8 relative rounded-full overflow-hidden">
              <Image
                src={`https://pm--s3--images0.s3.ap-south-1.amazonaws.com/public/${currentUserDetails.profilePictureUrl}`}
                alt={currentUserDetails.username + " profile"}
                fill
                className="object-cover"
              />
            </div>
          )}
          <span className="text-sm text-gray-800 dark:text-white hidden md:block">
            {currentUser?.user.username}
          </span>
          <button
            className="ml-2 hidden md:block bg-blue-400 hover:bg-blue-500 text-white text-xs font-bold py-1 px-4 rounded"
            onClick={handleSignOut}
          >
            Sign Out
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
