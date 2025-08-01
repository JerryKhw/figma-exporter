import React from "react";

export const LoadingOverlay = ({ isLoading }: { isLoading: boolean }) => {
    if (!isLoading) return null;

    return (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
            <div className="size-8 border-2 border-gray-400 dark:border-gray-500 border-t-gray-800 dark:border-t-white rounded-full animate-spin"></div>
        </div>
    );
};
