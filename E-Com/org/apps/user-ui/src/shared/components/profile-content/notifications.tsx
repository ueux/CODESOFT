import { useQuery } from '@tanstack/react-query'
import axiosInstance from 'apps/user-ui/src/utils/axiosInstance'
import Link from 'next/link'
import React from 'react'

const Notifications = () => {
    const { data: notifications, isLoading, refetch } = useQuery({
        queryKey: ["notifications"],
        queryFn: async () => {
            const res = await axiosInstance.get("/admin/api/user-notifications");
            return res.data.notifications
        }
    })

    const markAsRead = async (notificationId: string) => {
        try {
            await axiosInstance.post("/seller/api/mark-notification-as-read", {
                notificationId
            });
            refetch(); // Refresh notifications after marking as read
        } catch (error) {
            console.error("Failed to mark notification as read:", error);
        }
    }

    return (
        <div className="max-w-4xl mx-auto p-4 sm:p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Notifications</h1>

            {isLoading ? (
                <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="animate-pulse bg-gray-100 rounded-lg p-4">
                            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                            <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        </div>
                    ))}
                </div>
            ) : notifications?.length === 0 ? (
                <div className="text-center py-12">
                    <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">No notifications yet</h3>
                    <p className="mt-1 text-sm text-gray-500">We'll notify you when something new arrives.</p>
                </div>
            ) : (
                <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
                    {notifications.map((notification: any) => (
                        <Link
                            key={notification.id}
                            href={notification.redirect_link}
                            className={`block px-4 py-3 transition-colors duration-150 ${notification.status === "Unread"
                                ? "bg-blue-50 hover:bg-blue-100 border-l-4 border-blue-500"
                                : "hover:bg-gray-50"}`}
                            onClick={() => notification.status === "Unread" && markAsRead(notification.id)}
                        >
                            <div className="flex items-start gap-3">
                                <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${
                                    notification.status === "Unread"
                                        ? "bg-blue-100 text-blue-600"
                                        : "bg-gray-100 text-gray-600"
                                }`}>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className={`text-sm font-medium truncate ${
                                        notification.status === "Unread" ? "text-gray-900" : "text-gray-600"
                                    }`}>
                                        {notification.title}
                                    </p>
                                    <p className="text-sm text-gray-500 mt-1">
                                        {notification.message}
                                    </p>
                                    <div className="mt-1 flex items-center text-xs text-gray-400">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0 mr-1 h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        {new Date(notification.createdAt).toLocaleString("en-UK", {
                                            dateStyle: "medium",
                                            timeStyle: "short"
                                        })}
                                    </div>
                                </div>
                                {notification.status === "Unread" && (
                                    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                        New
                                    </span>
                                )}
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    )
}

export default Notifications