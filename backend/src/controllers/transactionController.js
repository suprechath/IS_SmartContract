import transactionModel from '../models/transactionModel.js';
import { handleResponse } from '../utils/responseHandler.js';

// @desc    Record a new transaction
// @route   POST /api/transactions/record
export const recordTransaction = async (req, res) => {
    try {
        const existingTx = await transactionModel.getTransactionByTxHash(req.body.transaction_hash);
        if (existingTx) {
            return handleResponse(res, 409, 'This transaction has already been recorded.');
        }
        const newTransaction = await transactionModel.createTransaction(req.body, req.user.id);
        handleResponse(res, 201, 'Transaction recorded successfully.', newTransaction);
    } catch (error) {
        console.error('Record Transaction Error:', error);
        handleResponse(res, 500, 'Server error while recording transaction.', { error: error.message });
    }
};

// @desc    Get all transactions for the logged-in user
// @route   GET /api/transactions/my
export const getMyTransactions = async (req, res) => {
    try {
        const transactions = await transactionModel.getTransactionsByUserId(req.user.id);
        handleResponse(res, 200, 'User transactions retrieved successfully.', transactions);
    } catch (error) {
        console.error('Get My Transactions Error:', error);
        handleResponse(res, 500, 'Server error while retrieving user transactions.', { error: error.message });
    }
};

// @desc    Get all transactions for a specific project
// @route   GET /api/transactions/project/:projectId
export const getProjectTransactions = async (req, res) => {
    try {
        const transactions = await transactionModel.getTransactionsByProjectId(req.params.projectId);
        handleResponse(res, 200, 'Project transactions retrieved successfully.', transactions);
    } catch (error) {
        console.error('Get Project Transactions Error:', error);
        handleResponse(res, 500, 'Server error while retrieving project transactions.', { error: error.message });
    }
};

// @desc    Get all dividend distribution transactions
// @route   GET /api/transactions/dividends
export const getDividendTransactions = async (req, res) => {
    try {
        const transactions = await transactionModel.getTransactionsByType('RewardDeposit');
        handleResponse(res, 200, 'Dividend transactions retrieved successfully.', transactions);
    } catch (error) {
        console.error('Get Dividend Transactions Error:', error);
        handleResponse(res, 500, 'Server error while retrieving dividend transactions.', { error: error.message });
    }
};