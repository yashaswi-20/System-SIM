import crypto from "crypto";

/**
 * Creates a fast, secure SHA-256 hash of a token.
 */
export const hashToken = (token: string): string => {
    return crypto.createHash("sha256").update(token).digest("hex");
};