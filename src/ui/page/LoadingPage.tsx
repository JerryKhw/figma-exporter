import React from "react";

export const LoadingPage = () => {
    return (
        <div className="size-full bg-white flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="size-8 border-2 border-gray-400 dark:border-gray-500 border-t-gray-800 dark:border-t-white rounded-full animate-spin"></div>
                <p className="text-sm text-gray-600">
                    Loading Figma Exporter...
                </p>
            </div>
        </div>
    );
};
