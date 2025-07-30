import {
    object,
    number,
    string,
    boolean,
    array,
    enums,
    define,
    type Infer,
} from "superstruct";

const Uint8ArrayStruct = define<Uint8Array>("Uint8Array", (value) => {
    if (!(value instanceof Uint8Array)) {
        return "Expected a Uint8Array";
    }
    return true;
});

import type { PluginMessageType, UiMessageType } from "./enum.js";
import { NameCase, Format, Platform, ViewMode, SettingScope } from "./enum.js";

export interface PluginMessage {
    type: PluginMessageType;
    data: any;
}

export interface UiMessage {
    type: UiMessageType;
    data: any;
}

export const PreviewSchema = object({
    id: string(),
    name: string(),
    buffer: Uint8ArrayStruct,
});

export type Preview = Infer<typeof PreviewSchema>;

export const PreviewUiSchema = object({
    id: string(),
    name: string(),
    base64: string(),
});

export type PreviewUi = Infer<typeof PreviewUiSchema>;

export const ProjectDataSchema = object({
    settingScope: enums(Object.values(SettingScope)),
    format: enums(Object.values(Format)),
    platform: enums(Object.values(Platform)),
    prefix: string(),
    suffix: string(),
    quality: number(),
});

export type ProjectData = Infer<typeof ProjectDataSchema>;

export interface CompressionStats {
    compressedImagesCount: number;
    totalOriginalSize: number;
    totalCompressedSize: number;
    compressionRatio: number; // 0-1
}

export const initProjectData: ProjectData = {
    settingScope: SettingScope.GLOBAL,
    format: Format.PNG,
    platform: Platform.WEB,
    prefix: "",
    suffix: "",
    quality: 100,
};

export const CleanupRuleSchema = object({
    id: number(),
    original: string(),
    replacement: string(),
});

export type CleanupRule = Infer<typeof CleanupRuleSchema>;

export const SettingSchema = object({
    viewMode: enums(Object.values(ViewMode)),
    perRow: number(),
    autoCloseAfterExport: boolean(),
    reloadPreviewOnSelectionChange: boolean(),
    previewNameCase: enums(Object.values(NameCase)),
    previewNameCleanupRules: array(CleanupRuleSchema),
    exportNameCleanupRules: array(CleanupRuleSchema),
    forceCompressionAt100Quality: boolean(),
});

export type Setting = Infer<typeof SettingSchema>;

export const initSetting: Setting = {
    viewMode: ViewMode.GRID,
    perRow: 5,
    autoCloseAfterExport: true,
    reloadPreviewOnSelectionChange: false,
    previewNameCase: NameCase.LOWER_CASE,
    previewNameCleanupRules: [
        {
            id: 1,
            original: " ",
            replacement: "",
        },
    ],
    exportNameCleanupRules: [
        {
            id: 1,
            original: " ",
            replacement: "",
        },
        {
            id: 2,
            original: "-",
            replacement: "",
        },
        {
            id: 3,
            original: "=",
            replacement: "",
        },
        {
            id: 4,
            original: ",",
            replacement: "",
        },
        {
            id: 5,
            original: "/",
            replacement: "",
        },
    ],
    forceCompressionAt100Quality: false,
};

export const ExportOptionSchema = object({
    previews: array(PreviewUiSchema),
    projectData: ProjectDataSchema,
});

export type ExportOption = Infer<typeof ExportOptionSchema>;

export const ExportSchema = object({
    name: string(),
    format: enums(Object.values(Format)),
    quality: number(),
});

export type Export = Infer<typeof ExportSchema>;

export const ExportDefaultSchema = object({
    ...ExportSchema.schema,
    buffer: Uint8ArrayStruct,
});

export type ExportDefault = Infer<typeof ExportDefaultSchema>;

export const ExportScale3Schema = object({
    ...ExportSchema.schema,
    scale1: Uint8ArrayStruct,
    scale2: Uint8ArrayStruct,
    scale3: Uint8ArrayStruct,
});

export type ExportScale3 = Infer<typeof ExportScale3Schema>;

export const ExportScale5Schema = object({
    ...ExportSchema.schema,
    scale1: Uint8ArrayStruct,
    scale1_5: Uint8ArrayStruct,
    scale2: Uint8ArrayStruct,
    scale3: Uint8ArrayStruct,
    scale4: Uint8ArrayStruct,
});

export type ExportScale5 = Infer<typeof ExportScale5Schema>;

export const SizeSchema = object({
    h: number(),
    w: number(),
});

export type Size = Infer<typeof SizeSchema>;

export const initSize: Size = {
    w: 560,
    h: 320,
};
