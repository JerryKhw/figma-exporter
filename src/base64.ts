import { Format } from './enum'

export const toBase64 = (buffer: Uint8Array) => {
    return btoa(buffer.reduce(function (data, byte) {
        return data + String.fromCharCode(byte);
    }, ''))
}

export const toBase64Format = (format: string) => {
    switch (format) {
        case Format.PNG: return "data:image/png;base64,"
        case Format.JPG: return "data:image/jpeg;base64,"
        case Format.WEBP: return "data:image/webp;base64,"
        case Format.SVG: return "data:image/svg+xml;base64,"
        case Format.PDF: return "data:application/pdf;base64,"
        default: return ""
    }
}