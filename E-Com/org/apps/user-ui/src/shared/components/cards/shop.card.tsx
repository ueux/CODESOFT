import React from 'react';
import Image from 'next/image';
import { ArrowUpRight, MapPin, Star } from 'lucide-react';
import Link from 'next/link';

interface ShopCardProps {
    shop: {
        id: string;
        coverBanner?: string;
        avatar?: string;
        name?: string;
        followers?: any[];
        address?: string;
        ratings?: number;
        category?: string;
    };
}

const ShopCard: React.FC<ShopCardProps> = ({ shop }) => {
    return (
        <div className="w-full rounded-lg cursor-pointer bg-white border border-gray-100 shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group">
            {/* Cover with overlay effect */}
            <div className="h-[140px] w-full relative overflow-hidden">
                <Image
                    src={shop?.coverBanner || '/default-cover.png'}
                    alt="Cover"
                    fill
                    className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
            </div>

            {/* Avatar with pulse animation */}
            <div className="relative flex justify-center -mt-10">
                <div className="w-20 h-20 rounded-full border-[3px] border-white overflow-hidden shadow-lg bg-white relative z-10 transition-all duration-300 group-hover:scale-110">
                    <Image
                        src={shop?.avatar || '/default-avatar.png'}
                        alt={shop?.name || 'Shop avatar'}
                        width={80}
                        height={80}
                        className="object-cover"
                    />
                </div>
            </div>

            {/* Info section */}
            <div className="px-5 pb-5 pt-3 text-center">
                <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-1">
                    {shop?.name || 'Shop Name'}
                </h3>
                <p className="text-xs text-gray-500 mb-3">
                    <span className="inline-block px-2 py-1 bg-gray-50 rounded-full">
                        {shop?.followers?.length ?? 0} Followers
                    </span>
                </p>

                {/* Address + Ratings */}
                <div className="flex items-center justify-center text-sm text-gray-600 mt-2 gap-4 mb-4">
                    {shop?.address && (
                        <span className="flex items-center gap-1 max-w-[140px]">
                            <MapPin className="w-4 h-4 shrink-0 text-blue-500" />
                            <span className="truncate">{shop.address}</span>
                        </span>
                    )}
                    <span className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                        <span className="font-medium">{shop?.ratings?.toFixed(1) ?? "N/A"}</span>
                    </span>
                </div>

                {/* Category */}
                {shop?.category && (
                    <div className="mb-4">
                        <span className="inline-block bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-600 px-3 py-1 rounded-full text-xs font-medium shadow-sm">
                            {shop.category}
                        </span>
                    </div>
                )}

                {/* Visit Button with animation */}
                <div className="mt-4">
                    <Link
                        href={`/shop/${shop.id}`}
                        className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 hover:from-blue-600 hover:to-blue-700 group-hover:scale-[1.02]"
                    >
                        Visit Shop
                        <ArrowUpRight className="w-4 h-4 ml-2 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ShopCard;