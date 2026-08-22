import { Request, Response } from "express";
import { AuthService } from "./auth.service";
import { asyncHandler } from "../utils/AsyncHandler";
import { AppError } from "../utils/AppError";

export class AuthController {
    private service = new AuthService();

    register = asyncHandler(async (req: Request, res: Response) => {
        const { name, email, password } = req.body;

        const user = await this.service.register(name, email, password);

        res.status(201).json({
            success: true,
            user
        });
    });

    login = asyncHandler(async (req: Request, res: Response) => {
        const { email, password } = req.body;

        const { user, accessToken, refreshToken } = await this.service.login(email, password);

        res.status(200).json({
            success: true,
            accessToken,
            refreshToken,
            user
        });
    });

    refresh = asyncHandler(async (req: Request, res: Response) => {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            throw new AppError("Refresh token is required", 400);
        }

        const tokens = await this.service.refresh(refreshToken);

        res.status(200).json({
            success: true,
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken
        });
    });

    
    logout = asyncHandler(async (req: Request, res: Response) => {
        const { refreshToken } = req.body;

        await this.service.logout(refreshToken);

        res.status(200).json({
            success: true,
            message: "Logged out successfully"
        });
    });

    
    logoutAll = asyncHandler(async (req: Request, res: Response) => {
        // req.user is guaranteed to exist here because of the authenticate middleware
        const userId = req.user!.id; 

        await this.service.logoutAll(userId);

        res.status(200).json({
            success: true,
            message: "Successfully logged out from all devices"
        });
    });
}
