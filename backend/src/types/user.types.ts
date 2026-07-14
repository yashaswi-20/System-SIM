export interface User {
    id: string;
    name: string;
    email: string;
    password?: string; // Stored hash, kept optional for safe returns
    role: string;
    created_at: Date;
}