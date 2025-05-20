/**
 * Encode any string (Unicode-safe) to Base64.
 */
export function stringToBase64(str: string): string {
    const utf8Bytes = new TextEncoder().encode(str)
    let binary = ""
    for (const byte of utf8Bytes) {
        binary += String.fromCharCode(byte)
    }
    return window.btoa(binary)
}

/**
 * Decode a Base64 string back into Unicode text.
 */
export function base64ToString(b64: string): string {
    const binary = window.atob(b64)
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0))
    return new TextDecoder().decode(bytes)
}

/**
 * Convert a Blob to a Base64-encoded string (data URL).
 */
export function blobToDataURL(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onloadend = () => {
            resolve(reader.result as string)
        }
        reader.onerror = () => reject(reader.error)
        reader.readAsDataURL(blob)
    })
}

/**
 * Convert a Blob to raw Base64 (no prefix).
 */
export function blobToBase64(blob: Blob): Promise<string> {
    return blobToDataURL(blob).then((dataUrl) => dataUrl.split(",")[1])
}

export function dataToBase64(data: string | Blob): Promise<string> {
    if (typeof data === "string") {
        return Promise.resolve(stringToBase64(data))
    } else {
        return blobToBase64(data)
    }
}
