import React from "react";
import { Menu, Moon, Search, Settings, Sun, User } from "lucide-react";
import Link from "next/link";
import { useAppDispatch, useAppSelector } from "@/app/redux";
import { setIsDarkMode, setIsSidebarCollapsed } from "@/state";
import Image from "next/image";

const Navbar = () => {
  const dispatch = useAppDispatch();
  const isSidebarCollapsed = useAppSelector(
    (state) => state.global.isSidebarCollapsed,
  );
  const isDarkMode = useAppSelector((state) => state.global.isDarkMode);

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

        <Link
          href="/settings"
          className="action-button"
          aria-label="Settings"
        >
          <Settings className="menu-icon" />
        </Link>

        <div className="divider hidden md:block"></div>

        {/* User Profile - Uncomment when ready */}
        {/* <div className="user-profile">
          <div className="user-avatar">
            <Image
              src={currentUserDetails?.avatar || "/default-avatar.png"}
              alt="User profile"
              fill
              className="object-cover"
            />
          </div>
          <span className="user-name hidden md:block">
            {currentUserDetails?.name}
          </span>
        </div> */}
      </div>
    </header>
  );
};

export default Navbar;