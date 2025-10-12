import express from 'express';
import { 
    createProject, getProjects, getProjectById, getMyProjects, updateProject, 
    prepareCreateProject, onboard, prepareMintTokens, 
    getProjectIds, getOnchainProjectIds, myInvestment, syncProjectOnchainData, confirmMintTransaction
} from '../controllers/projectController.js';
    // prepareProjectTokenDeployment,prepareProjectMgmtDeployment, onboard, 
import { protect } from '../middlewares/authMiddleware.js';
import { validate } from '../middlewares/validator.js';
import { createProjectSchema, updateProjectSchema, prepareOnchainDeploymentSchema, onboardSchema, prepareMintTokensSchema } from '../middlewares/projectSchema.js';

const router = express.Router();

router.post('/', protect('Project Creator'), validate(createProjectSchema), createProject); //POST /api/projects
router.get('/', getProjects); //GET /api/projects?status=Funding&status=Active
router.post('/:id/sync', protect(), syncProjectOnchainData); // 👈 Add this new route
router.get('/id/:projectId', protect(), getProjectById); //GET /api/projects/id/:projectId
router.get('/my', protect('Project Creator'), getMyProjects); //GET /api/projects/my
router.patch('/id/:projectId', protect('Project Creator'), validate(updateProjectSchema), updateProject); //PATCH /api/projects/id/:projectId
router.get('/ids', getProjectIds);//mock for projectId select in frontend
router.get('/onchain/id/:projectId', protect(), getOnchainProjectIds);//mock helper for onchain projectId select in frontend

router.post('/deploy/onchain', protect('Project Creator'), validate(prepareOnchainDeploymentSchema), prepareCreateProject); // POST /api/projects/deploy/onchain
router.post('/deploy/onboard', protect('Project Creator'), validate(onboardSchema), onboard); // POST /api/projects/deploy/onboard

router.post('/mint/prepare', protect('Project Creator'), validate(prepareMintTokensSchema), prepareMintTokens);
router.post('/:id/confirm-mint', protect('Project Creator'), confirmMintTransaction);

router.get('/myInvestments', protect('Investor'), myInvestment); //GET /api/projects/myInvestments 

export default router;