import { Router } from "express";
import { UserController } from "../controllers/user.controller"

const router = Router();
const controller = new UserController();


router.get("/", controller.getUser);

router.get("/:id", controller.getUserById);

router.post("/", controller.createUser);

router.delete("/:id", controller.deleteUser);

export default router;
