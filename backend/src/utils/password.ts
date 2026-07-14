import bcrypt from "bcrypt";

// The cost factor for hashing. 10 is the current industry standard balance 
// between security and performance.
const SALT_ROUNDS = 10;

//hash
export const hashPassword = async (password: string): Promise<string> => {
    return await bcrypt.hash(password, SALT_ROUNDS);
};

/**
 * Compares a plain-text password against a securely hashed password.
 * Returns true if they match, false otherwise.
 */
export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
    return await bcrypt.compare(password, hash);
};