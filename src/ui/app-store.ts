import { create } from "zustand";

import type { Platform } from "@common/enum";
import {
    Format,
    Page,
    PluginMessageType,
    SettingScope,
    UiMessageType,
    Theme,
} from "@common/enum";
import type {
    Setting,
    PreviewUi,
    ProjectData,
    CompressionStats,
} from "@common/interface";
import {
    initProjectData,
    initSetting,
    ProjectDataSchema,
    SettingSchema,
    PreviewSchema,
    ExportScale3Schema,
    ExportDefaultSchema,
    ExportScale5Schema,
} from "@common/interface";
import { toBase64 } from "@common/base64";
import { array, object, validate } from "superstruct";
import { downloadBlob, u8ToWebPBytes } from "./lib/utils";
import { compressImageBufferWithStats } from "./lib/image-compression";
import { zip } from "fflate";

type AppStore = {
    isLoading: boolean;
    page: Page;
    onGoSettingsPage: () => void;
    onGoExportPage: () => void;
    setInit: (data: any) => void;
    previews: PreviewUi[];
    setPreviews: (preview: PreviewUi[]) => void;
    updatePreviewName: (id: string, name: string) => void;
    deletePreview: (id: string) => void;
    setting: Setting;
    globalSetting: Setting;
    projectSetting: Setting;
    projectData: ProjectData;
    onChangeFormat: (format: Format) => void;
    onChangePlatform: (platform: Platform) => void;
    onChangePrefix: React.ChangeEventHandler<HTMLInputElement>;
    onChangeSuffix: React.ChangeEventHandler<HTMLInputElement>;
    onChangeQuality: React.ChangeEventHandler<HTMLInputElement>;
    _sanitizeExportName: (setting: Setting, name: string) => string;
    onExport: () => void;
    saveExport: (
        type:
            | PluginMessageType.EXPORT_SVG
            | PluginMessageType.EXPORT_PDF
            | PluginMessageType.EXPORT_WEB
            | PluginMessageType.EXPORT_ANDROID
            | PluginMessageType.EXPORT_FLUTTER
            | PluginMessageType.EXPORT_iOS
            | PluginMessageType.EXPORT_RN,
        data: any,
        schema:
            | typeof ExportDefaultSchema
            | typeof ExportScale3Schema
            | typeof ExportScale5Schema
    ) => void;
    onSaveSetting: (settingScope: SettingScope, setting: Setting) => void;
    currentTheme: Theme;
    isDarkMode: boolean;
    initializeTheme: () => void;
    applyTheme: (theme: Theme) => void;
};

