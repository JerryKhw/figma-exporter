import React, { useState } from "react";

export const CustomTooltip = ({
    children,
    content,
}: {
    children: React.ReactNode;
    content: string;
}) => {
    const [isVisible, setIsVisible] = useState(false);

    return (
        <div
            className="relative"
            onMouseEnter={() => setIsVisible(true)}
            onMouseLeave={() => setIsVisible(false)}
        >
            {children}
            {isVisible && (
                <div className="absolute bottom-full left-0 mb-1 z-50">
                    <div className="bg-white border border-gray-200 rounded-md shadow-lg px-3 py-2 text-xs text-gray-700 whitespace-nowrap">
                        {content}
                        <div className="absolute top-full left-3 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-200"></div>
                    </div>
                </div>
            )}
        </div>
    );
};
