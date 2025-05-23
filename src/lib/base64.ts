/**
 * Encodes a Blob into a Base64 string.
 * @param blob - The Blob to encode.
 * @returns A Promise that resolves to a Base64-encoded string.
 */
export function encode(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onloadend = () => resolve((reader.result as string).split(",")[1])
        reader.onerror = reject
        reader.readAsDataURL(blob)
    })
}

/**
 * Decodes a Base64 string into a Blob.
 * @param base64 - The Base64-encoded string.
 * @param mimeType - The MIME type for the resulting Blob.
 * @returns The decoded Blob.
 */
export function decode(base64: string, mimeType = "application/octet-stream"): Blob {
    const bin = atob(base64)
    const bytes = new Uint8Array(bin.length)
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
    return new Blob([bytes], {type: mimeType})
}
