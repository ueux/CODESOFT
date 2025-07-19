"use client";

import React, { useEffect } from "react";
import StoreProvider, { useAppSelector } from "./redux";
import Sidebar from "./_components/Sidebar";
import Navbar from "./_components/Navbar";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const isSidebarCollapsed = useAppSelector(
    (state) => state.global.isSidebarCollapsed,
  );
  const isDarkMode = useAppSelector((state) => state.global.isDarkMode);

  useEffect(() => {
    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      const darkModeOn = e.matches;
      document.documentElement.classList.toggle('dark', darkModeOn);
    };

    const savedMode = localStorage.getItem('darkMode');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialMode = savedMode ? savedMode === 'true' : systemPrefersDark;

    document.documentElement.classList.toggle('dark', initialMode);

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', handleSystemThemeChange);

    return () => mediaQuery.removeEventListener('change', handleSystemThemeChange);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
    localStorage.setItem('darkMode', String(isDarkMode));
  }, [isDarkMode]);

  return (
    <div className="dashboard-layout">
      <div className={`sidebar-container ${isSidebarCollapsed ? 'collapsed' : ''}`}>
        <Sidebar />
      </div>

      <main className={`main-content ${isSidebarCollapsed ? 'collapsed' : 'expanded'}`}>
        <div className="navbar">
          <Navbar />
        </div>

        <div className="content-container">
          {children}
        </div>
      </main>
    </div>
  );
};

const DashboardWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <StoreProvider>
      <DashboardLayout>{children}</DashboardLayout>
    </StoreProvider>
  );
};

export default DashboardWrapper;