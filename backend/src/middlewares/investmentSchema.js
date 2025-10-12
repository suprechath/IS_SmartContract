import Joi from 'joi';

export const prepareInvestmentSchema = Joi.object({
    projectId: Joi.string().uuid().required(),
    amount: Joi.number().positive().required()
});

export const investmentConfirmSchema = Joi.object({
    projectId: Joi.string().uuid().required(),
    transactionHash: Joi.string().pattern(/^0x[a-fA-F0-9]{64}$/).required()
});