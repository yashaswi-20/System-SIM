import jwt, { type SignOptions, type Secret } from "jsonwebtoken";

// We define the payload structure to ensure type safety across the app
export interface JwtPayload {
    id: string;
    email: string;
    role: string;
}

const JWT_SECRET: Secret = process.env.JWT_SECRET || "fallback-secret-do-not-use-in-prod";
const JWT_EXPIRES_IN = (process.env.JWT_EXPIRES_IN || "15m") as SignOptions["expiresIn"];

export const generateAccessToken = (payload: JwtPayload): string => {
    return jwt.sign(payload, JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN,
    });
};
