import express from 'express';
import { createProject, getOffchainProjects, getOnchainProjects, getProjectById, getMyProjects, updateProject, prepareProjectTokenDeployment,prepareProjectMgmtDeployment, onboard, prepareCreateProject } from '../controllers/projectController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { validate } from '../middlewares/validator.js';
import { createProjectSchema, updateProjectSchema, deployProjectTokenSchema, deployProjectMgmtSchema, onboardSchema, prepareOnchainDeploymentSchema } from '../middlewares/projectSchema.js';

const router = express.Router();

router.post('/', protect('Project Creator'), validate(createProjectSchema), createProject); //POST /api/projects
router.get('/off', getOffchainProjects); //GET /api/projects?status=Funding&status=Active
router.get('/my', protect('Project Creator'), getMyProjects); //GET /api/projects/my
router.get('/id/:projectId', protect(), getProjectById); //GET /api/projects/id/:projectId
router.patch('/id/:projectId', protect('Project Creator'), validate(updateProjectSchema), updateProject); //PATCH /api/projects/id/:projectId

router.post('/deploy/projectTokenPrep', protect('Project Creator'), validate(deployProjectTokenSchema), prepareProjectTokenDeployment); //POST /api/projects/deploy/projectTokenPrep
router.post('/deploy/projectMgmtPrep', protect('Project Creator'), validate(deployProjectMgmtSchema), prepareProjectMgmtDeployment); //POST /api/projects/deploy/projectMgmtPrep
router.post('/deploy/onboard', protect('Project Creator'), validate(onboardSchema), onboard); // POST /api/projects/deploy/onboard

router.post('/deploy/onchain', protect('Project Creator'), validate(prepareOnchainDeploymentSchema), prepareCreateProject); // POST /api/projects/deploy/onchain


export default router;