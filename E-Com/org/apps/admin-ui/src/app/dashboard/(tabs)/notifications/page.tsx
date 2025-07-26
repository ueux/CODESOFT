import BreadCrumbs from "apps/admin-ui/src/shared/components/breadcrumbs";
import React from "react";

const Notifications = () => {
    return (
        <div className="w-full min-h-screen p-8 bg-black text-white">
            <div className="mb-4">
                <h2 className="text-2xl font-semibold mb-2">Notifications</h2>
                <BreadCrumbs title="Notifications" />
            </div>

            <div className="flex items-center justify-center pt-24">
                <p className="text-sm font-Poppins">
                    No notifications available yet!
                </p>
            </div>
        </div>
    );
};

export default Notifications;