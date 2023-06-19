import { PluginMessageType, UiMessageType } from './enum'

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