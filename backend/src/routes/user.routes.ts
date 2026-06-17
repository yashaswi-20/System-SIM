import { Router } from "express";
import { UserRepository } from "../repositories/user.repository";
import { asyncHandler } from "../utils/AsyncHandler";

const router = Router();
const userRepository = new UserRepository();

router.get("/", asyncHandler(async (req, res) => {
    const users = await userRepository.findAll();
    res.status(200).json({ success: true, users });
}));

export default router;