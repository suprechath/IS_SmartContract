import express from 'express';
import { verifyUser } from '../controllers/adminController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { reviewProjectSchema, recordFactorySchema, recordSchema } from '../middlewares/adminSchema.js';
import { validate } from '../middlewares/validator.js';
import { reviewProject, prepareFactoryDeployment, recordFactoryDeployment, recordDeployment, getAllConfig} from '../controllers/adminController.js';

const router = express.Router();

router.post('/verify-user', protect("Platform Operator"), verifyUser); //POST http://localhost:5001/api/admin/verify-user
router.post('/projects/review', protect('Platform Operator'), validate(reviewProjectSchema), reviewProject); //POST /api/admin/projects/review

router.post('/deploy-factory/prepare', protect('Platform Operator'), prepareFactoryDeployment);
router.post('/deploy-factory/record', protect('Platform Operator'), validate(recordFactorySchema), recordFactoryDeployment);
router.post('/deploy/record', protect('Platform Operator'), validate(recordSchema), recordDeployment);
router.get('/configs', protect('Platform Operator'), getAllConfig);

export default router;