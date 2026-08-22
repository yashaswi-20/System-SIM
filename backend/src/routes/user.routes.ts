import { Router } from "express";
import { UserController } from "../controllers/user.controller";
import { authenticate } from "../middleware/auth.middleware";
import { authorize } from "../middleware/authorize.middleware";

const router = Router();
const controller = new UserController();


router.get("/",authenticate, controller.getUser);

router.get("/:id", authenticate,controller.getUserById);

//router.post("/", controller.createUser);

router.delete("/:id",authenticate,authorize("ADMIN"), controller.deleteUser);

export default router;
