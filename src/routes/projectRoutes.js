import express from 'express';
import { createProject, getProjects, getProjectById, getMyProjects, updateProject, prepareCreateProject } from '../controllers/projectController.js';
    // prepareProjectTokenDeployment,prepareProjectMgmtDeployment, onboard, 
import { protect } from '../middlewares/authMiddleware.js';
import { validate } from '../middlewares/validator.js';
import { createProjectSchema, updateProjectSchema, prepareOnchainDeploymentSchema } from '../middlewares/projectSchema.js';

const router = express.Router();

router.post('/', protect('Project Creator'), validate(createProjectSchema), createProject); //POST /api/projects
router.get('/', getProjects); //GET /api/projects?status=Funding&status=Active
router.get('/id/:projectId', protect(), getProjectById); //GET /api/projects/id/:projectId
router.get('/my', protect('Project Creator'), getMyProjects); //GET /api/projects/my
router.patch('/id/:projectId', protect('Project Creator'), validate(updateProjectSchema), updateProject); //PATCH /api/projects/id/:projectId

router.post('/deploy/onchain', protect('Project Creator'), validate(prepareOnchainDeploymentSchema), prepareCreateProject); // POST /api/projects/deploy/onchain

// router.post('/deploy/projectTokenPrep', protect('Project Creator'), validate(deployProjectTokenSchema), prepareProjectTokenDeployment); //POST /api/projects/deploy/projectTokenPrep
// router.post('/deploy/projectMgmtPrep', protect('Project Creator'), validate(deployProjectMgmtSchema), prepareProjectMgmtDeployment); //POST /api/projects/deploy/projectMgmtPrep
// router.post('/deploy/onboard', protect('Project Creator'), validate(onboardSchema), onboard); // POST /api/projects/deploy/onboard

export default router;