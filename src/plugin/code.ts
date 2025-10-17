import { enums, object, string, validate } from "superstruct";

import {
    NameCase,
    Format,
    Platform,
    PluginMessageType,
    UiMessageType,
    SettingScope,
    Theme,
} from "@common/enum.js";
import type {
    UiMessage,
    Preview,
    ExportDefault,
    ExportScale3,
    ExportScale5,
    Setting,
    ProjectData,
} from "@common/interface.js";
import {
    initSize,
    initSetting,
    SizeSchema,
    ProjectDataSchema,
    initProjectData,
    SettingSchema,
    ExportOptionSchema,
} from "@common/interface.js";
import { getData, ProjectKey, GlobalKey, setData } from "./data.js";

const SVGSetting: ExportSettings = {
    format: "SVG",
};

const PDFSetting: ExportSettings = {
    format: "PDF",
};

const getExportSetting = (
    format: "PNG" | "JPG",
    scale: number = 1
): ExportSettings => {
    return {
        format: format,
        constraint: {
            type: "SCALE",
            value: scale,
        },
    };
};

const sleep = (ms: number) => {
    return new Promise((r) => setTimeout(r, ms));
};

class ApiQueue {
    private queue: Array<() => Promise<any>> = [];
    private processing = false;
    private maxConcurrency = 3;
    private activePromises = 0;
    private minDelay = 30;

    async add<T>(fn: () => Promise<T>): Promise<T> {
        return new Promise((resolve, reject) => {
            this.queue.push(async () => {
                try {
                    const result = await fn();
                    resolve(result);
                } catch (error) {
                    reject(error);
                }
            });
            this.process();
        });
    }

    private async process() {
        if (this.processing || this.activePromises >= this.maxConcurrency) {
            return;
        }

        this.processing = true;

        while (
            this.queue.length > 0 &&
            this.activePromises < this.maxConcurrency
        ) {
            const task = this.queue.shift();
            if (task) {
                this.activePromises++;
                task().finally(() => {
                    this.activePromises--;
                    setTimeout(() => this.process(), this.minDelay);
                });
            }
        }

        this.processing = false;
    }
}

const apiQueue = new ApiQueue();

const exportAsync = async (
    node: SceneNode,
    setting: ExportSettings
): Promise<Uint8Array> => {
    return apiQueue.add(() => node.exportAsync(setting));
};

interface TmpExport {
    name: string;
    node: SceneNode;
}

let projectData: ProjectData | undefined = undefined;
let setting: Setting | undefined = undefined;

const getPreview = async (
    setting: Setting,
    node: SceneNode
): Promise<Preview> => {
    let name = node.name;

    switch (setting.previewNameCase) {
        case NameCase.LOWER_CASE:
            name = name.toLowerCase();
            break;
        case NameCase.UPPER_CASE:
            name = name.toUpperCase();
            break;
    }

    setting.previewNameCleanupRules.forEach((data) => {
        name = name.replace(new RegExp(data.original, "g"), data.replacement);
    });

    return {
        id: node.id,
        name: name,
        buffer: await apiQueue.add(() => node.exportAsync()),
    };
};

const isDev = figma.editorType === "dev";

if (isDev) {
    figma.showUI(__html__, { themeColors: true });
} else {
    getData(GlobalKey.SIZE).then((data) => {
        const [_, result] = validate(data, SizeSchema);
        const finalResult = result || initSize;

        if (result === undefined) {
            setData(GlobalKey.SIZE, finalResult);
        }

        figma.showUI(__html__, {
            themeColors: true,
            width: finalResult.w,
            height: finalResult.h,
        });
    });
}

let selectionChangeTimeout: number | null = null;

figma.on("selectionchange", async () => {
    if (selectionChangeTimeout) {
        clearTimeout(selectionChangeTimeout);
    }

    selectionChangeTimeout = setTimeout(async () => {
        let notUndefinedSetting = setting;

        while (notUndefinedSetting === undefined) {
            await sleep(10);
            notUndefinedSetting = setting;
        }

        if (!notUndefinedSetting.reloadPreviewOnSelectionChange) {
            return;
        }

        if (figma.currentPage.selection.length > 0) {
            const batchSize = 5;
            const selection = figma.currentPage.selection;
            const allPreviews: Preview[] = [];

            for (let i = 0; i < selection.length; i += batchSize) {
                const batch = selection.slice(i, i + batchSize);
                const batchPreviews = await Promise.all(
                    batch.map((node) => getPreview(notUndefinedSetting, node))
                );
                allPreviews.push(...batchPreviews);
            }

            figma.ui.postMessage({
                type: PluginMessageType.PREVIEWS,
                data: allPreviews,
            });
        }
    }, 100);
});

