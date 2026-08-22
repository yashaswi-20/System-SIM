import { z } from "zod";

export const registerSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.email({error:"Invalid email address"}),
    password: z.string()
        .min(8, "Password must be at least 8 characters")
        .max(64, "Password must not exceed 64 characters")
});

export const loginSchema = z.object({
    email: z.email({error:"Invalid email address"}),
    password: z.string().min(1, "Password is required") // We just need it to exist for login
});

export const refreshSchema = z.object({
  refreshToken: z
    .string({ error: "Refresh token is required" })
    .min(1, "Refresh token is required")
});

export const logoutSchema = z.object({
   
        refreshToken: z.string({ error: "Refresh token is required for logout" })
    
});