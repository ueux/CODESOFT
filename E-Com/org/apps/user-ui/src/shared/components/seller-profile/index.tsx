"use client";
import { Calendar, Clock, Globe, Heart, MapPin, Star, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import useUser from "apps/user-ui/src/hooks/useUser";
import useLocationTracking from "apps/user-ui/src/hooks/useLocationTracking";
import useDeviceTracking from "apps/user-ui/src/hooks/useDeviceTracking";
import axiosInstance from "apps/user-ui/src/utils/axiosInstance";
import { sendKafkaEvent } from "apps/user-ui/src/actions/track-user";
import ProductCard from "../cards/product-card";

const TABS = ["Products", "Offers", "Reviews"];

interface Shop {
  id: string;
  name: string;
  bio?: string;
  avatar?: string;
  coverBanner?: string;
  ratings?: number;
  address?: string;
  opening_hours?: string;
  createdAt?: string;
  website?: string;
  socialLinks?: Array<{
    type: string;
    url: string;
  }>;
}

interface SellerProfileProps {
  shop: Shop | null;
  followersCount: number;
}

export const SellerProfile = ({ shop, followersCount }: SellerProfileProps) => {
  const [activeTab, setActiveTab] = useState(TABS[0]);
  const [followers, setFollowers] = useState(followersCount);
  const [isFollowing, setIsFollowing] = useState(false);

  const { user } = useUser();
  const location = useLocationTracking();
  const deviceInfo = useDeviceTracking();
  const queryClient = useQueryClient();

  // Fetch seller products
  const { data: products, isLoading } = useQuery({
    queryKey: ["seller-products", shop?.id],
    queryFn: async () => {
      if (!shop?.id) return [];
      const res = await axiosInstance.get(
        `/seller/api/get-seller-products/${shop.id}?page=1&limit=10`
      );
      return res.data.products || [];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: !!shop?.id,
  });

  // Fetch seller events
  const { data: events, isLoading: isEventsLoading } = useQuery({
    queryKey: ["seller-events", shop?.id],
    queryFn: async () => {
      if (!shop?.id) return [];
      const res = await axiosInstance.get(
        `/seller/api/get-seller-events/${shop.id}?page=1&limit=10`
      );
      return res.data.events || [];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: !!shop?.id,
  });

  // Check follow status on mount
  useEffect(() => {
    const fetchFollowStatus = async () => {
      if (!shop?.id) return;
      try {
        const res = await axiosInstance.get(`/seller/api/is-following/${shop.id}`);
        setIsFollowing(res.data.isFollowing === true);
      } catch (error) {
        console.error("Failed to fetch follow status", error);
      }
    };
    fetchFollowStatus();
  }, [shop?.id]);

  // Handle follow/unfollow mutation
  const toggleFollowMutation = useMutation({
    mutationFn: async () => {
      if (!shop?.id) return;

      const endpoint = isFollowing
        ? "/seller/api/unfollow-shop"
        : "/seller/api/follow-shop";

      await axiosInstance.post(endpoint, { shopId: shop.id });
    },
    onSuccess: () => {
      setFollowers(prev => isFollowing ? prev - 1 : prev + 1);
      setIsFollowing(prev => !prev);
      queryClient.invalidateQueries({
        queryKey: ["is-following", shop?.id],
      });
    },
    onError: (error) => {
      console.error("Failed to follow/unfollow the shop:", error);
    },
  });

  // Track shop visit analytics
  useEffect(() => {
    if (!isLoading && shop?.id && user?.id) {
      sendKafkaEvent({
        userId: user.id,
        shopId: shop.id,
        action: "shop_visit",
        country: location?.country || "Unknown",
        city: location?.city || "Unknown",
        device: deviceInfo || "Unknown Device",
      });
    }
  }, [isLoading, shop?.id, user?.id, location, deviceInfo]);

  if (!shop) {
    return <div className="text-center py-10">Shop not found</div>;
  }

  return (
    <div className="pb-10">

      {/* Cover Image */}
      <div className="relative w-full flex justify-center">
        <Image
          src={shop.coverBanner || "/default-cover-banner.png"}
          alt="Seller Cover"
          className="w-full h-[400px] object-cover"
          width={1200}
          height={300}
        />
      </div>

      {/* Main Content */}
      <div className="w-[85%] lg:w-[70%] mt-[-50px] mx-auto relative z-20 flex flex-col lg:flex-row gap-6">
        {/* Seller Profile Section */}
        <div className="bg-gray-100 p-6 rounded-lg shadow-lg flex-1">
          <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
            {/* Avatar */}
            <div className="relative w-[100px] h-[100px] rounded-full border-4 border-white shadow-md">
              <Image
                src={shop.avatar || "/default-avatar.png"}
                alt="Seller Avatar"
                fill
                className="rounded-full object-cover"
              />
            </div>

            {/* Seller Info */}
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-800">{shop.name}</h1>
              <p className="text-gray-600 text-sm mt-1">
                {shop.bio || "No bio available."}
              </p>

              <div className="flex items-center gap-4 mt-2">
                <div className="flex items-center text-blue-500 gap-1">
                  <Star fill="#3b82f6" size={18} />
                  <span>{shop.ratings?.toFixed(1) || "N/A"}</span>
                </div>
                <div className="flex items-center text-gray-700 gap-1">
                  <Users size={18} />
                  <span>{followers.toLocaleString()} Followers</span>
                </div>
              </div>

              <div className="flex items-center gap-3 mt-3 text-gray-700">
                <Clock size={18} />
                <span>{shop.opening_hours || "Mon - Sat: 9 AM - 6 PM"}</span>
              </div>

              <div className="flex items-center gap-2 mt-3 text-gray-700">
                <MapPin size={18} />
                <span>{shop.address || "No address provided"}</span>
              </div>
            </div>

            {/* Follow Button */}
            <button
              className={`px-6 py-2 h-[40px] rounded-lg font-semibold flex items-center gap-2 transition-colors ${
                isFollowing
                  ? "bg-red-500 hover:bg-red-600"
                  : "bg-blue-600 hover:bg-blue-700"
              } text-white`}
              onClick={() => toggleFollowMutation.mutate()}
              disabled={toggleFollowMutation.isPending}
            >
              <Heart
                size={18}
                fill={isFollowing ? "white" : "none"}
                className={isFollowing ? "" : "stroke-white"}
              />
              {toggleFollowMutation.isPending ? (
                "Processing..."
              ) : isFollowing ? (
                "Unfollow"
              ) : (
                "Follow"
              )}
            </button>
          </div>
        </div>

        {/* Shop Details Section */}
        <div className="bg-gray-100 p-6 rounded-lg shadow-lg w-full lg:w-[30%]">
          <h2 className="text-xl font-semibold text-gray-900">Shop Details</h2>

          <div className="flex items-center gap-3 mt-3 text-gray-700">
            <Calendar size={18} />
            <span>
              Joined: {shop.createdAt ? new Date(shop.createdAt).toLocaleDateString() : "N/A"}
            </span>
          </div>

          <div className="flex items-center gap-3 mt-3 text-gray-700">
            <Globe size={18} />
            {shop.website ? (
              <Link
                href={shop.website}
                className="hover:underline text-blue-600"
                target="_blank"
                rel="noopener noreferrer"
              >
                {shop.website}
              </Link>
            ) : (
              <span>No website</span>
            )}
          </div>

          {shop.socialLinks && shop.socialLinks.length > 0 && (
            <div className="mt-3">
              <h3 className="text-gray-700 text-lg font-medium">Follow Us:</h3>
              <div className="flex gap-3 mt-2">
                {shop.socialLinks.map((link, index) => (
                  <a
                    key={index}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800"
                  >
                    {link.type === "youtube" && "YouTube"}
                    {link.type === "twitter" && "Twitter"}
                    {link.type === "facebook" && "Facebook"}
                    {link.type === "instagram" && "Instagram"}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tabs Section */}
      <div className="w-[85%] lg:w-[70%] mx-auto mt-8">
        <div className="flex border-b border-gray-300">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-3 px-6 text-lg font-medium transition-colors ${
                activeTab === tab
                  ? "text-gray-800 border-b-2 border-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="mt-6">
          {activeTab === "Products" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products?.length ? (
                products.map((product: any) => (
                  <ProductCard key={product.id} product={product} />
                ))
              ) : (
                <div className="col-span-3 text-center py-10 text-gray-500">
                  No products available
                </div>
              )}
            </div>
          )}

          {activeTab === "Offers" && (
            <div className="text-center py-10 text-gray-500">
              {isEventsLoading ? (
                "Loading offers..."
              ) : events?.length ? (
                events.map((product: any) => (
                    <ProductCard key={product.id} product={product} isEvent={true} />
                ))
              ) : (
                "No current offers available"
              )}
            </div>
          )}

          {activeTab === "Reviews" && (
            <div className="text-center py-10 text-gray-500">
              No reviews yet
            </div>
          )}
        </div>
      </div>
    </div>
  );
};