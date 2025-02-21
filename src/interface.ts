import { CharacterCase, PluginMessageType, UiMessageType } from './enum'

export interface PluginMessage {
    type: PluginMessageType,
    data: any,
}

export interface UiMessage {
    type: UiMessageType,
    data: any,
}

export interface Preview {
    id: string,
    name: string,
    buffer: Uint8Array
}

export interface PreviewUi {
    id: string,
    name: string,
    base64: string,
}

export interface Setting {
    format: string,
    platform: string | null,
    prefix: string,
    suffix: string,
}

export interface ReplaceData {
    id: number,
    original: string,
    replacement: string
}

export interface GlobalSetting {
    previewNameCharacterCase: string,
    previewNameReplaceDatas: ReplaceData[],
    exportNameReplaceDatas: ReplaceData[],
}

export const initGlobalSetting: GlobalSetting = {
    previewNameCharacterCase: CharacterCase.LOWER_CASE,
    previewNameReplaceDatas: [
        {
            id: 1,
            original: " ",
            replacement: "",
        }
    ],
    exportNameReplaceDatas: [
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
}

export interface ExportOption {
    preview: PreviewUi[],
    format: string,
    platform: string | null,
    prefix: string,
    suffix: string,
}

export interface Export {
    name: string,
    format: string,
}

export interface ExportDefault extends Export {
    buffer: Uint8Array
}


export interface ExportScale3 extends Export {
    scale1: Uint8Array,
    scale2: Uint8Array,
    scale3: Uint8Array,
}

export interface ExportScale5 extends Export {
    scale1: Uint8Array,
    scale1_5: Uint8Array,
    scale2: Uint8Array,
    scale3: Uint8Array,
    scale4: Uint8Array,
}

export interface Size {
    h: number,
    w: number
}

export const initSize: Size = {
    w: 560,
    h: 320,
}