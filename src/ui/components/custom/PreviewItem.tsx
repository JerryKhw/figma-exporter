import React from "react";

import { X } from "lucide-react";
import { Input } from "@ui/components/ui/input";

import type { PreviewUi } from "@common/interface";
import { ViewMode } from "@common/enum";

export const PreviewItem = ({
    viewMode,
    preview,
    onChange,
    onDelete,
}: {
    viewMode: ViewMode;
    preview: PreviewUi;
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onDelete: () => void;
}) => {
    return (
        <div
            key={preview.id}
            className={`flex ${
                viewMode === ViewMode.LIST
                    ? "flex-row items-center gap-3"
                    : "flex-col items-center"
            }`}
        >
            <div
                className={`${
                    viewMode === ViewMode.LIST
                        ? "size-12 shrink-0"
                        : "w-full aspect-square"
                } relative rounded-lg border border-gray-200 overflow-hidden ${
                    viewMode === ViewMode.GRID ? "mb-2" : ""
                } bg-white group`}
            >
                <button
                    onClick={onDelete}
                    className="absolute top-1 right-1 size-5 bg-black hover:bg-gray-800 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10"
                    title="Delete image"
                >
                    <X className="size-3" />
                </button>

                <div
                    className="absolute inset-0 opacity-30"
                    style={{
                        backgroundImage: `
              linear-gradient(45deg, #f0f0f0 25%, transparent 25%), 
              linear-gradient(-45deg, #f0f0f0 25%, transparent 25%), 
              linear-gradient(45deg, transparent 75%, #f0f0f0 75%), 
              linear-gradient(-45deg, transparent 75%, #f0f0f0 75%)
            `,
                        backgroundSize: "8px 8px",
                        backgroundPosition: "0 0, 0 4px, 4px -4px, -4px 0px",
                    }}
                />
                <img
                    src={`data:image/png;base64,${preview.base64}`}
                    alt=""
                    className="absolute inset-0 w-full h-full object-contain"
                />
            </div>
            <Input
                placeholder="name"
                value={preview.name}
                onChange={onChange}
                className={`h-7 text-xs ${
                    viewMode === ViewMode.LIST
                        ? "flex-1 text-left"
                        : "text-center w-full"
                } border-gray-200 focus:outline-hidden focus:ring-0 focus:border-gray-400`}
            />
        </div>
    );
};
