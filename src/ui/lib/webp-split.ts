import { u8ToWebPBytes } from "./utils";

const WEBP_MAX_DIMENSION = 16383;

type SplitGrid = {
    cols: number;
    rows: number;
};

type WebPConversion = {
    parts: Uint8Array[];
    originalSize: number;
    convertedSize: number;
};

export type WebPBatchConversion = {
    grid: SplitGrid;
    results: WebPConversion[];
};

const createCanvas = (width: number, height: number) => {
    if (typeof OffscreenCanvas !== "undefined") {
        return new OffscreenCanvas(width, height);
    }

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    return canvas;
};

const canvasToBuffer = async (
    canvas: OffscreenCanvas | HTMLCanvasElement
): Promise<Uint8Array> => {
    if ("convertToBlob" in canvas) {
        const blob = await canvas.convertToBlob({ type: "image/png" });
        return new Uint8Array(await blob.arrayBuffer());
    }

    return await new Promise<Uint8Array>((resolve, reject) => {
        (canvas as HTMLCanvasElement).toBlob((blob) => {
            if (!blob) {
                reject(new Error("failed_to_create_canvas_blob"));
                return;
            }

            blob.arrayBuffer()
                .then((buffer) => resolve(new Uint8Array(buffer)))
                .catch(reject);
        }, "image/png");
    });
};

const decodeBuffer = async (buffer: Uint8Array): Promise<ImageBitmap> => {
    const blob = new Blob([buffer], { type: "image/png" });
    return await createImageBitmap(blob);
};

const calculateGrid = (sizes: { width: number; height: number }[]): SplitGrid => {
    const maxWidth = Math.max(...sizes.map((size) => size.width));
    const maxHeight = Math.max(...sizes.map((size) => size.height));

    return {
        cols: Math.max(1, Math.ceil(maxWidth / WEBP_MAX_DIMENSION)),
        rows: Math.max(1, Math.ceil(maxHeight / WEBP_MAX_DIMENSION)),
    };
};

const splitBitmapToWebP = async (
    bitmap: ImageBitmap,
    grid: SplitGrid,
    quality: number
): Promise<Uint8Array[]> => {
    const parts: Uint8Array[] = [];
    const tileWidth = Math.ceil(bitmap.width / grid.cols);
    const tileHeight = Math.ceil(bitmap.height / grid.rows);

    for (let row = 0; row < grid.rows; row++) {
        for (let col = 0; col < grid.cols; col++) {
            const sx = col * tileWidth;
            const sy = row * tileHeight;
            const sw = Math.min(tileWidth, bitmap.width - sx);
            const sh = Math.min(tileHeight, bitmap.height - sy);

            const canvas = createCanvas(sw, sh);
            const ctx = canvas.getContext("2d");

            if (!ctx) {
                throw new Error("failed_to_get_canvas_context");
            }

            ctx.drawImage(bitmap, sx, sy, sw, sh, 0, 0, sw, sh);

            const pngBytes = await canvasToBuffer(canvas);
            const webpBytes = await u8ToWebPBytes(pngBytes, quality);

            parts.push(webpBytes);
        }
    }

    return parts;
};

export const convertBuffersToWebPWithConsistentGrid = async (
    buffers: Uint8Array[],
    quality: number
): Promise<WebPBatchConversion> => {
    const bitmaps = await Promise.all(buffers.map((buffer) => decodeBuffer(buffer)));
    const grid = calculateGrid(
        bitmaps.map((bitmap) => ({ width: bitmap.width, height: bitmap.height }))
    );
    const shouldSplit = grid.cols > 1 || grid.rows > 1;

    const results = await Promise.all(
        bitmaps.map(async (bitmap, index) => {
            const originalSize = buffers[index].length;
            let parts: Uint8Array[];

            if (shouldSplit) {
                parts = await splitBitmapToWebP(bitmap, grid, quality);
            } else {
                parts = [await u8ToWebPBytes(buffers[index], quality)];
            }

            if ("close" in bitmap) {
                bitmap.close();
            }

            const convertedSize = parts.reduce(
                (sum, part) => sum + part.length,
                0
            );

            return {
                parts,
                originalSize,
                convertedSize,
            };
        })
    );

    return { grid, results };
};

export const buildPartName = (
    baseName: string,
    partIndex: number,
    totalParts: number
): string => {
    if (totalParts <= 1) {
        return baseName;
    }

    return `${baseName}_part${partIndex + 1}`;
};
