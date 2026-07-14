import { hashPassword, comparePassword } from "../utils/password";
import { UserRepository } from "../repositories/user.repository";
import { AppError } from "../utils/AppError";
import { generateAccessToken } from "../utils/jwt";

export class AuthService {
    private repository = new UserRepository();

    // async register(name: string, email: string, passwordPlain: string) {
    //     // 1. Check for duplicates
    //     const existingUser = await this.repository.findByEmail(email);
    //     if (existingUser) {
    //         throw new AppError("Email already exists", 409);
    //     }

    //     // 2. Hash the password
    //     const passwordHash = await hashPassword(passwordPlain);

    //     // 3. Save to database
    //     const newUser = await this.repository.create(name, email, passwordHash);

    //     // 4. Strip the password before returning
    //     delete newUser.password;

    //     return newUser;
    // }


    async login(email: string, passwordPlain: string) {
        // 1. Find user by email
        const user = await this.repository.findByEmail(email);
        
        // 2. If user doesn't exist, throw generic 401
        if (!user) {
            throw new AppError("Invalid credentials", 401);
        }

        // 3. Compare passwords
        // The user object from the DB contains the hashed password
        const isPasswordValid = await comparePassword(passwordPlain, user.password!);
        
        if (!isPasswordValid) {
            throw new AppError("Invalid credentials", 401);
        }

        // 4. Generate Access Token
        const accessToken = generateAccessToken({
            id: user.id,
            email: user.email,
            role: user.role
        });

        // 5. Clean up user object before returning
        delete user.password;

        return { user, accessToken };
    }
}