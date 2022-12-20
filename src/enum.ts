export enum PluginMessageType {
    PREVIEW = "PREVIEW",
    SETTING = "SETTING",
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
    EXPORT = "EXPORT",
    ERROR = "ERROR",
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

export enum PageType {
    LOADING,
    EXPORT,
}
