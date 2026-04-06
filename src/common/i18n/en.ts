const _en = {
    // ExportPage
    format: "Format",
    platform: "Platform",
    tooltipQuality: "Set compression quality (1-100%)",
    tooltipScale: "Set export scale (0.5-4x)",
    tooltipPrefix: "Add a prefix to all exported file names",
    tooltipSuffix: "Add a suffix to all exported file names",
    prefix: "Prefix",
    suffix: "Suffix",
    settings: "Settings",
    exporting: "Exporting...",
    export: "Export",

    // SettingsPage
    settingsTitle: "Settings",
    configuringGlobal: "Configuring global settings for all projects",
    configuringProject: "Configuring settings for this project only",
    appearance: "Appearance",
    light: "Light",
    dark: "Dark",
    system: "System",
    language: "Language",
    layoutSettings: "Layout Settings",
    gridView: "Grid View",
    listView: "List View",
    itemsPerRow: "Items per row:",
    actions: "Actions",
    autoCloseAfterExport: "Auto-close after export",
    reloadPreviewOnSelectionChange: "Reload preview on selection change",
    forceCompressionAt100Quality: "Force compression at 100% quality",
    previewNameCase: "Preview Name Case",
    original: "Original",
    lowercase: "Lowercase",
    uppercase: "Uppercase",
    previewNameCleanupRules: "Preview Name Cleanup Rules",
    exportNameCleanupRules: "Export Name Cleanup Rules",
    addRule: "Add Rule",
    find: "Find",
    replaceWith: "Replace with",
    supportUs: "Support Us",
    cancel: "Cancel",
    save: "Save",
    project: "Project",
    global: "Global",

    // UI error messages
    errorSelectLayer: "Please select a layer",
    errorEnterFileNames: "Please enter image file names",
    errorDuplicateFileNames: "Duplicate image file names found",

    // Plugin notify messages
    notifySuccess: "Figma Exporter : Success Export",
    notifyCompressed: "Compressed {count} image(s), saved {saved} ({pct}%)",
} as const;

export type TranslationKey = keyof typeof _en;
export type TranslationDict = Record<TranslationKey, string>;

export const en: TranslationDict = _en;
