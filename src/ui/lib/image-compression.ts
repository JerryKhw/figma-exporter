import imageCompression from "browser-image-compression";
import { Format } from "@common/enum";

export interface CompressionOptions {
    quality: number;
    format: Format;
    forceCompressionAt100Quality?: boolean;
}

export interface CompressionResult {
    buffer: Uint8Array;
    originalSize: number;
    compressedSize: number;
    compressionRatio: number;
    wasCompressed: boolean;
}

export const compressImageBuffer = async (
    buffer: Uint8Array,
    options: CompressionOptions
): Promise<Uint8Array> => {
    const { quality, format } = options;

    if (format !== Format.JPG && format !== Format.PNG) {
        return buffer;
    }

    try {
        const mimeType = format === Format.JPG ? "image/jpeg" : "image/png";
        const blob = new Blob([buffer], { type: mimeType });
        const file = new File([blob], `image.${format}`, { type: mimeType });

        const compressionOptions = {
            initialQuality: quality / 100,
            maxWidthOrHeight: undefined,
            maxSizeMB: undefined,
            useWebWorker: true,
            fileType: mimeType,
        };

        const compressedFile = await imageCompression(file, compressionOptions);

        const compressedBuffer = await compressedFile.arrayBuffer();
        return new Uint8Array(compressedBuffer);
    } catch (error) {
        console.error("Image compression failed:", error);
        return buffer;
    }
};

export const compressImageBufferSafe = async (
    buffer: Uint8Array,
    options: CompressionOptions
): Promise<Uint8Array> => {
    if (options.quality >= 100 && !options.forceCompressionAt100Quality) {
        return buffer;
    }

    const compressed = await compressImageBuffer(buffer, options);

    if (compressed.length >= buffer.length) {
        return buffer;
    }

    return compressed;
};

export const compressImageBufferWithStats = async (
    buffer: Uint8Array,
    options: CompressionOptions
): Promise<CompressionResult> => {
    const originalSize = buffer.length;

    if (options.format !== Format.JPG && options.format !== Format.PNG) {
        return {
            buffer,
            originalSize,
            compressedSize: originalSize,
            compressionRatio: 0,
            wasCompressed: false,
        };
    }

    if (options.quality >= 100 && !options.forceCompressionAt100Quality) {
        return {
            buffer,
            originalSize,
            compressedSize: originalSize,
            compressionRatio: 0,
            wasCompressed: false,
        };
    }

    const compressed = await compressImageBuffer(buffer, options);
    const compressedSize = compressed.length;

    if (compressedSize >= originalSize) {
        return {
            buffer,
            originalSize,
            compressedSize: originalSize,
            compressionRatio: 0,
            wasCompressed: false,
        };
    }

    const compressionRatio = (originalSize - compressedSize) / originalSize;

    return {
        buffer: compressed,
        originalSize,
        compressedSize,
        compressionRatio,
        wasCompressed: true,
    };
};
