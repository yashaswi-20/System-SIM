import jwt, { type SignOptions, type Secret } from "jsonwebtoken";

// We define the payload structure to ensure type safety across the app
export interface JwtPayload {
    id: string;
    email: string;
    role: string;
}

const JWT_SECRET: Secret = process.env.JWT_SECRET || "fallback-secret-do-not-use-in-prod";
const JWT_EXPIRES_IN = (process.env.JWT_EXPIRES_IN || "15m") as SignOptions["expiresIn"];

// Add Refresh Token Secrets
const JWT_REFRESH_SECRET: Secret= process.env.JWT_REFRESH_SECRET || "fallback-refresh-secret";
const JWT_REFRESH_EXPIRES_IN = (process.env.JWT_REFRESH_EXPIRES_IN || "7d") as SignOptions["expiresIn"];;

export const generateAccessToken = (payload: JwtPayload): string => {
    return jwt.sign(payload, JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN,
    });
};


// New: Generate Refresh Token
export const generateRefreshToken = (payload: JwtPayload): string => {
    return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: JWT_REFRESH_EXPIRES_IN });
};

export const verifyRefreshToken = (token: string): JwtPayload => {
    // jwt.verify automatically throws an error if the token is invalid or expired
    return jwt.verify(token, JWT_REFRESH_SECRET) as JwtPayload;
};

export const verifyAccessToken = (token: string): JwtPayload => {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
};