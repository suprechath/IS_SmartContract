const express = require('express');
const router = express.Router();
const investorController = require('../controllers/investorController');
const { authenticate, authorize } = require('../middleware/authMiddleware');

// Route to get the logged-in investor's portfolio
// Only authenticated users with the 'Investor' role can access this.
router.get(
    '/portfolio',
    authenticate,
    authorize(['Investor']),
    investorController.getPortfolio
);

module.exports = router;
