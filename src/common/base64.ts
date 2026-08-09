export const toBase64 = (buffer: Uint8Array) => {
    const CHUNK_SIZE = 0x8000;
    let binary = "";

    for (let i = 0; i < buffer.length; i += CHUNK_SIZE) {
        const chunk = buffer.subarray(i, i + CHUNK_SIZE);
        binary += String.fromCharCode.apply(null, chunk as unknown as number[]);
    }

    return btoa(binary);
};
