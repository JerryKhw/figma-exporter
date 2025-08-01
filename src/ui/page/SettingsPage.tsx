import React, { useState, useCallback, useEffect } from "react";

import {
    Globe,
    FolderOpen,
    Plus,
    Coffee,
    Trash2,
    Sun,
    Moon,
    Monitor,
} from "lucide-react";

import { useAppStore } from "@ui/app-store";
import { SettingScope, ViewMode, NameCase, Theme } from "@common/enum";
import { Button } from "@ui/components/ui/button";
import { Input } from "@ui/components/ui/input";
import { ToggleSwitch } from "@ui/components/custom/ToggleSwitch";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@ui/components/ui/select";
import { ResizeHandle } from "@ui/components/custom";

export const SettingsPage = () => {
    const {
        onGoExportPage,
        projectData,
        globalSetting,
        projectSetting,
        onSaveSetting,
        applyTheme,
    } = useAppStore();

    const { settingScope } = projectData;

    const [tmpSettingScope, setTmpSettingScope] = useState(settingScope);
    const [tmpSetting, setTmpSetting] = useState(
        settingScope === SettingScope.GLOBAL ? globalSetting : projectSetting
    );

    useEffect(() => {
        setTmpSetting(
            tmpSettingScope === SettingScope.GLOBAL
                ? globalSetting
                : projectSetting
        );
    }, [tmpSettingScope, globalSetting, projectSetting]);

    const onChangeTmpSettingScope = useCallback((newScope: SettingScope) => {
        setTmpSettingScope(newScope);
    }, []);

    const addPreviewReplacement = () => {
        setTmpSetting((prev) => ({
            ...prev,
            previewNameCleanupRules: [
                ...prev.previewNameCleanupRules,
                {
                    id:
                        Math.max(
                            ...prev.previewNameCleanupRules.map((r) => r.id),
                            0
                        ) + 1,
                    original: "",
                    replacement: "",
                },
            ],
        }));
    };

    const addExportReplacement = () => {
        setTmpSetting((prev) => ({
            ...prev,
            exportNameCleanupRules: [
                ...prev.exportNameCleanupRules,
                {
                    id:
                        Math.max(
                            ...prev.exportNameCleanupRules.map((r) => r.id),
                            0
                        ) + 1,
                    original: "",
                    replacement: "",
                },
            ],
        }));
    };

    const removePreviewReplacement = (index: number) => {
        setTmpSetting((prev) => ({
            ...prev,
            previewNameCleanupRules: prev.previewNameCleanupRules.filter(
                (_, i) => i !== index
            ),
        }));
    };

    const removeExportReplacement = (index: number) => {
        setTmpSetting((prev) => ({
            ...prev,
            exportNameCleanupRules: prev.exportNameCleanupRules.filter(
                (_, i) => i !== index
            ),
        }));
    };

    const onSupportUsClick = useCallback(() => {
        window.open("https://buymeacoffee.com/jerrykhw", "_blank");
    }, []);

    const onSave = useCallback(() => {
        applyTheme(tmpSetting.theme);
        onSaveSetting(tmpSettingScope, tmpSetting);
    }, [tmpSetting, applyTheme]);

    return (
        <>
            <div className="size-full bg-white dark:bg-[#3A3A3A] flex flex-col relative transition-colors duration-200">
                <div className="p-4 pb-2">
                    <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100 text-center">
                        Settings
                    </h1>
                </div>

                <div className="flex-1 overflow-y-auto px-4 pb-2">
                    <div className="mb-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md border border-blue-200 dark:border-blue-700/50 transition-colors duration-200">
                        <div className="flex items-center gap-2 text-xs text-blue-700 dark:text-blue-300 font-medium">
                            {tmpSettingScope === SettingScope.GLOBAL ? (
                                <>
                                    <Globe className="size-3" />
                                    <span>
                                        Configuring global settings for all
                                        projects
                                    </span>
                                </>
                            ) : (
                                <>
                                    <FolderOpen className="size-3" />
                                    <span>
                                        Configuring settings for this project
                                        only
                                    </span>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Theme Settings */}
                    <div className="mb-4">
                        <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Appearance
                        </h2>
                        <div className="flex gap-4 text-xs">
                            <label className="flex items-center">
                                <input
                                    type="radio"
                                    name="theme"
                                    value={Theme.LIGHT}
                                    checked={tmpSetting.theme === Theme.LIGHT}
                                    onChange={(e) => {
                                        const newTheme = e.target
                                            .value as Theme;
                                        setTmpSetting((prev) => ({
                                            ...prev,
                                            theme: newTheme,
                                        }));
                                    }}
                                    className="mr-2 w-3 h-3"
                                />
                                <Sun className="w-3 h-3 mr-1" />
                                <span className="text-gray-700 dark:text-gray-300">
                                    Light
                                </span>
                            </label>
                            <label className="flex items-center">
                                <input
                                    type="radio"
                                    name="theme"
                                    value={Theme.DARK}
                                    checked={tmpSetting.theme === Theme.DARK}
                                    onChange={(e) => {
                                        const newTheme = e.target
                                            .value as Theme;
                                        setTmpSetting((prev) => ({
                                            ...prev,
                                            theme: newTheme,
                                        }));
                                    }}
                                    className="mr-2 w-3 h-3"
                                />
                                <Moon className="w-3 h-3 mr-1" />
                                <span className="text-gray-700 dark:text-gray-300">
                                    Dark
                                </span>
                            </label>
                            <label className="flex items-center">
                                <input
                                    type="radio"
                                    name="theme"
                                    value={Theme.SYSTEM}
                                    checked={tmpSetting.theme === Theme.SYSTEM}
                                    onChange={(e) => {
                                        const newTheme = e.target
                                            .value as Theme;
                                        setTmpSetting((prev) => ({
                                            ...prev,
                                            theme: newTheme,
                                        }));
                                    }}
                                    className="mr-2 w-3 h-3"
                                />
                                <Monitor className="w-3 h-3 mr-1" />
                                <span className="text-gray-700 dark:text-gray-300">
                                    System
                                </span>
                            </label>
                        </div>
                    </div>

                    <div className="mb-4">
                        <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Layout Settings
                        </h2>
                        <div className="space-y-2">
                            <div className="flex gap-4 text-xs">
                                <label className="flex items-center">
                                    <input
                                        type="radio"
                                        name="viewMode"
                                        value="grid"
                                        checked={
                                            tmpSetting.viewMode ===
                                            ViewMode.GRID
                                        }
                                        onChange={(e) =>
                                            setTmpSetting((prev) => ({
                                                ...prev,
                                                viewMode: e.target
                                                    .value as ViewMode,
                                            }))
                                        }
                                        className="mr-2 w-3 h-3"
                                    />
                                    <span className="text-gray-700 dark:text-gray-300">
                                        Grid View
                                    </span>
                                </label>
                                <label className="flex items-center">
                                    <input
                                        type="radio"
                                        name="viewMode"
                                        value="list"
                                        checked={
                                            tmpSetting.viewMode ===
                                            ViewMode.LIST
                                        }
                                        onChange={(e) =>
                                            setTmpSetting((prev) => ({
                                                ...prev,
                                                viewMode: e.target
                                                    .value as ViewMode,
                                            }))
                                        }
                                        className="mr-2 w-3 h-3"
                                    />
                                    <span className="text-gray-700 dark:text-gray-300">
                                        List View
                                    </span>
                                </label>
                            </div>

                            {tmpSetting.viewMode === ViewMode.GRID && (
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-gray-700 dark:text-gray-300">
                                        Items per row:
                                    </span>
                                    <Select
                                        value={tmpSetting.perRow.toString()}
                                        onValueChange={(value) =>
                                            setTmpSetting((prev) => ({
                                                ...prev,
                                                perRow: Number.parseInt(value),
                                            }))
                                        }
                                    >
                                        <SelectTrigger className="w-16 h-6 text-xs bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="2">2</SelectItem>
                                            <SelectItem value="3">3</SelectItem>
                                            <SelectItem value="4">4</SelectItem>
                                            <SelectItem value="5">5</SelectItem>
                                            <SelectItem value="6">6</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="mb-4">
                        <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Actions
                        </h2>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-gray-700 dark:text-gray-300">
                                    Auto-close after export
                                </span>
                                <ToggleSwitch
                                    checked={tmpSetting.autoCloseAfterExport}
                                    onChange={(checked) =>
                                        setTmpSetting((prev) => ({
                                            ...prev,
                                            autoCloseAfterExport: checked,
                                        }))
                                    }
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-gray-700 dark:text-gray-300">
                                    Reload preview on selection change
                                </span>
                                <ToggleSwitch
                                    checked={
                                        tmpSetting.reloadPreviewOnSelectionChange
                                    }
                                    onChange={(checked) =>
                                        setTmpSetting((prev) => ({
                                            ...prev,
                                            reloadPreviewOnSelectionChange:
                                                checked,
                                        }))
                                    }
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-gray-700 dark:text-gray-300">
                                    Force compression at 100% quality
                                </span>
                                <ToggleSwitch
                                    checked={
                                        tmpSetting.forceCompressionAt100Quality
                                    }
                                    onChange={(checked) =>
                                        setTmpSetting((prev) => ({
                                            ...prev,
                                            forceCompressionAt100Quality:
                                                checked,
                                        }))
                                    }
                                />
                            </div>
                        </div>
                    </div>

                    <div className="mb-4">
                        <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Preview Name Case
                        </h2>
                        <div className="flex gap-4 text-xs">
                            <label className="flex items-center">
                                <input
                                    type="radio"
                                    name="nameCase"
                                    value={NameCase.ORIGINAL}
                                    checked={
                                        tmpSetting.previewNameCase ===
                                        NameCase.ORIGINAL
                                    }
                                    onChange={(e) =>
                                        setTmpSetting((prev) => ({
                                            ...prev,
                                            previewNameCase: e.target
                                                .value as NameCase,
                                        }))
                                    }
                                    className="mr-2 w-3 h-3"
                                />
                                <span className="text-gray-700 dark:text-gray-300">
                                    Original
                                </span>
                            </label>
                            <label className="flex items-center">
                                <input
                                    type="radio"
                                    name="nameCase"
                                    value={NameCase.LOWER_CASE}
                                    checked={
                                        tmpSetting.previewNameCase ===
                                        NameCase.LOWER_CASE
                                    }
                                    onChange={(e) =>
                                        setTmpSetting((prev) => ({
                                            ...prev,
                                            previewNameCase: e.target
                                                .value as NameCase,
                                        }))
                                    }
                                    className="mr-2 w-3 h-3"
                                />
                                <span className="text-gray-700 dark:text-gray-300">
                                    Lowercase
                                </span>
                            </label>
                            <label className="flex items-center">
                                <input
                                    type="radio"
                                    name="nameCase"
                                    value={NameCase.UPPER_CASE}
                                    checked={
                                        tmpSetting.previewNameCase ===
                                        NameCase.UPPER_CASE
                                    }
                                    onChange={(e) =>
                                        setTmpSetting((prev) => ({
                                            ...prev,
                                            previewNameCase: e.target
                                                .value as NameCase,
                                        }))
                                    }
                                    className="mr-2 w-3 h-3"
                                />
                                <span className="text-gray-700 dark:text-gray-300">
                                    Uppercase
                                </span>
                            </label>
                        </div>
                    </div>

                    <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                            <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Preview Name Cleanup Rules
                            </h2>
                            <Button
                                onClick={addPreviewReplacement}
                                variant="outline"
                                size="sm"
                                className="h-6 px-2 text-xs bg-transparent border-gray-200 dark:border-gray-600 hover:bg-gray-50"
                            >
                                <Plus className="w-3 h-3 mr-1" />
                                Add Rule
                            </Button>
                        </div>
                        <div className="space-y-2">
                            {tmpSetting.previewNameCleanupRules.map(
                                (rule, index) => (
                                    <div
                                        key={rule.id}
                                        className="flex items-center gap-2"
                                    >
                                        <Input
                                            placeholder="Find"
                                            value={rule.original}
                                            onChange={(e) => {
                                                setTmpSetting((prev) => ({
                                                    ...prev,
                                                    previewNameCleanupRules:
                                                        prev.previewNameCleanupRules.map(
                                                            (r, i) =>
                                                                i === index
                                                                    ? {
                                                                          ...r,
                                                                          original:
                                                                              e
                                                                                  .target
                                                                                  .value,
                                                                      }
                                                                    : r
                                                        ),
                                                }));
                                            }}
                                            className="h-6 text-xs flex-1 bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 focus:outline-hidden focus:ring-0 focus:border-gray-400 dark:focus:border-gray-500"
                                        />
                                        <span className="text-gray-400 dark:text-gray-500 text-sm">
                                            →
                                        </span>
                                        <Input
                                            placeholder="Replace with"
                                            value={rule.replacement}
                                            onChange={(e) => {
                                                setTmpSetting((prev) => ({
                                                    ...prev,
                                                    previewNameCleanupRules:
                                                        prev.previewNameCleanupRules.map(
                                                            (r, i) =>
                                                                i === index
                                                                    ? {
                                                                          ...r,
                                                                          replacement:
                                                                              e
                                                                                  .target
                                                                                  .value,
                                                                      }
                                                                    : r
                                                        ),
                                                }));
                                            }}
                                            className="h-6 text-xs flex-1 bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 focus:outline-hidden focus:ring-0 focus:border-gray-400 dark:focus:border-gray-500"
                                        />
                                        <Button
                                            onClick={() =>
                                                removePreviewReplacement(index)
                                            }
                                            variant="ghost"
                                            size="sm"
                                            className="h-6 w-6 p-0 text-gray-400 dark:text-gray-500 hover:text-red-500"
                                        >
                                            <Trash2 className="w-3 h-3" />
                                        </Button>
                                    </div>
                                )
                            )}
                        </div>
                    </div>

                    <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                            <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Export Name Cleanup Rules
                            </h2>
                            <Button
                                onClick={addExportReplacement}
                                variant="outline"
                                size="sm"
                                className="h-6 px-2 text-xs bg-transparent border-gray-200 dark:border-gray-600 hover:bg-gray-50"
                            >
                                <Plus className="w-3 h-3 mr-1" />
                                Add Rule
                            </Button>
                        </div>
                        <div className="space-y-2">
                            {tmpSetting.exportNameCleanupRules.map(
                                (rule, index) => (
                                    <div
                                        key={rule.id}
                                        className="flex items-center gap-2"
                                    >
                                        <Input
                                            placeholder="Find"
                                            value={rule.original}
                                            onChange={(e) => {
                                                setTmpSetting((prev) => ({
                                                    ...prev,
                                                    exportNameCleanupRules:
                                                        prev.exportNameCleanupRules.map(
                                                            (r, i) =>
                                                                i === index
                                                                    ? {
                                                                          ...r,
                                                                          original:
                                                                              e
                                                                                  .target
                                                                                  .value,
                                                                      }
                                                                    : r
                                                        ),
                                                }));
                                            }}
                                            className="h-6 text-xs flex-1 bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 focus:outline-hidden focus:ring-0 focus:border-gray-400 dark:focus:border-gray-500"
                                        />
                                        <span className="text-gray-400 dark:text-gray-500 text-sm">
                                            →
                                        </span>
                                        <Input
                                            placeholder="Replace with"
                                            value={rule.replacement}
                                            onChange={(e) => {
                                                setTmpSetting((prev) => ({
                                                    ...prev,
                                                    exportNameCleanupRules:
                                                        prev.exportNameCleanupRules.map(
                                                            (r, i) =>
                                                                i === index
                                                                    ? {
                                                                          ...r,
                                                                          replacement:
                                                                              e
                                                                                  .target
                                                                                  .value,
                                                                      }
                                                                    : r
                                                        ),
                                                }));
                                            }}
                                            className="h-6 text-xs flex-1 bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 focus:outline-hidden focus:ring-0 focus:border-gray-400 dark:focus:border-gray-500"
                                        />
                                        <Button
                                            onClick={() =>
                                                removeExportReplacement(index)
                                            }
                                            variant="ghost"
                                            size="sm"
                                            className="h-6 w-6 p-0 text-gray-400 dark:text-gray-500 hover:text-red-500"
                                        >
                                            <Trash2 className="w-3 h-3" />
                                        </Button>
                                    </div>
                                )
                            )}
                        </div>
                    </div>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-600 p-3 transition-colors duration-200">
                    <div className="flex justify-between items-center">
                        <button
                            onClick={onSupportUsClick}
                            className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 hover:text-amber-600 transition-colors duration-200 group"
                        >
                            <Coffee className="w-3.5 h-3.5 text-amber-500 group-hover:text-amber-600 dark:group-hover:text-amber-400" />
                            <span>Support Us</span>
                        </button>

                        <div className="flex items-center gap-3">
                            <SettingsScopeToggle
                                value={tmpSettingScope}
                                onChange={onChangeTmpSettingScope}
                            />

                            <div className="flex gap-2">
                                <Button
                                    onClick={onGoExportPage}
                                    variant="outline"
                                    size="sm"
                                    className="h-7 px-3 text-xs bg-transparent border-gray-200 dark:border-gray-600 hover:bg-gray-50"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={onSave}
                                    size="sm"
                                    className="h-7 px-3 text-xs bg-black dark:bg-white hover:bg-gray-800 text-white dark:text-gray-800"
                                >
                                    Save
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <ResizeHandle />
        </>
    );
};

const SettingsScopeToggle = ({
    value,
    onChange,
}: {
    value: SettingScope;
    onChange: (value: SettingScope) => void;
}) => {
    const isGlobal = value === SettingScope.GLOBAL;

    return (
        <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
                <FolderOpen
                    className={`size-3 ${!isGlobal ? "text-gray-900 dark:text-gray-100" : "text-gray-400 dark:text-gray-500"}`}
                />
                <span
                    className={`text-xs ${!isGlobal ? "text-gray-900 dark:text-gray-100 font-medium" : "text-gray-500 dark:text-gray-400"}`}
                >
                    Project
                </span>
            </div>

            <button
                type="button"
                role="switch"
                aria-checked={isGlobal}
                onClick={() =>
                    onChange(
                        isGlobal ? SettingScope.PROJECT : SettingScope.GLOBAL
                    )
                }
                className={`
          relative inline-flex h-4 w-7 items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-hidden focus:ring-2 focus:ring-gray-400 focus:ring-offset-1
          ${isGlobal ? "bg-black dark:bg-white" : "bg-gray-300 dark:bg-gray-600"}
          cursor-pointer
        `}
            >
                <span
                    className={`
            inline-block size-3 transform rounded-full bg-white dark:bg-gray-800 transition-transform duration-200 ease-in-out
            ${isGlobal ? "translate-x-3.5" : "translate-x-0.5"}
          `}
                />
            </button>

            <div className="flex items-center gap-1.5">
                <Globe
                    className={`size-3 ${isGlobal ? "text-gray-900 dark:text-gray-100" : "text-gray-400 dark:text-gray-500"}`}
                />
                <span
                    className={`text-xs ${isGlobal ? "text-gray-900 dark:text-gray-100 font-medium" : "text-gray-500 dark:text-gray-400"}`}
                >
                    Global
                </span>
            </div>
        </div>
    );
};
