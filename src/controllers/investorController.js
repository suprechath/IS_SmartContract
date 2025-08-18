const Project = require('../models/Project');
const User = require('../models/User'); // We need the user model to get wallet address
const blockchainService = require('../services/blockchainService');

exports.getPortfolio = async (req, res) => {
    try {
        const investorId = req.user.id;

        // First, get the investor's user data to know their wallet address
        const investor = await User.findById(investorId); // You'll need to implement User.findById
        if (!investor || !investor.wallet_address) {
            return res.status(404).json({ message: 'Investor wallet address not found.' });
        }

        // Get all projects the user has invested in from our DB
        const projectsFromDb = await Project.findByInvestorId(investorId);

        // For each project, augment with blockchain data
        const portfolio = await Promise.all(projectsFromDb.map(async (project) => {
            if (!project.project_management_address || !project.project_token_address) {
                return {
                    ...project,
                    blockchainData: null // Not deployed yet
                };
            }

            const blockchainData = await blockchainService.getInvestorInfo(
                project.project_management_address,
                project.project_token_address,
                investor.wallet_address
            );

            return { ...project, blockchainData };
        }));

        res.json(portfolio);

    } catch (error) {
        console.error('Error fetching investor portfolio:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