Promise.all([
    getData(ProjectKey.DATA),
    getData(ProjectKey.SETTING),
    getData(GlobalKey.SETTING),
]).then(async ([data1, data2, data3]) => {
    if (data1 && typeof data1 === "object" && !("scale" in data1)) {
        data1 = { ...data1, scale: 1 };
    }

    if (data2 && typeof data2 === "object" && !("theme" in data2)) {
        data2 = { ...data2, theme: Theme.SYSTEM };
    }
    if (data3 && typeof data3 === "object" && !("theme" in data3)) {
        data3 = { ...data3, theme: Theme.SYSTEM };
    }

    const [_e1, result1] = validate(data1, ProjectDataSchema);
    const [_e2, result2] = validate(data2, SettingSchema);
    const [_e3, result3] = validate(data3, SettingSchema);

    projectData = result1 || initProjectData;
    const globalSetting =
        result3 ||
        (isDev
            ? {
                  ...initSetting,
                  perRow: 2,
                  autoCloseAfterExport: false,
                  reloadPreviewOnSelectionChange: true,
              }
            : initSetting);

    const projectSetting = result2 || globalSetting;

    const currentSetting =
        projectData.settingScope === SettingScope.PROJECT
            ? projectSetting
            : globalSetting;

    setting = currentSetting;

    const selection = figma.currentPage.selection;
    const previews: Preview[] = [];
    const batchSize = 5;

    for (let i = 0; i < selection.length; i += batchSize) {
        const batch = selection.slice(i, i + batchSize);
        const batchPreviews = await Promise.all(
            batch.map((node) => getPreview(currentSetting, node))
        );
        previews.push(...batchPreviews);
    }

    figma.ui.postMessage({
        type: PluginMessageType.INIT,
        data: {
            isDev,
            previews,
            projectData,
            projectSetting,
            globalSetting,
        },
    });
});

