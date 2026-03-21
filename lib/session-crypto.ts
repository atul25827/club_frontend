import { SignJWT, jwtVerify } from "jose";

// Ensure there's a fallback secret for development if it's missing in .env
const secretKey = process.env.SESSION_SECRET || "default_development_secret_do_not_use_in_prod";
const key = new TextEncoder().encode(secretKey);

export async function encryptSession(payload: any) {
    return await new SignJWT(payload)
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("7d") // Match Frappe's typical session length or business requirement
        .sign(key);
}

export async function decryptSession(input: string): Promise<any> {
    try {
        const { payload } = await jwtVerify(input, key, {
            algorithms: ["HS256"],
        });
        return payload;
    } catch (error) {
        // If the token is invalid, tampered with, or expired, it throws an error
        return null;
    }
}
