export enum PluginMessageType {
    PREVIEWS = "PREVIEWS",
    INIT = "INIT",
    EXPORT_WEB = "EXPORT_WEB",
    EXPORT_ANDROID = "EXPORT_ANDROID",
    EXPORT_iOS = "EXPORT_iOS",
    EXPORT_RN = "EXPORT_RN",
    EXPORT_FLUTTER = "EXPORT_FLUTTER",
    EXPORT_SVG = "EXPORT_SVG",
    EXPORT_PDF = "EXPORT_PDF",
}

export enum UiMessageType {
    REQUEST_EXPORT = "REQUEST_EXPORT",
    SUCCESS_EXPORT = "SUCCESS_EXPORT",
    SAVE_SETTING = "SAVE_SETTING",
    ERROR = "ERROR",
    RESIZE = "RESIZE",
}

export enum Platform {
    WEB = "web",
    ANDROID = "android",
    iOS = "ios",
    RN = "rn",
    FLUTTER = "flutter",
}

export enum Format {
    PNG = "png",
    JPG = "jpg",
    WEBP = "webp",
    SVG = "svg",
    PDF = "pdf",
}

export enum NameCase {
    ORIGINAL = "original",
    LOWER_CASE = "lowerCase",
    UPPER_CASE = "upperCase",
}

export enum Page {
    LOADING,
    EXPORT,
    SETTINGS,
}

export enum ViewMode {
    GRID = "grid",
    LIST = "list",
}

export enum SettingScope {
    PROJECT = "project",
    GLOBAL = "global",
}
