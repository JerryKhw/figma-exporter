import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { arrayBufferToWebP } from "webp-converter-browser";

export const cn = (...inputs: ClassValue[]) => {
    return twMerge(clsx(inputs));
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

const u8ToWebPBlob = async (u8: Uint8Array, quality: number = 100): Promise<Blob> => {
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
