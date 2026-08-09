import { create } from "zustand";

import type { Platform } from "@common/enum";
import {
    Format,
    Language,
    Page,
    PluginMessageType,
    SettingScope,
    UiMessageType,
    Theme,
} from "@common/enum";
import { t } from "@common/i18n";
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
import { array, boolean, object, validate } from "superstruct";
import { compressImageBufferWithStats } from "./lib/image-compression";
import {
    convertBuffersToWebPWithConsistentGrid,
    buildPartName,
} from "./lib/webp-split";
import { downloadBlob } from "./lib/utils";
import { zip } from "fflate";

type AppStore = {
    isDev: boolean;
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
    onChangeScale: React.ChangeEventHandler<HTMLInputElement>;
    onBlurScale: React.FocusEventHandler<HTMLInputElement>;
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
    isDev: false,
    isLoading: false,
    page: Page.LOADING,
    onGoSettingsPage: () => set({ page: Page.SETTINGS }),
    onGoExportPage: () => set({ page: Page.EXPORT }),
    currentTheme: Theme.SYSTEM,
    isDarkMode: false,
    initializeTheme: () => {
        get().applyTheme(get().setting.theme);
    },
    applyTheme: (theme: Theme) => {
        const systemDarkMode = window.matchMedia(
            "(prefers-color-scheme: dark)"
        ).matches;

        const shouldBeDark =
            theme === Theme.DARK
                ? true
                : theme === Theme.LIGHT
                  ? false
                  : systemDarkMode;

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
                isDev: boolean(),
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

        const { isDev, previews, globalSetting, projectSetting, projectData } =
            result;

        const setting =
            projectData.settingScope === SettingScope.GLOBAL
                ? globalSetting
                : projectSetting;

        set({
            isDev,
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
        const parsed = parseInt(event.target.value);
        const quality = Math.max(
            1,
            Math.min(100, isNaN(parsed) ? 100 : parsed)
        );
        set((state) => ({
            projectData: {
                ...state.projectData,
                quality,
            },
        }));
    },
    onChangeScale: (event) => {
        const value = event.target.value;

        if (value === "" || value === "." || value === "0.") {
            set((state) => ({
                projectData: {
                    ...state.projectData,
                    scale: value as any,
                },
            }));
            return;
        }

        const parsed = parseFloat(value);
        if (!isNaN(parsed)) {
            set((state) => ({
                projectData: {
                    ...state.projectData,
                    scale: parsed,
                },
            }));
        }
    },
    onBlurScale: (_event) => {
        const { projectData } = get();
        const currentScale = projectData.scale;

        if (
            typeof currentScale !== "number" ||
            isNaN(currentScale) ||
            currentScale <= 0
        ) {
            set((state) => ({
                projectData: {
                    ...state.projectData,
                    scale: 1,
                },
            }));
            return;
        }

        const clampedScale = Math.max(0.5, Math.min(4, currentScale));
        if (clampedScale !== currentScale) {
            set((state) => ({
                projectData: {
                    ...state.projectData,
                    scale: clampedScale,
                },
            }));
        }
    },
    _sanitizeExportName: (setting, name) => {
        let tmpExportName = name;

        setting.exportNameCleanupRules.forEach((data) => {
            try {
                tmpExportName = tmpExportName.replace(
                    new RegExp(data.original, "g"),
                    data.replacement
                );
            } catch {
                // Invalid regex (e.g. a literal "(" or "["): skip this rule
            }
        });

        return tmpExportName;
    },
    onExport: () => {
        const { previews, projectData } = get();

        const previewNames = previews.map((preview) => preview.name);

        const language = get().setting.language ?? Language.EN;

        if (previews.length === 0) {
            parent.postMessage(
                {
                    pluginMessage: {
                        type: UiMessageType.ERROR,
                        data: t("errorSelectLayer", language),
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
                        data: t("errorEnterFileNames", language),
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
                        data: t("errorDuplicateFileNames", language),
                    },
                },
                "*"
            );

            return;
        }

        let normalizedScale = projectData.scale;
        if (
            typeof normalizedScale !== "number" ||
            isNaN(normalizedScale) ||
            normalizedScale <= 0
        ) {
            normalizedScale = 1;
        } else {
            normalizedScale = Math.max(0.5, Math.min(4, normalizedScale));
        }

        const normalizedProjectData = {
            ...projectData,
            scale: normalizedScale,
        };

        set({ isLoading: true });

        parent.postMessage(
            {
                pluginMessage: {
                    type: UiMessageType.REQUEST_EXPORT,
                    data: {
                        previews: previews,
                        projectData: normalizedProjectData,
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

        const notifyExportFailed = () => {
            set({ isLoading: false });
            parent.postMessage(
                {
                    pluginMessage: {
                        type: UiMessageType.ERROR,
                        data: t(
                            "errorExportFailed",
                            setting.language ?? Language.EN
                        ),
                    },
                },
                "*"
            );
        };

        try {
            const zipData: Record<string, Uint8Array> = {};

            let totalOriginalSize = 0;
            let totalCompressedSize = 0;
            let compressedImagesCount = 0;

            const compressAndTrack = async (
                buffer: Uint8Array,
                format: Format
            ): Promise<Uint8Array> => {
                const result = await compressImageBufferWithStats(buffer, {
                    quality: projectData.quality,
                    format,
                    forceCompressionAt100Quality:
                        setting.forceCompressionAt100Quality,
                });

                totalOriginalSize += result.originalSize;
                totalCompressedSize += result.compressedSize;
                if (result.wasCompressed) {
                    compressedImagesCount++;
                }

                return result.buffer;
            };

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
                            const exportName = sanitizeExportName(
                                exportData.name
                            );

                            let u8: Uint8Array;

                            if (exportData.format === Format.WEBP) {
                                const { results } =
                                    await convertBuffersToWebPWithConsistentGrid(
                                        [exportData.buffer],
                                        projectData.quality
                                    );
                                const { parts, originalSize, convertedSize } =
                                    results[0];

                                totalOriginalSize += originalSize;
                                totalCompressedSize += convertedSize;
                                if (convertedSize < originalSize) {
                                    compressedImagesCount++;
                                }

                                parts.forEach((part, index) => {
                                    const partName = buildPartName(
                                        exportName,
                                        index,
                                        parts.length
                                    );
                                    zipData[
                                        `${partName}.${exportData.format}`
                                    ] = part;
                                });

                                return;
                            } else if (
                                exportData.format === Format.JPG ||
                                exportData.format === Format.PNG
                            ) {
                                u8 = await compressAndTrack(
                                    exportData.buffer,
                                    exportData.format
                                );
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
                            const exportName = sanitizeExportName(
                                exportData.name
                            );

                            let scale1: Uint8Array,
                                scale2: Uint8Array,
                                scale3: Uint8Array;

                            if (exportData.format === Format.WEBP) {
                                const { results } =
                                    await convertBuffersToWebPWithConsistentGrid(
                                        [
                                            exportData.scale1,
                                            exportData.scale2,
                                            exportData.scale3,
                                        ],
                                        projectData.quality
                                    );

                                results.forEach((result) => {
                                    totalOriginalSize += result.originalSize;
                                    totalCompressedSize += result.convertedSize;
                                    if (
                                        result.convertedSize <
                                        result.originalSize
                                    ) {
                                        compressedImagesCount++;
                                    }
                                });

                                const totalParts = results[0].parts.length;

                                results[0].parts.forEach((part, index) => {
                                    const partName = buildPartName(
                                        exportName,
                                        index,
                                        totalParts
                                    );
                                    zipData[
                                        `${partName}.${exportData.format}`
                                    ] = part;
                                });
                                results[1].parts.forEach((part, index) => {
                                    const partName = buildPartName(
                                        `${exportName}@2x`,
                                        index,
                                        totalParts
                                    );
                                    zipData[
                                        `${partName}.${exportData.format}`
                                    ] = part;
                                });
                                results[2].parts.forEach((part, index) => {
                                    const partName = buildPartName(
                                        `${exportName}@3x`,
                                        index,
                                        totalParts
                                    );
                                    zipData[
                                        `${partName}.${exportData.format}`
                                    ] = part;
                                });

                                return;
                            } else if (
                                exportData.format === Format.JPG ||
                                exportData.format === Format.PNG
                            ) {
                                scale1 = await compressAndTrack(
                                    exportData.scale1,
                                    exportData.format
                                );
                                scale2 = await compressAndTrack(
                                    exportData.scale2,
                                    exportData.format
                                );
                                scale3 = await compressAndTrack(
                                    exportData.scale3,
                                    exportData.format
                                );
                            } else {
                                scale1 = exportData.scale1;
                                scale2 = exportData.scale2;
                                scale3 = exportData.scale3;
                            }

                            zipData[`${exportName}.${exportData.format}`] =
                                scale1;
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
                                    const { results } =
                                        await convertBuffersToWebPWithConsistentGrid(
                                            [
                                                exportData.scale1,
                                                exportData.scale1_5,
                                                exportData.scale2,
                                                exportData.scale3,
                                                exportData.scale4,
                                            ],
                                            projectData.quality
                                        );

                                    results.forEach((result) => {
                                        totalOriginalSize +=
                                            result.originalSize;
                                        totalCompressedSize +=
                                            result.convertedSize;
                                        if (
                                            result.convertedSize <
                                            result.originalSize
                                        ) {
                                            compressedImagesCount++;
                                        }
                                    });

                                    const totalParts = results[0].parts.length;

                                    const addPartsToZip = (
                                        baseName: string,
                                        parts: Uint8Array[]
                                    ) => {
                                        parts.forEach((part, index) => {
                                            const partName = buildPartName(
                                                baseName,
                                                index,
                                                totalParts
                                            );
                                            zipData[
                                                `${partName}.${exportData.format}`
                                            ] = part;
                                        });
                                    };

                                    switch (type) {
                                        case PluginMessageType.EXPORT_ANDROID: {
                                            addPartsToZip(
                                                `drawable-mdpi/${exportName}`,
                                                results[0].parts
                                            );
                                            addPartsToZip(
                                                `drawable-hdpi/${exportName}`,
                                                results[1].parts
                                            );
                                            addPartsToZip(
                                                `drawable-xhdpi/${exportName}`,
                                                results[2].parts
                                            );
                                            addPartsToZip(
                                                `drawable-xxhdpi/${exportName}`,
                                                results[3].parts
                                            );
                                            addPartsToZip(
                                                `drawable-xxxhdpi/${exportName}`,
                                                results[4].parts
                                            );
                                            break;
                                        }
                                        case PluginMessageType.EXPORT_FLUTTER: {
                                            addPartsToZip(
                                                `${exportName}`,
                                                results[0].parts
                                            );
                                            addPartsToZip(
                                                `1.5x/${exportName}`,
                                                results[1].parts
                                            );
                                            addPartsToZip(
                                                `2.0x/${exportName}`,
                                                results[2].parts
                                            );
                                            addPartsToZip(
                                                `3.0x/${exportName}`,
                                                results[3].parts
                                            );
                                            addPartsToZip(
                                                `4.0x/${exportName}`,
                                                results[4].parts
                                            );
                                            break;
                                        }
                                    }

                                    return;
                                } else if (
                                    exportData.format === Format.JPG ||
                                    exportData.format === Format.PNG
                                ) {
                                    scale1 = await compressAndTrack(
                                        exportData.scale1,
                                        exportData.format
                                    );
                                    scale1_5 = await compressAndTrack(
                                        exportData.scale1_5,
                                        exportData.format
                                    );
                                    scale2 = await compressAndTrack(
                                        exportData.scale2,
                                        exportData.format
                                    );
                                    scale3 = await compressAndTrack(
                                        exportData.scale3,
                                        exportData.format
                                    );
                                    scale4 = await compressAndTrack(
                                        exportData.scale4,
                                        exportData.format
                                    );
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

            if (
                exportDataLength === undefined ||
                firstExportData === undefined
            ) {
                set({ isLoading: false });
                return;
            }

            if (Object.keys(zipData).length === 1) {
                const blob = new Blob([
                    Object.values(zipData)[0] as Uint8Array<ArrayBuffer>,
                ]);

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
                        notifyExportFailed();
                        return;
                    }

                    const content = new Blob(
                        [data as Uint8Array<ArrayBuffer>],
                        {
                            type: "application/zip",
                        }
                    );

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
        } catch (error) {
            console.error("Export failed:", error);
            notifyExportFailed();
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
