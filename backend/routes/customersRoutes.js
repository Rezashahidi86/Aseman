import { Router } from 'express';
import {
  createCustomer,
  getCustomers,
  updateCustomer,
  deleteCustomer,
  getCustomerSmsSettings,
  updateCustomerSmsSettings,
  sendCustomerSms,
} from '../controllers/customerController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import setBranchContext from '../middlewares/branchMiddleware.js';

const router = Router();

router.use(authMiddleware);

router
  .route('/sms-settings')
  .get(setBranchContext, getCustomerSmsSettings)
  .put(setBranchContext, updateCustomerSmsSettings);

router.post('/:id/sms', setBranchContext, sendCustomerSms);

router
  .route('/')
  .post(setBranchContext, createCustomer)
  .get(setBranchContext, getCustomers);

router
  .route('/:id')
  .patch(setBranchContext, updateCustomer)
  .delete(setBranchContext, deleteCustomer);

export default router;