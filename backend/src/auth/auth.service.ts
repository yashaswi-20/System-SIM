import { hashPassword, comparePassword } from "../utils/password";
import { UserRepository } from "../repositories/user.repository";
import { AppError } from "../utils/AppError";
import { RefreshTokenRepository } from "./refresh-token.repository";
import { generateAccessToken, generateRefreshToken } from "../utils/jwt";
import { hashToken } from "../utils/hash";
import { verifyRefreshToken } from "../utils/jwt";

export class AuthService {
  private repository = new UserRepository();
  private refreshTokenRepo = new RefreshTokenRepository();

  async register(name: string, email: string, passwordPlain: string) {
    // 1. Check for duplicates
    const existingUser = await this.repository.findByEmail(email);
    if (existingUser) {
      throw new AppError("Email already exists", 409);
    }

    // 2. Hash the password
    const passwordHash = await hashPassword(passwordPlain);

    // 3. Save to database
    const newUser = await this.repository.create(name, email, passwordHash);

    // 4. Strip the password before returning
    delete newUser.password;

    return newUser;
  }

  async login(email: string, passwordPlain: string) {
    // 1. Find user by email
    const user = await this.repository.findByEmail(email);

    // 2. If user doesn't exist, throw generic 401
    if (!user) {
      throw new AppError("Invalid credentials", 401);
    }

    // 3. Compare passwords
    // The user object from the DB contains the hashed password
    const isPasswordValid = await comparePassword(
      passwordPlain,
      user.password!,
    );

    if (!isPasswordValid) {
      throw new AppError("Invalid credentials", 401);
    }

    // 1. Generate both tokens
    const payload = {
      id: user.id,
      email: user.email,
      role: user.role,
    };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    // 2. Hash the refresh token
    const hashedRefreshToken = hashToken(refreshToken);

    // 3. Calculate expiration date (7 days from now)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // 4. Save the HASH to PostgreSQL
    await this.refreshTokenRepo.saveToken(
      user.id,
      hashedRefreshToken,
      expiresAt,
    );

    delete user.password;

    // 5. Return BOTH tokens to the client
    return { user, accessToken, refreshToken };
  }


  async refresh(refreshTokenPlain: string) {
        // 1. Hash incoming token to check the database
        const incomingHash = hashToken(refreshTokenPlain);

        // 2. Look up the hash in the database
        const existingToken = await this.refreshTokenRepo.findToken(incomingHash);
        
        if (!existingToken) {
            throw new AppError("Invalid or expired refresh token", 401);
        }

        // 3. Verify the JWT signature and expiration
        let payload;
        try {
            payload = verifyRefreshToken(refreshTokenPlain);
        } catch (error) {
            // If the token is cryptographically invalid or expired, delete the useless hash from the DB
            await this.refreshTokenRepo.deleteToken(incomingHash);
            throw new AppError("Invalid or expired refresh token", 401);
        }

        // 4. Generate NEW tokens
        const newPayload = { id: payload.id, email: payload.email, role: payload.role };
        const newAccessToken = generateAccessToken(newPayload);
        const newRefreshToken = generateRefreshToken(newPayload);

        // 5. Hash the NEW refresh token
        const newHash = hashToken(newRefreshToken);
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);

        // 6. ROTATION: Delete the old hash and save the new one
        await this.refreshTokenRepo.deleteToken(incomingHash);
        await this.refreshTokenRepo.saveToken(payload.id, newHash, expiresAt);

        // 7. Return the fresh tokens
        return { 
            accessToken: newAccessToken, 
            refreshToken: newRefreshToken 
        };
    }


    // Inside AuthService
    async logout(refreshTokenPlain: string) {
        if (!refreshTokenPlain) return;

        // Hash the token to find its match in the database
        const tokenHash = hashToken(refreshTokenPlain);

        // Delete it. If it doesn't exist, that's fine (they are already logged out)
        await this.refreshTokenRepo.deleteToken(tokenHash);
    }

    // Inside AuthService
    async logoutAll(userId: string) {
        // This instantly invalidates every single refresh token tied to this user
        await this.refreshTokenRepo.deleteAllUserTokens(userId);
    }
}
