import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { arrayBufferToWebP } from "webp-converter-browser";

import type { CleanupRule } from "@common/interface";

export const cn = (...inputs: ClassValue[]) => {
    return twMerge(clsx(inputs));
};

export const applyCleanupRules = (
    name: string,
    rules: CleanupRule[]
): string => {
    let result = name;

    for (const rule of rules) {
        try {
            result = result.replace(
                new RegExp(rule.original, "g"),
                rule.replacement
            );
        } catch {
            // Invalid regex (e.g. a literal "(" or "["): skip this rule
        }
    }

    return result;
};

// Mirrors the final export filename: the plugin applies prefix/suffix to the
// last path segment, then the UI applies the export-name cleanup rules.
export const buildExportFileName = (
    name: string,
    prefix: string,
    suffix: string,
    rules: CleanupRule[]
): string => {
    const segments = name.split("/");
    segments[segments.length - 1] =
        prefix + segments[segments.length - 1] + suffix;

    return applyCleanupRules(segments.join("/"), rules);
};

export const downloadBlob = (blob: Blob, fileName: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};

export const u8ToArrayBuffer = (u8: Uint8Array): ArrayBuffer => {
    const buffer = u8.buffer;

    if (buffer instanceof ArrayBuffer) {
        return buffer.slice(u8.byteOffset, u8.byteOffset + u8.byteLength);
    }

    throw new Error("unsupported_buffer_type");
};

const u8ToWebPBlob = async (
    u8: Uint8Array,
    quality: number = 100
): Promise<Blob> => {
    return await arrayBufferToWebP(u8ToArrayBuffer(u8), {
        quality,
    });
};

export const u8ToWebPBytes = async (
    buffer: Uint8Array,
    quality: number = 100
): Promise<Uint8Array> => {
    const blob = await u8ToWebPBlob(buffer, quality);
    return new Uint8Array(await blob.arrayBuffer());
};
