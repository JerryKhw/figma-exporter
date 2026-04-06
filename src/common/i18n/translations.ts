import { Language } from "../enum.js";
import { en, type TranslationDict } from "./en.js";
import { ja } from "./ja.js";
import { fr } from "./fr.js";
import { de } from "./de.js";
import { es } from "./es.js";
import { es419 } from "./es-419.js";
import { ko } from "./ko.js";
import { ptBR } from "./pt-BR.js";
import { zhCN } from "./zh-CN.js";
import { zhTW } from "./zh-TW.js";

export const translations: Record<Language, TranslationDict> = {
    [Language.EN]: en,
    [Language.JA]: ja,
    [Language.FR]: fr,
    [Language.DE]: de,
    [Language.ES]: es,
    [Language.ES_419]: es419,
    [Language.KO]: ko,
    [Language.PT_BR]: ptBR,
    [Language.ZH_CN]: zhCN,
    [Language.ZH_TW]: zhTW,
};

export type { TranslationDict };
export type { TranslationKey } from "./en.js";
