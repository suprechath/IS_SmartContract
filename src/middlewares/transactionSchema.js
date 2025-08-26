// src/middlewares/transactionSchema.js
import Joi from 'joi';

export const recordTransactionSchema = Joi.object({
    project_onchain_id: Joi.string().uuid().required(),
    USDC_amount: Joi.number().positive().required(),
    transaction_type: Joi.string().valid(
        'Investment',
        'Withdrawal',
        'RewardDeposit',
        'RewardClaim',
        'Refund'
    ).required(),
    transaction_hash: Joi.string().length(66).pattern(/^0x[a-fA-F0-9]{64}$/).required(),
    related_transaction_hash: Joi.string().length(66).pattern(/^0x[a-fA-F0-9]{64}$/).optional(),
    platform_fee: Joi.number().min(0).optional().default(0)
});

export const getProjectTransactionsSchema = Joi.object({
    projectId: Joi.string().uuid().required(),
    transaction_hash: Joi.string().length(66).pattern(/^0x[a-fA-F0-9]{64}$/).optional(),
    project_onchain_id: Joi.string().uuid().optional()
});