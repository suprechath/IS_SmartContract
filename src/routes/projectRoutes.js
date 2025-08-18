const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const { authenticate, authorize } = require('../middleware/authMiddleware');

// --- Public Routes ---
router.get('/live', projectController.getLiveProjects);
router.get('/:id', projectController.getProjectById);


// --- Protected Routes ---

// Route to submit a new project
// Only authenticated users with the 'Project Creator' role can access this.
router.post(
    '/',
    authenticate,
    authorize(['Project Creator']),
    projectController.submitProject
);

// Route for admins to get a list of all projects (or filter by status)
// Only authenticated users with the 'Admin' role can access this.
router.get(
    '/',
    authenticate,
    authorize(['Admin']),
    projectController.getProjects
);

// Route for admins to approve or reject a project
// Only authenticated users with the 'Admin' role can access this.
router.patch(
    '/:id/status',
    authenticate,
    authorize(['Admin']),
    projectController.updateProjectStatus
);

module.exports = router;
