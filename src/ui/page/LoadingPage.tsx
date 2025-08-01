import React from "react";

export const LoadingPage = () => {
    return (
        <div className="size-full bg-white flex flex-col relative">
            <div className="flex-1 flex items-center justify-center">
                <div className="relative">
                    <div className="w-8 h-8 border-2 border-gray-200 border-t-gray-600 rounded-full animate-spin"></div>
                </div>
            </div>
        </div>
    );
};
