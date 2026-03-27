// Encrypt / decrypt booking ID before storing in URL query params.
// Using btoa/atob + a simple XOR with a fixed salt — lightweight, no library needed.
// This is obfuscation, NOT cryptographic security. For true security, use server-side sessions.

const SALT = "CB_2026";

function xorString(input: string, key: string): string {
    return Array.from(input)
        .map((char, i) =>
            String.fromCharCode(char.charCodeAt(0) ^ key.charCodeAt(i % key.length))
        )
        .join("");
}

export function encryptId(id: string): string {
    try {
        const xored = xorString(id, SALT);
        return btoa(xored).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
    } catch {
        return btoa(id);
    }
}

export function decryptId(encrypted: string): string {
    try {
        const base64 = encrypted.replace(/-/g, "+").replace(/_/g, "/");
        const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
        const xored = atob(padded);
        return xorString(xored, SALT);
    } catch {
        return "";
    }
}
