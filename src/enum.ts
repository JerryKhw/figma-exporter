export enum PluginMessageType {
    PREVIEW = "PREVIEW",
    SETTING = "SETTING",
    GLOBAL_SETTING = "GLOBAL_SETTING",
    EXPORT_WEB = "EXPORT_WEB",
    EXPORT_ANDROID = "EXPORT_ANDROID",
    EXPORT_iOS = "EXPORT_iOS",
    EXPORT_RN = "EXPORT_RN",
    EXPORT_FLUTTER = "EXPORT_FLUTTER",
    EXPORT_SVG = "EXPORT_SVG",
    EXPORT_PDF = "EXPORT_PDF",
}

export enum UiMessageType {
    SETTING = "SETTING",
    GLOBAL_SETTING = "GLOBAL_SETTING",
    EXPORT = "EXPORT",
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
    SVG = "svg",
    PDF = "pdf",
    WEBP = "webp",
}

export enum CharacterCase {
    DEFAULT = "default",
    LOWER_CASE = "lowerCase",
    UPPER_CASE = "upperCase",
}

export enum PageType {
    LOADING,
    EXPORT,
}
