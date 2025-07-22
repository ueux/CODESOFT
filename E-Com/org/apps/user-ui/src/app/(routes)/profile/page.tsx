"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import {
  CheckCircle,
  Clock,
  Loader2,
  Truck,
  User,
  ShoppingBag,
  Inbox,
  Bell,
  MapPin,
  Lock,
  LogOut,
  Gift,
  BadgeCheck,
  Settings,
  Receipt,
  PhoneCall,
} from "lucide-react";

import StatCard from "apps/user-ui/src/shared/components/cards/stat.card";
import useUser from "apps/user-ui/src/hooks/useUser";
import axiosInstance from "apps/user-ui/src/utils/axiosInstance";
import QuickActionCard from "apps/user-ui/src/shared/components/cards/quick-action.card";
import ProfileTabContent from "apps/user-ui/src/shared/components/profile-content/profile-tab";
import ShippingAddressSeciton from "apps/user-ui/src/shared/components/profile-content/shipping-address-tab";

const NavItem = ({
  label,
  Icon,
  active,
  danger = false,
  onClick
}: {
  label: string;
  Icon: React.ComponentType<{ className?: string }>;
  active?: boolean;
  danger?: boolean;
  onClick: () => void;
}) => {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium ${
        active
          ? "bg-blue-100 text-blue-600"
          : danger
          ? "text-red-500 hover:bg-red-50"
          : "text-gray-700 hover:bg-gray-100"
      }`}
    >
      <Icon className="w-4 h-4" />
      {label}
    </button>
  );
};



const Page = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, isLoading } = useUser();

  const queryTab = searchParams.get("active") || "Profile";
  const [activeTab, setActiveTab] = useState(queryTab);

  useEffect(() => {
    if (activeTab !== queryTab) {
      const newParams = new URLSearchParams(searchParams);
      newParams.set("active", activeTab);
      router.replace(`/profile?${newParams.toString()}`);
    }
  }, [activeTab, queryTab, router, searchParams]);

  const logOutHandler = async () => {
    await axiosInstance.get("/api/logout-user");
    queryClient.invalidateQueries({ queryKey: ["user"] });
    router.push("/login");
  };

  return (
    <div className="bg-gray-50 p-6 pb-14 min-h-screen">
      <div className="md:max-w-7xl mx-auto">
        {/* Greeting */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-800">
            Welcome back,{" "}
            <span className="text-blue-600">
              {isLoading ? (
                <Loader2 className="inline animate-spin w-5 h-5" />
              ) : (
                user?.name || "User"
              )}
            </span>
          </h1>
        </div>

        {/* Profile Overview Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-10">
          <StatCard title="Total Orders" count={10} Icon={Clock} />
          <StatCard title="Processing Orders" count={4} Icon={Truck} />
          <StatCard title="Completed Orders" count={5} Icon={CheckCircle} />
        </div>

        {/* Sidebar and Content Layout */}
        <div className="mt-10 flex flex-col md:flex-row gap-6">
          {/* Left Navigation */}
          <div className="bg-white p-4 rounded-md shadow-md border border-gray-100 md:w-64">
            <nav className="space-y-2">
              <NavItem
                label="Profile"
                Icon={User}
                active={activeTab === "Profile"}
                onClick={() => setActiveTab("Profile")}
              />
              <NavItem
                label="My Orders"
                Icon={ShoppingBag}
                active={activeTab === "My Orders"}
                onClick={() => setActiveTab("My Orders")}
              />
              <NavItem
                label="Inbox"
                Icon={Inbox}
                active={activeTab === "Inbox"}
                onClick={() => router.push("/inbox")}
              />
              <NavItem
                label="Notifications"
                Icon={Bell}
                active={activeTab === "Notifications"}
                onClick={() => setActiveTab("Notifications")}
              />
              <NavItem
                label="Shipping Address"
                Icon={MapPin}
                active={activeTab === "Shipping Address"}
                onClick={() => setActiveTab("Shipping Address")}
              />
              <NavItem
                label="Change Password"
                Icon={Lock}
                active={activeTab === "Change Password"}
                onClick={() => setActiveTab("Change Password")}
              />
              <NavItem
                label="Logout"
                Icon={LogOut}
                danger
                onClick={logOutHandler}
              />
            </nav>
          </div>

          <div className="flex-1">

          <div className="flex flex-col md:flex-row gap-6">
            {/* Profile Info */}
            <div className="bg-white p-6 rounded-md shadow-md border border-gray-100 flex-1">
            {activeTab === "Profile" && !isLoading && user ? (<ProfileTabContent user={user} />) :
            activeTab === "Shipping Address" ? (<ShippingAddressSeciton/>):
                                      (<>{activeTab} content</>
                                          
            )}
            </div>

            {/* Right Quick Panel */}
            <div className="w-full md:w-1/4 space-y-4">
              <QuickActionCard
                Icon={Gift}
                title="Referral Program"
                description="Invite friends and earn rewards."
              />
              <QuickActionCard
                Icon={BadgeCheck}
                title="Your Badges"
                description="View your earned achievements."
              />
              <QuickActionCard
                Icon={Settings}
                title="Account Settings"
                description="Manage preferences and security."
              />
              <QuickActionCard
                Icon={Receipt}
                title="Billing History"
                description="Check your recent payments."
              />
              <QuickActionCard
                Icon={PhoneCall}
                title="Support Center"
                description="Need help? Contact support."
              />
            </div>
          </div>

      </div>
        </div>
      </div>
    </div>
  );
};

export default Page;