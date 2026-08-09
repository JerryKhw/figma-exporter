import React from "react";

export const LoadingPage = () => {
    return (
        <div className="size-full bg-white dark:bg-[#3A3A3A] flex items-center justify-center transition-colors duration-200">
            <div className="flex flex-col items-center gap-4">
                <div className="size-8 border-2 border-gray-400 dark:border-gray-500 border-t-gray-800 dark:border-t-white rounded-full animate-spin"></div>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                    Loading Figma Exporter...
                </p>
            </div>
        </div>
    );
};
