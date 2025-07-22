import { Pencil } from 'lucide-react';
import Image from 'next/image';
import React from 'react'

const ProfileTabContent = ({ user }: { user: any }) => {
  return (
    <div className="space-y-4 text-sm text-gray-700">
      <div className="flex items-center gap-4">
        <div className="relative">
          <Image
            src={user?.avatar || '/default-avatar.png'}
            alt="Profile"
            width={60}
            height={60}
            className="w-16 h-16 rounded-full border border-gray-200 object-cover"
          />
          <button className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 flex items-center gap-1 text-blue-500 text-xs bg-white px-2 py-1 rounded-full shadow-sm border border-gray-200 hover:bg-blue-50">
            <Pencil className="w-3 h-3" />
            <span>Change</span>
          </button>
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-lg">{user.name}</h3>
          <p className="text-sm text-gray-500">Member since {new Date(user.createdAt).toLocaleDateString()}</p>
        </div>
      </div>

      <div className="space-y-3 mt-6">
        <div className="flex items-center justify-between py-2 border-b border-gray-100">
          <span className="font-semibold">Email:</span>
          <span>{user.email}</span>
        </div>
        <div className="flex items-center justify-between py-2 border-b border-gray-100">
          <span className="font-semibold">Joined:</span>
          <span>{new Date(user.createdAt).toLocaleDateString()}</span>
        </div>
        <div className="flex items-center justify-between py-2 border-b border-gray-100">
          <span className="font-semibold">Earned Points:</span>
          <span className="font-medium">{user.points || 0}</span>
        </div>
      </div>
    </div>
  );
};

export default ProfileTabContent
