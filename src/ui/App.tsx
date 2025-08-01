import React, { useLayoutEffect } from "react";

import { Page, PluginMessageType } from "@common/enum";
import {
    ExportDefaultSchema,
    ExportScale3Schema,
    ExportScale5Schema,
} from "@common/interface";

import { ExportPage, LoadingPage, SettingsPage } from "./page/index";
import { useAppStore } from "./app-store";

const App = () => {
    const { page, setInit, setPreviews, saveExport, initializeTheme } =
        useAppStore();

    useLayoutEffect(() => {
        const media = window.matchMedia("(prefers-color-scheme: dark)");
        const handler = () => {
            initializeTheme();
        };

        media.addEventListener("change", handler);
        return () => media.removeEventListener("change", handler);
    }, [initializeTheme]);

    useLayoutEffect(() => {
        window.onmessage = async (event) => {
            if (event.data.pluginMessage) {
                const { type, data } = event.data.pluginMessage;

                switch (type) {
                    case PluginMessageType.INIT: {
                        setInit(data);
                        break;
                    }
                    case PluginMessageType.PREVIEWS: {
                        setPreviews(data);
                        break;
                    }
                    case PluginMessageType.EXPORT_SVG:
                    case PluginMessageType.EXPORT_PDF:
                    case PluginMessageType.EXPORT_WEB:
                        saveExport(type, data, ExportDefaultSchema);
                        break;
                    case PluginMessageType.EXPORT_ANDROID:
                    case PluginMessageType.EXPORT_FLUTTER:
                        saveExport(type, data, ExportScale5Schema);
                        break;
                    case PluginMessageType.EXPORT_iOS:
                    case PluginMessageType.EXPORT_RN:
                        saveExport(type, data, ExportScale3Schema);
                        break;
                }
            }
        };
    }, []);

    switch (page) {
        case Page.LOADING:
            return <LoadingPage />;
        case Page.EXPORT:
            return <ExportPage />;
        case Page.SETTINGS:
            return <SettingsPage />;
    }
};

export default App;
