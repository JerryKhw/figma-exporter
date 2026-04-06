import { Language } from "../enum.js";
import { translations } from "./translations.js";
import type { TranslationKey } from "./en.js";

export function t(key: TranslationKey, language: Language): string {
    return translations[language]?.[key] ?? translations[Language.EN][key];
}

export function tFormat(
    key: TranslationKey,
    language: Language,
    params: Record<string, string | number>
): string {
    const template = t(key, language);
    return template.replace(/\{(\w+)\}/g, (_, k) => String(params[k] ?? ""));
}

export type { TranslationKey };
