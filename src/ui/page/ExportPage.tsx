import React, { useCallback, useMemo } from "react";

import { Settings } from "lucide-react";
import { Button } from "@ui/components/ui/button";
import { Input } from "@ui/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@ui/components/ui/select";
import {
    CustomTooltip,
    LoadingOverlay,
    PreviewItem,
    ResizeHandle,
} from "@ui/components/custom";

import { Format, Platform, ViewMode } from "@common/enum";
import { useAppStore } from "@ui/app-store";

const formatList = [
    {
        name: "PNG",
        value: Format.PNG,
    },
    {
        name: "JPG",
        value: Format.JPG,
    },
    {
        name: "WebP",
        value: Format.WEBP,
    },
    {
        name: "SVG",
        value: Format.SVG,
    },
    {
        name: "PDF",
        value: Format.PDF,
    },
];

const platformList = [
    {
        name: "Web",
        value: Platform.WEB,
    },
    {
        name: "Android",
        value: Platform.ANDROID,
    },
    {
        name: "iOS",
        value: Platform.iOS,
    },
    {
        name: "Flutter",
        value: Platform.FLUTTER,
    },
    {
        name: "React Native",
        value: Platform.RN,
    },
];

export const ExportPage = () => {
    const {
        isDev,
        isLoading,
        onGoSettingsPage,
        previews,
        updatePreviewName,
        deletePreview,
        setting: { viewMode, perRow },
        projectData,
        onChangeFormat,
        onChangePlatform,
        onChangePrefix,
        onChangeSuffix,
        onChangeQuality,
        onExport,
    } = useAppStore();

    const { format, platform, prefix, suffix, quality } = projectData;

    const onChangePreviewName = useCallback((id: string, name: string) => {
        updatePreviewName(id, name);
    }, []);

    const onDeletePreview = useCallback((id: string) => {
        deletePreview(id);
    }, []);

    const platformDisabled = useMemo(() => {
        return format === Format.SVG || format === Format.PDF;
    }, [format]);

    return (
        <>
            <div className="size-full bg-white dark:bg-[#3A3A3A] flex flex-col relative transition-colors duration-200">
                <div className="flex-1 p-3 overflow-auto">
                    {viewMode === ViewMode.GRID ? (
                        <div
                            className={`grid gap-2 content-start`}
                            style={{
                                gridTemplateColumns: `repeat(${perRow}, 1fr)`,
                            }}
                        >
                            {previews.map((preview) => (
                                <PreviewItem
                                    key={preview.id}
                                    viewMode={viewMode}
                                    preview={preview}
                                    onChange={(e) => {
                                        onChangePreviewName(
                                            preview.id,
                                            e.target.value
                                        );
                                    }}
                                    onDelete={() => onDeletePreview(preview.id)}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {previews.map((preview) => (
                                <PreviewItem
                                    key={preview.id}
                                    viewMode={viewMode}
                                    preview={preview}
                                    onChange={(e) => {
                                        onChangePreviewName(
                                            preview.id,
                                            e.target.value
                                        );
                                    }}
                                    onDelete={() => onDeletePreview(preview.id)}
                                />
                            ))}
                        </div>
                    )}
                </div>

                <div className="border-t border-gray-200 dark:border-gray-600 p-4 transition-colors duration-200">
                    <div className="flex justify-between items-end">
                        <div className="flex flex-col gap-2">
                            <div className="flex gap-2">
                                <Select
                                    value={format}
                                    onValueChange={onChangeFormat}
                                >
                                    <SelectTrigger className="w-20 h-7 text-xs bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <div className="px-2 py-1.5 text-xs font-medium text-gray-500 dark:text-gray-400 pointer-events-none border-b border-gray-100 dark:border-gray-600">
                                            Format
                                        </div>
                                        {formatList.map((item) => (
                                            <SelectItem
                                                key={item.value}
                                                value={item.value}
                                            >
                                                {item.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                {(format === Format.JPG ||
                                    format === Format.PNG ||
                                    format === Format.WEBP) && (
                                    <CustomTooltip content="Set compression quality (1-100%)">
                                        <div className="relative w-16">
                                            <Input
                                                placeholder="100"
                                                value={quality}
                                                onChange={onChangeQuality}
                                                className="h-7 text-xs text-center pr-4 focus:outline-hidden focus:ring-0 focus:border-gray-400 dark:focus:border-gray-500 bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600"
                                            />
                                            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-500 dark:text-gray-400 pointer-events-none">
                                                %
                                            </span>
                                        </div>
                                    </CustomTooltip>
                                )}

                                <Select
                                    value={platform}
                                    onValueChange={onChangePlatform}
                                    disabled={platformDisabled}
                                >
                                    <SelectTrigger className="w-24 h-7 text-xs bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <div className="px-2 py-1.5 text-xs font-medium text-gray-500 dark:text-gray-400 pointer-events-none border-b border-gray-100 dark:border-gray-600">
                                            Platform
                                        </div>
                                        {platformList.map((item) => (
                                            <SelectItem
                                                key={item.value}
                                                value={item.value}
                                            >
                                                {item.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex gap-2">
                                <CustomTooltip content="Add a prefix to all exported file names">
                                    <Input
                                        value={prefix}
                                        onChange={onChangePrefix}
                                        placeholder="Prefix"
                                        className="w-20 h-7 text-xs focus:outline-hidden focus:ring-0 focus:border-gray-400 dark:focus:border-gray-500 bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600"
                                    />
                                </CustomTooltip>
                                <CustomTooltip content="Add a suffix to all exported file names">
                                    <Input
                                        value={suffix}
                                        onChange={onChangeSuffix}
                                        placeholder="Suffix"
                                        className="w-24 h-7 text-xs focus:outline-hidden focus:ring-0 focus:border-gray-400 dark:focus:border-gray-500 bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600"
                                    />
                                </CustomTooltip>
                            </div>

                            {isDev && (
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-8 px-3 bg-transparent border-gray-200 dark:border-gray-600 hover:bg-gray-50"
                                        onClick={onGoSettingsPage}
                                    >
                                        <Settings className="h-3 w-3 mr-1" />
                                        Settings
                                    </Button>

                                    <div className="relative">
                                        <div className="flex">
                                            <Button
                                                size="sm"
                                                className="h-8 px-4 bg-black dark:bg-white hover:bg-gray-800 text-white dark:text-gray-800 border-gray-600 dark:border-gray-300"
                                                onClick={onExport}
                                                disabled={isLoading}
                                            >
                                                {isLoading
                                                    ? "Exporting..."
                                                    : "Export"}
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {!isDev && (
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-8 px-3 bg-transparent border-gray-200 dark:border-gray-600 hover:bg-gray-50"
                                    onClick={onGoSettingsPage}
                                >
                                    <Settings className="h-3 w-3 mr-1" />
                                    Settings
                                </Button>

                                <div className="relative">
                                    <div className="flex">
                                        <Button
                                            size="sm"
                                            className="h-8 px-4 bg-black dark:bg-white hover:bg-gray-800 text-white dark:text-gray-800 border-gray-600 dark:border-gray-300"
                                            onClick={onExport}
                                            disabled={isLoading}
                                        >
                                            {isLoading
                                                ? "Exporting..."
                                                : "Export"}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {!isDev && <ResizeHandle />}
            <LoadingOverlay isLoading={isLoading} />
        </>
    );
};