figma.ui.onmessage = async (msg: UiMessage) => {
    const { type, data } = msg;

    switch (type) {
        case UiMessageType.RESIZE: {
            const [_, result] = validate(data, SizeSchema);

            if (result === undefined) {
                return;
            }

            setData(GlobalKey.SIZE, data);
            figma.ui.resize(data.w, data.h);
            break;
        }
        case UiMessageType.ERROR: {
            const [_, result] = validate(data, string());

            if (result === undefined) {
                return;
            }

            figma.notify("Figma Exporter : " + result, {
                error: true,
            });
            break;
        }
        case UiMessageType.SUCCESS_EXPORT: {
            const exportData = data as {
                projectData: any;
                compressionStats?: any;
            };
            const [_, result] = validate(
                exportData.projectData,
                ProjectDataSchema
            );

            if (result === undefined) {
                return;
            }

            setData(ProjectKey.DATA, exportData.projectData);
            projectData = exportData.projectData;

            const currentSetting = setting || initSetting;

            let successMessage = "Figma Exporter : Success Export";

            if (
                exportData.compressionStats &&
                exportData.compressionStats.compressedImagesCount > 0
            ) {
                const stats = exportData.compressionStats;
                const compressionPercentage = Math.round(
                    stats.compressionRatio * 100
                );
                const formatBytes = (bytes: number): string => {
                    if (bytes === 0) return "0 B";
                    const k = 1024;
                    const sizes = ["B", "KB", "MB", "GB"];
                    const i = Math.floor(Math.log(bytes) / Math.log(k));
                    return (
                        parseFloat((bytes / Math.pow(k, i)).toFixed(1)) +
                        " " +
                        sizes[i]
                    );
                };

                const savedBytes =
                    stats.totalOriginalSize - stats.totalCompressedSize;
                successMessage += ` | Compressed ${stats.compressedImagesCount} image(s), saved ${formatBytes(savedBytes)} (${compressionPercentage}%)`;
            }

            if (currentSetting.autoCloseAfterExport) {
                figma.closePlugin(successMessage);
            } else {
                figma.notify(successMessage);
            }
            break;
        }
        case UiMessageType.SAVE_SETTING: {
            const [_, result] = validate(
                data,
                object({
                    settingScope: enums(Object.values(SettingScope)),
                    setting: SettingSchema,
                })
            );

            if (result === undefined) {
                return;
            }

            const newProjectData: ProjectData = {
                ...(projectData || initProjectData),
                settingScope: result.settingScope,
            };

            setData(ProjectKey.DATA, newProjectData);
            projectData = newProjectData;

            setData(
                result.settingScope == SettingScope.GLOBAL
                    ? GlobalKey.SETTING
                    : ProjectKey.SETTING,
                result.setting
            );
            setting = result.setting;
            break;
        }
        case UiMessageType.REQUEST_EXPORT: {
            const [_, result] = validate(data, ExportOptionSchema);

            if (result === undefined) {
                return;
            }

            const { previews, projectData } = result;
            const { format, platform, prefix, suffix, quality, scale } =
                projectData;

            const tmps: TmpExport[] = [];

            previews.forEach((preview) => {
                const node = figma.currentPage.findOne(
                    (node) => node.id === preview.id
                );

                if (node != null) {
                    const tmpNames = preview.name.split("/");

                    tmpNames[tmpNames.length - 1] =
                        prefix + tmpNames[tmpNames.length - 1] + suffix;

                    const tmpName = tmpNames.join("/");

                    tmps.push({
                        name: tmpName,
                        node: node,
                    });
                }
            });

            switch (format) {
                case Format.SVG:
                case Format.PDF: {
                    const isSVG = format === Format.SVG;
                    const exports: ExportDefault[] = [];
                    for (const tmp of tmps) {
                        const exportData = {
                            name: tmp.name,
                            format: format,
                            quality,
                            buffer: await exportAsync(
                                tmp.node,
                                isSVG ? SVGSetting : PDFSetting
                            ),
                        };
                        exports.push(exportData);
                    }
                    figma.ui.postMessage({
                        type: isSVG
                            ? PluginMessageType.EXPORT_SVG
                            : PluginMessageType.EXPORT_PDF,
                        data: exports,
                    });
                    break;
                }
                default: {
                    const isJPG = format === Format.JPG;
                    const _format = isJPG ? "JPG" : "PNG";

                    switch (platform) {
                        case Platform.WEB: {
                            const exports: ExportDefault[] = [];
                            for (const tmp of tmps) {
                                const exportData = {
                                    name: tmp.name,
                                    format,
                                    quality,
                                    buffer: await exportAsync(
                                        tmp.node,
                                        getExportSetting(_format, scale)
                                    ),
                                };
                                exports.push(exportData);
                            }
                            figma.ui.postMessage({
                                type: PluginMessageType.EXPORT_WEB,
                                data: exports,
                            });
                            break;
                        }
                        case Platform.ANDROID:
                        case Platform.FLUTTER: {
                            const exports: ExportScale5[] = [];
                            for (const tmp of tmps) {
                                const exportData = {
                                    name: tmp.name,
                                    format,
                                    quality,
                                    scale1: await exportAsync(
                                        tmp.node,
                                        getExportSetting(_format, 1)
                                    ),
                                    scale1_5: await exportAsync(
                                        tmp.node,
                                        getExportSetting(_format, 1.5)
                                    ),
                                    scale2: await exportAsync(
                                        tmp.node,
                                        getExportSetting(_format, 2)
                                    ),
                                    scale3: await exportAsync(
                                        tmp.node,
                                        getExportSetting(_format, 3)
                                    ),
                                    scale4: await exportAsync(
                                        tmp.node,
                                        getExportSetting(_format, 4)
                                    ),
                                };
                                exports.push(exportData);
                            }

                            switch (platform) {
                                case Platform.ANDROID: {
                                    figma.ui.postMessage({
                                        type: PluginMessageType.EXPORT_ANDROID,
                                        data: exports,
                                    });
                                    break;
                                }
                                case Platform.FLUTTER: {
                                    figma.ui.postMessage({
                                        type: PluginMessageType.EXPORT_FLUTTER,
                                        data: exports,
                                    });
                                    break;
                                }
                            }
                            break;
                        }
                        case Platform.iOS:
                        case Platform.RN: {
                            const exports: ExportScale3[] = [];
                            for (const tmp of tmps) {
                                const exportData = {
                                    name: tmp.name,
                                    format,
                                    quality,
                                    scale1: await exportAsync(
                                        tmp.node,
                                        getExportSetting(_format, 1)
                                    ),
                                    scale2: await exportAsync(
                                        tmp.node,
                                        getExportSetting(_format, 2)
                                    ),
                                    scale3: await exportAsync(
                                        tmp.node,
                                        getExportSetting(_format, 3)
                                    ),
                                };
                                exports.push(exportData);
                            }

                            switch (platform) {
                                case Platform.iOS: {
                                    figma.ui.postMessage({
                                        type: PluginMessageType.EXPORT_iOS,
                                        data: exports,
                                    });
                                    break;
                                }
                                case Platform.RN: {
                                    figma.ui.postMessage({
                                        type: PluginMessageType.EXPORT_RN,
                                        data: exports,
                                    });
                                    break;
                                }
                            }
                        }
                    }
                }
            }
        }
    }
};
