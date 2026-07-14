import { Request, Response } from "express";
import { AuthService } from "./auth.service";
import { asyncHandler } from "../utils/AsyncHandler";

export class AuthController {
    private service = new AuthService();

    // register = asyncHandler(async (req: Request, res: Response) => {
    //     const { name, email, password } = req.body;

    //     const user = await this.service.register(name, email, password);

    //     res.status(201).json({
    //         success: true,
    //         user: user
    //     });
    // });

    login = asyncHandler(async (req: Request, res: Response) => {
        const { email, password } = req.body;

        const { user, accessToken } = await this.service.login(email, password);

        res.status(200).json({
            success: true,
            accessToken,
            user
        });
    });
}