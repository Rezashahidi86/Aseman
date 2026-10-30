import { Router } from 'express';
import {
  createManualDocument,
  getManualDocuments,
  getManualDocumentImage,
  deleteManualDocument,
} from '../controllers/manualDocumentController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import setBranchContext from '../middlewares/branchMiddleware.js';
import uploadManualDocumentImage from '../middlewares/manualDocumentUpload.js';

const router = Router();

router.use(authMiddleware);

router
  .route('/')
  .post(
    setBranchContext,
    uploadManualDocumentImage.array('images', 10),
    createManualDocument,
  )
  .get(setBranchContext, getManualDocuments);

router.post('/list', setBranchContext, getManualDocuments);

router.get('/:id/images/:index', getManualDocumentImage);
router.delete('/:id', setBranchContext, deleteManualDocument);

export default router;
