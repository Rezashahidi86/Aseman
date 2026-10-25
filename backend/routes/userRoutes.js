import { Router } from 'express';
import allowFields from '../middlewares/allowFields.js';
// import updateUser from "../controllers/userController.js";

const router = Router();

router.patch(
  '/:id',
  allowFields(['name', 'email']),
  //   updateUser,
);

export default router;
