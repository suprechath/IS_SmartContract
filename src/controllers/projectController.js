import projectModel from '../models/projectModel.js';
import { handleResponse } from '../utils/responseHandler.js';

// @desc    Create a new project
// @route   POST /api/projects
export const createProject = async (req, res) => {
    try {
        const newProject = await projectModel.createProject(req.body, req.user.id);
        handleResponse(res, 201, 'Project created successfully', newProject);
    } catch (error) {
        console.error('Create Project Error:', error);
        handleResponse(res, 500, 'Server error during project creation.', error.message);
    }
};

// @desc    Get all public projects, optionally filtered by status
// @route   GET /api/projects
export const getProjects = async (req, res) => {
    const publicStatuses = ['Pending', 'Approved', 'Rejected', 'Funding', 'Succeeded', 'Failed', 'Active'];
    let requestedStatuses = req.query.status; //http://localhost:5001/api/projects?status=Succeeded || http://localhost:5001/api/projects?status=Funding&status=Active
    let statusesToQuery = [];

    if (requestedStatuses) {
        if (!Array.isArray(requestedStatuses)) {
            requestedStatuses = [requestedStatuses];
        }
        statusesToQuery = requestedStatuses.filter(status => publicStatuses.includes(status));

    } else {
        // Default to 'Funding' and 'Active' if no status is provided
        statusesToQuery = ['Funding', 'Active'];
    }

    if (statusesToQuery.length === 0) {
        return handleResponse(res, 200, 'No projects found with the specified valid statuses.', []);
    }

    try {
        const projects = await projectModel.getProjectsByStatus(statusesToQuery);
        // Here you would add the logic to fetch on-chain data and combine it
        handleResponse(res, 200, 'Projects retrieved successfully', projects);
    } catch (error) {
        console.error('Get Projects Error:', error);
        handleResponse(res, 500, 'Server error while retrieving projects.', error.message);
    }
};

// @desc    Get a single project by ID
// @route   GET /api/projects/:projectId
export const getProjectById = async (req, res) => {
    try {
        const project = await projectModel.getProjectById(req.params.projectId);
        if (!project) {
            return handleResponse(res, 404, 'Project not found.');
        }
        // Here you would also add on-chain data fetching
        handleResponse(res, 200, 'Project retrieved successfully', project);
    } catch (error) {
        console.error('Get Project By ID Error:', error);
        handleResponse(res, 500, 'Server error while retrieving the project.', error.message);
    }
};

// @desc    Get projects for the logged-in user
// @route   GET /api/users/me/projects
export const getMyProjects = async (req, res) => {
    try {
        const projects = await projectModel.getProjectsByCreatorId(req.user.id);
        handleResponse(res, 200, 'User projects retrieved successfully', projects);
    } catch (error) {
        console.error('Get My Projects Error:', error);
        handleResponse(res, 500, 'Server error while retrieving user projects.', error.message);
    }
};

// @desc    Update a project
// @route   PATCH /api/projects/:projectId
export const updateProject = async (req, res) => {
    try {
        const { projectId } = req.params;
        const project = await projectModel.getProjectById(projectId);

        if (!project) {
            return handleResponse(res, 404, 'Project not found.');
        }

        if (project.creator_id !== req.user.id) {
            return handleResponse(res, 403, 'Not authorized to update this project.');
        }

        if (project.status !== 'Pending') {
            return handleResponse(res, 400, `Project cannot be updated. It is in '${project.status}' status.`);
        }
        
        const updatedProject = await projectModel.updateProject(projectId, req.body);
        handleResponse(res, 200, 'Project updated successfully', updatedProject);

    } catch (error) {
        console.error('Update Project Error:', error);
        handleResponse(res, 500, 'Server error during project update.', error.message);
    }
};