export const useAppStore = create<AppStore>((set, get) => ({
    isLoading: false,
    page: Page.LOADING,
    onGoSettingsPage: () => set({ page: Page.SETTINGS }),
    onGoExportPage: () => set({ page: Page.EXPORT }),
    currentTheme: Theme.SYSTEM,
    isDarkMode: false,
    initializeTheme: () => {
        const { setting } = get();
        const systemDarkMode = window.matchMedia(
            "(prefers-color-scheme: dark)"
        ).matches;

        let shouldBeDark = false;

        if (setting.theme === Theme.DARK) {
            shouldBeDark = true;
        } else if (setting.theme === Theme.LIGHT) {
            shouldBeDark = false;
        } else {
            shouldBeDark = systemDarkMode;
        }

        if (shouldBeDark) {
            document.documentElement.classList.add("dark");
        } else {
            document.documentElement.classList.remove("dark");
        }

        set({ currentTheme: setting.theme, isDarkMode: shouldBeDark });
    },
    applyTheme: (theme: Theme) => {
        const systemDarkMode = window.matchMedia(
            "(prefers-color-scheme: dark)"
        ).matches;

        let shouldBeDark = false;

        if (theme === Theme.DARK) {
            shouldBeDark = true;
        } else if (theme === Theme.LIGHT) {
            shouldBeDark = false;
        } else {
            shouldBeDark = systemDarkMode;
        }

        if (shouldBeDark) {
            document.documentElement.classList.add("dark");
        } else {
            document.documentElement.classList.remove("dark");
        }

        set({ currentTheme: theme, isDarkMode: shouldBeDark });
    },
    setInit: (data) => {
        const [_, result] = validate(
            data,
            object({
                previews: array(PreviewSchema),
                globalSetting: SettingSchema,
                projectSetting: SettingSchema,
                projectData: ProjectDataSchema,
            })
        );

        if (result === undefined) {
            set({ page: Page.EXPORT });
            return;
        }

        const { previews, globalSetting, projectSetting, projectData } = result;

        const setting =
            projectData.settingScope === SettingScope.GLOBAL
                ? globalSetting
                : projectSetting;

        set({
            previews: previews.map((preview) => ({
                id: preview.id,
                name: preview.name,
                base64: toBase64(preview.buffer),
            })),
            setting,
            globalSetting,
            projectSetting,
            projectData,
            page: Page.EXPORT,
        });

        get().initializeTheme();
    },
    previews: [],
    setPreviews: (data) => {
        const [_, result] = validate(data, array(PreviewSchema));

        if (result === undefined) {
            return;
        }

        set({
            previews: result.map((preview) => ({
                id: preview.id,
                name: preview.name,
                base64: toBase64(preview.buffer),
            })),
        });
    },
    updatePreviewName: (id, name) =>
        set((state) => ({
            previews: state.previews.map((preview) =>
                preview.id === id
                    ? {
                          ...preview,
                          name,
                      }
                    : preview
            ),
        })),
    deletePreview: (id) =>
        set((state) => ({
            previews: state.previews.filter((preview) => preview.id !== id),
        })),
    setting: initSetting,
    globalSetting: initSetting,
    projectSetting: initSetting,
    projectData: initProjectData,
    onChangeFormat: (format) =>
        set((state) => ({
            projectData: {
                ...state.projectData,
                format,
            },
        })),
    onChangePlatform: (platform) =>
        set((state) => ({
            projectData: {
                ...state.projectData,
                platform,
            },
        })),
    onChangePrefix: (event) =>
        set((state) => ({
            projectData: {
                ...state.projectData,
                prefix: event.target.value,
            },
        })),
    onChangeSuffix: (event) =>
        set((state) => ({
            projectData: {
                ...state.projectData,
                suffix: event.target.value,
            },
        })),
    onChangeQuality: (event) => {
        const quality = Math.max(
            1,
            Math.min(100, parseInt(event.target.value) || 100)
        );
        set((state) => ({
            projectData: {
                ...state.projectData,
                quality,
            },
        }));
    },
    _sanitizeExportName: (setting, name) => {
        let tmpExportName = name;

        setting.exportNameCleanupRules.forEach((data) => {
            tmpExportName = tmpExportName.replace(
                new RegExp(data.original, "g"),
                data.replacement
            );
        });

        return tmpExportName;
    },
    onExport: () => {
        const { previews, projectData } = get();

        const previewNames = previews.map((preview) => preview.name);

        if (previews.length === 0) {
            parent.postMessage(
                {
                    pluginMessage: {
                        type: UiMessageType.ERROR,
                        data: "Please select a layer",
                    },
                },
                "*"
            );

            return;
        }

        if (previews.filter((preview) => preview.name === "").length > 0) {
            parent.postMessage(
                {
                    pluginMessage: {
                        type: UiMessageType.ERROR,
                        data: "Please enter image file names",
                    },
                },
                "*"
            );

            return;
        }

        if (previewNames.length != new Set(previewNames).size) {
            parent.postMessage(
                {
                    pluginMessage: {
                        type: UiMessageType.ERROR,
                        data: "Duplicate image file names found",
                    },
                },
                "*"
            );

            return;
        }

        set({ isLoading: true });

        parent.postMessage(
            {
                pluginMessage: {
                    type: UiMessageType.REQUEST_EXPORT,
                    data: {
                        previews: previews,
                        projectData: projectData,
                    },
                },
            },
            "*"
        );
    },
    saveExport: async (type, data, schema) => {
        const { projectData, setting, _sanitizeExportName } = get();
        const sanitizeExportName = (name: string): string => {
            return _sanitizeExportName(setting, name);
        };

        const zipData: Record<string, Uint8Array> = {};

        let totalOriginalSize = 0;
        let totalCompressedSize = 0;
        let compressedImagesCount = 0;

        let exportDataLength: number | undefined;
        let firstExportData:
            | {
                  name: string;
                  format: Format;
              }
            | undefined = undefined;

        switch (schema) {
            case ExportDefaultSchema: {
                const [_, result] = validate(data, array(schema));

                if (result === undefined || result.length <= 0) {
                    break;
                }

                exportDataLength = result.length;
                firstExportData = {
                    name: result[0].name,
                    format: result[0].format,
                };

                await Promise.all(
                    result.map(async (exportData) => {
                        const exportName = sanitizeExportName(exportData.name);

                        let u8: Uint8Array;

                        if (exportData.format === Format.WEBP) {
                            u8 = await u8ToWebPBytes(
                                exportData.buffer,
                                projectData.quality
                            );
                            totalOriginalSize += exportData.buffer.length;
                            totalCompressedSize += u8.length;
                            if (u8.length < exportData.buffer.length) {
                                compressedImagesCount++;
                            }
                        } else if (
                            exportData.format === Format.JPG ||
                            exportData.format === Format.PNG
                        ) {
                            const compressionResult =
                                await compressImageBufferWithStats(
                                    exportData.buffer,
                                    {
                                        quality: projectData.quality,
                                        format: exportData.format,
                                        forceCompressionAt100Quality:
                                            setting.forceCompressionAt100Quality,
                                    }
                                );
                            u8 = compressionResult.buffer;
                            totalOriginalSize += compressionResult.originalSize;
                            totalCompressedSize +=
                                compressionResult.compressedSize;
                            if (compressionResult.wasCompressed) {
                                compressedImagesCount++;
                            }
                        } else {
                            u8 = exportData.buffer;
                        }

                        zipData[`${exportName}.${exportData.format}`] = u8;
                    })
                );

                break;
            }
            case ExportScale3Schema: {
                const [_, result] = validate(data, array(schema));

                if (result === undefined || result.length <= 0) {
                    break;
                }

                exportDataLength = result.length;
                firstExportData = {
                    name: result[0].name,
                    format: result[0].format,
                };

                await Promise.all(
                    result.map(async (exportData) => {
                        const exportName = sanitizeExportName(exportData.name);

                        let scale1: Uint8Array,
                            scale2: Uint8Array,
                            scale3: Uint8Array;

                        if (exportData.format === Format.WEBP) {
                            scale1 = await u8ToWebPBytes(
                                exportData.scale1,
                                projectData.quality
                            );
                            scale2 = await u8ToWebPBytes(
                                exportData.scale2,
                                projectData.quality
                            );
                            scale3 = await u8ToWebPBytes(
                                exportData.scale3,
                                projectData.quality
                            );
                            totalOriginalSize +=
                                exportData.scale1.length +
                                exportData.scale2.length +
                                exportData.scale3.length;
                            totalCompressedSize +=
                                scale1.length + scale2.length + scale3.length;
                            let scaleCompressionCount = 0;
                            if (scale1.length < exportData.scale1.length) scaleCompressionCount++;
                            if (scale2.length < exportData.scale2.length) scaleCompressionCount++;
                            if (scale3.length < exportData.scale3.length) scaleCompressionCount++;
                            compressedImagesCount += scaleCompressionCount;
                        } else if (
                            exportData.format === Format.JPG ||
                            exportData.format === Format.PNG
                        ) {
                            const result1 = await compressImageBufferWithStats(
                                exportData.scale1,
                                {
                                    quality: projectData.quality,
                                    format: exportData.format,
                                    forceCompressionAt100Quality:
                                        setting.forceCompressionAt100Quality,
                                }
                            );
                            const result2 = await compressImageBufferWithStats(
                                exportData.scale2,
                                {
                                    quality: projectData.quality,
                                    format: exportData.format,
                                    forceCompressionAt100Quality:
                                        setting.forceCompressionAt100Quality,
                                }
                            );
                            const result3 = await compressImageBufferWithStats(
                                exportData.scale3,
                                {
                                    quality: projectData.quality,
                                    format: exportData.format,
                                    forceCompressionAt100Quality:
                                        setting.forceCompressionAt100Quality,
                                }
                            );
                            scale1 = result1.buffer;
                            scale2 = result2.buffer;
                            scale3 = result3.buffer;
                            totalOriginalSize +=
                                result1.originalSize +
                                result2.originalSize +
                                result3.originalSize;
                            totalCompressedSize +=
                                result1.compressedSize +
                                result2.compressedSize +
                                result3.compressedSize;
                            let scaleCompressionCount = 0;
                            if (result1.wasCompressed) scaleCompressionCount++;
                            if (result2.wasCompressed) scaleCompressionCount++;
                            if (result3.wasCompressed) scaleCompressionCount++;
                            compressedImagesCount += scaleCompressionCount;
                        } else {
                            scale1 = exportData.scale1;
                            scale2 = exportData.scale2;
                            scale3 = exportData.scale3;
                        }

                        zipData[`${exportName}.${exportData.format}`] = scale1;
                        zipData[`${exportName}@2x.${exportData.format}`] =
                            scale2;
                        zipData[`${exportName}@3x.${exportData.format}`] =
                            scale3;
                    })
                );
                break;
            }
            case ExportScale5Schema:
                {
                    const [_, result] = validate(data, array(schema));

                    if (result === undefined || result.length <= 0) {
                        break;
                    }

                    exportDataLength = result.length;
                    firstExportData = {
                        name: result[0].name,
                        format: result[0].format,
                    };

                    await Promise.all(
                        result.map(async (exportData) => {
                            const exportName = sanitizeExportName(
                                exportData.name
                            );

                            let scale1: Uint8Array,
                                scale1_5: Uint8Array,
                                scale2: Uint8Array,
                                scale3: Uint8Array,
                                scale4: Uint8Array;

                            if (exportData.format === Format.WEBP) {
                                scale1 = await u8ToWebPBytes(
                                    exportData.scale1,
                                    projectData.quality
                                );
                                scale1_5 = await u8ToWebPBytes(
                                    exportData.scale1_5,
                                    projectData.quality
                                );
                                scale2 = await u8ToWebPBytes(
                                    exportData.scale2,
                                    projectData.quality
                                );
                                scale3 = await u8ToWebPBytes(
                                    exportData.scale3,
                                    projectData.quality
                                );
                                scale4 = await u8ToWebPBytes(
                                    exportData.scale4,
                                    projectData.quality
                                );
                                totalOriginalSize +=
                                    exportData.scale1.length +
                                    exportData.scale1_5.length +
                                    exportData.scale2.length +
                                    exportData.scale3.length +
                                    exportData.scale4.length;
                                totalCompressedSize +=
                                    scale1.length +
                                    scale1_5.length +
                                    scale2.length +
                                    scale3.length +
                                    scale4.length;
                                let scaleCompressionCount = 0;
                                if (scale1.length < exportData.scale1.length) scaleCompressionCount++;
                                if (scale1_5.length < exportData.scale1_5.length) scaleCompressionCount++;
                                if (scale2.length < exportData.scale2.length) scaleCompressionCount++;
                                if (scale3.length < exportData.scale3.length) scaleCompressionCount++;
                                if (scale4.length < exportData.scale4.length) scaleCompressionCount++;
                                compressedImagesCount += scaleCompressionCount;
                            } else if (
                                exportData.format === Format.JPG ||
                                exportData.format === Format.PNG
                            ) {
                                const result1 =
                                    await compressImageBufferWithStats(
                                        exportData.scale1,
                                        {
                                            quality: projectData.quality,
                                            format: exportData.format,
                                            forceCompressionAt100Quality:
                                                setting.forceCompressionAt100Quality,
                                        }
                                    );
                                const result1_5 =
                                    await compressImageBufferWithStats(
                                        exportData.scale1_5,
                                        {
                                            quality: projectData.quality,
                                            format: exportData.format,
                                            forceCompressionAt100Quality:
                                                setting.forceCompressionAt100Quality,
                                        }
                                    );
                                const result2 =
                                    await compressImageBufferWithStats(
                                        exportData.scale2,
                                        {
                                            quality: projectData.quality,
                                            format: exportData.format,
                                            forceCompressionAt100Quality:
                                                setting.forceCompressionAt100Quality,
                                        }
                                    );
                                const result3 =
                                    await compressImageBufferWithStats(
                                        exportData.scale3,
                                        {
                                            quality: projectData.quality,
                                            format: exportData.format,
                                            forceCompressionAt100Quality:
                                                setting.forceCompressionAt100Quality,
                                        }
                                    );
                                const result4 =
                                    await compressImageBufferWithStats(
                                        exportData.scale4,
                                        {
                                            quality: projectData.quality,
                                            format: exportData.format,
                                            forceCompressionAt100Quality:
                                                setting.forceCompressionAt100Quality,
                                        }
                                    );
                                scale1 = result1.buffer;
                                scale1_5 = result1_5.buffer;
                                scale2 = result2.buffer;
                                scale3 = result3.buffer;
                                scale4 = result4.buffer;
                                totalOriginalSize +=
                                    result1.originalSize +
                                    result1_5.originalSize +
                                    result2.originalSize +
                                    result3.originalSize +
                                    result4.originalSize;
                                totalCompressedSize +=
                                    result1.compressedSize +
                                    result1_5.compressedSize +
                                    result2.compressedSize +
                                    result3.compressedSize +
                                    result4.compressedSize;
                                let scaleCompressionCount = 0;
                                if (result1.wasCompressed) scaleCompressionCount++;
                                if (result1_5.wasCompressed) scaleCompressionCount++;
                                if (result2.wasCompressed) scaleCompressionCount++;
                                if (result3.wasCompressed) scaleCompressionCount++;
                                if (result4.wasCompressed) scaleCompressionCount++;
                                compressedImagesCount += scaleCompressionCount;
                            } else {
                                scale1 = exportData.scale1;
                                scale1_5 = exportData.scale1_5;
                                scale2 = exportData.scale2;
                                scale3 = exportData.scale3;
                                scale4 = exportData.scale4;
                            }

                            switch (type) {
                                case PluginMessageType.EXPORT_ANDROID: {
                                    zipData[
                                        `drawable-mdpi/${exportName}.${exportData.format}`
                                    ] = scale1;
                                    zipData[
                                        `drawable-hdpi/${exportName}.${exportData.format}`
                                    ] = scale1_5;
                                    zipData[
                                        `drawable-xhdpi/${exportName}.${exportData.format}`
                                    ] = scale2;
                                    zipData[
                                        `drawable-xxhdpi/${exportName}.${exportData.format}`
                                    ] = scale3;
                                    zipData[
                                        `drawable-xxxhdpi/${exportName}.${exportData.format}`
                                    ] = scale4;
                                    break;
                                }
                                case PluginMessageType.EXPORT_FLUTTER: {
                                    zipData[
                                        `${exportName}.${exportData.format}`
                                    ] = scale1;
                                    zipData[
                                        `1.5x/${exportName}.${exportData.format}`
                                    ] = scale1_5;
                                    zipData[
                                        `2.0x/${exportName}.${exportData.format}`
                                    ] = scale2;
                                    zipData[
                                        `3.0x/${exportName}.${exportData.format}`
                                    ] = scale3;
                                    zipData[
                                        `4.0x/${exportName}.${exportData.format}`
                                    ] = scale4;
                                    break;
                                }
                            }
                        })
                    );
                }
                break;
        }

        if (exportDataLength === undefined || firstExportData === undefined) {
            set({ isLoading: false });
            return;
        }

        if (Object.keys(zipData).length === 1) {
            const blob = new Blob([Object.values(zipData)[0]]);

            downloadBlob(
                blob,
                `${firstExportData.name}.${firstExportData.format}`
            );

            const compressionStats: CompressionStats = {
                compressedImagesCount,
                totalOriginalSize,
                totalCompressedSize,
                compressionRatio:
                    totalOriginalSize > 0
                        ? (totalOriginalSize - totalCompressedSize) /
                          totalOriginalSize
                        : 0,
            };

            parent.postMessage(
                {
                    pluginMessage: {
                        type: UiMessageType.SUCCESS_EXPORT,
                        data: { projectData, compressionStats },
                    },
                },
                "*"
            );

            set({ isLoading: false });
        } else {
            zip(zipData, (err, data) => {
                if (err) {
                    return;
                }

                const content = new Blob([data], { type: "application/zip" });

                if (exportDataLength > 1) {
                    downloadBlob(
                        content,
                        `${firstExportData.name}_and_${exportDataLength - 1}_others.zip`
                    );
                } else {
                    downloadBlob(content, `${firstExportData.name}.zip`);
                }

                const compressionStats: CompressionStats = {
                    compressedImagesCount,
                    totalOriginalSize,
                    totalCompressedSize,
                    compressionRatio:
                        totalOriginalSize > 0
                            ? (totalOriginalSize - totalCompressedSize) /
                              totalOriginalSize
                            : 0,
                };

                parent.postMessage(
                    {
                        pluginMessage: {
                            type: UiMessageType.SUCCESS_EXPORT,
                            data: { projectData, compressionStats },
                        },
                    },
                    "*"
                );

                set({ isLoading: false });
            });
        }
    },
    onSaveSetting: (settingScope, setting) => {
        set((state) => ({
            page: Page.EXPORT,
            projectData: {
                ...state.projectData,
                settingScope,
            },
            setting: setting,
            globalSetting:
                settingScope == SettingScope.GLOBAL
                    ? setting
                    : state.globalSetting,
            projectSetting:
                settingScope == SettingScope.GLOBAL
                    ? setting
                    : state.projectSetting,
        }));

        parent.postMessage(
            {
                pluginMessage: {
                    type: UiMessageType.SAVE_SETTING,
                    data: {
                        settingScope,
                        setting,
                    },
                },
            },
            "*"
        );
    },
}));
