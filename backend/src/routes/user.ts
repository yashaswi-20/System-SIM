import {Router} from 'express';
import { validate } from '../middleware/validate.middleware';
import { userSchema } from '../validators/user.validator';


const router = Router();


router.post('/', validate(userSchema), (req, res) => {

    res.status(200).json({ success: true });
  }
);

export default router;