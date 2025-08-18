const Joi = require('joi');
const Project = require('../models/Project');
const deploymentService = require('../services/deploymentService');

const projectSchema = Joi.object({
    title: Joi.string().min(3).max(255).required(),
    description: Joi.string().required(),
    funding_goal: Joi.number().positive().required(),
    funding_duration: Joi.number().integer().positive().required(), // Duration in seconds
    platform_fee_percentage: Joi.number().min(0).max(10000).required(), // In basis points (e.g., 250 for 2.5%)
    reward_fee_percentage: Joi.number().min(0).max(10000).required() // In basis points
});

const statusUpdateSchema = Joi.object({
    status: Joi.string().valid('Approved', 'Rejected').required()
});

exports.submitProject = async (req, res) => {
    try {
        const { error, value } = projectSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ message: 'Validation error', details: error.details });
        }

        const projectData = {
            ...value,
            creator_id: req.user.id // From auth middleware
        };

        const project = await Project.create(projectData);
        res.status(201).json({ message: 'Project submitted for review.', project });

    } catch (error) {
        console.error('Project submission error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.getProjects = async (req, res) => {
    try {
        const { status } = req.query;
        const projects = await Project.getAllByStatus(status);
        res.json(projects);
    } catch (error) {
        console.error('Error fetching projects:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const blockchainService = require('../services/blockchainService');
const { addNewProjectListener } = require('../services/eventListenerService');

exports.updateProjectStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { error, value } = statusUpdateSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ message: 'Validation error', details: error.details });
        }

        const project = await Project.findByIdWithCreator(id);
        if (!project) {
            return res.status(404).json({ message: 'Project not found.' });
        }

        if (project.status !== 'Pending') {
            return res.status(400).json({ message: `Project is already ${project.status} and cannot be updated.` });
        }

        if (value.status === 'Rejected') {
            const updatedProject = await Project.updateStatus(id, 'Rejected');
            return res.json({ message: 'Project has been rejected.', project: updatedProject });
        }

        if (value.status === 'Approved') {
            // Deploy contracts
            console.log(`Starting deployment for project ${project.id}...`);
            const { token, management } = await deploymentService.deploy(project);
            console.log(`Deployment successful for project ${project.id}. Token: ${token}, Management: ${management}`);

            // Save addresses to DB
            await Project.addContractAddresses(id, token, management);

            // Update status to Funding
            const finalProject = await Project.updateStatus(id, 'Funding');

            // Start listening to events for the new project
            addNewProjectListener(finalProject);

            return res.json({ message: 'Project approved, contracts deployed, and status updated to Funding.', project: finalProject });
        }

    } catch (error) {
        console.error('Error updating project status:', error);
        // More specific error for deployment failure
        if (error.message.includes('Failed to execute deployment script')) {
            return res.status(502).json({ message: 'Contract deployment failed.', details: error.message });
        }
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.getLiveProjects = async (req, res) => {
    try {
        const projects = await Project.getLive();
        res.json(projects);
    } catch (error) {
        console.error('Error fetching live projects:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.getProjectById = async (req, res) => {
    try {
        const { id } = req.params;
        const project = await Project.findById(id);

        if (!project) {
            return res.status(404).json({ message: 'Project not found.' });
        }

        if (!project.project_management_address || !project.project_token_address) {
            // If contracts are not deployed yet, just return DB data
            return res.json({ project });
        }

        const blockchainState = await blockchainService.getProjectState(
            project.project_management_address,
            project.project_token_address
        );

        res.json({ project, blockchainState });

    } catch (error) {
        console.error(`Error fetching project ${req.params.id}:`, error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
