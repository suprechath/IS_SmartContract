import Joi from 'joi';

export const prepareDepositSchema = Joi.object({
    projectId: Joi.string().uuid().required(),
    amount: Joi.number().positive().required()
});

export const recordDepositSchema = Joi.object({
    projectId: Joi.string().uuid().required(),
    amount: Joi.number().positive().required(),
    transactionHash: Joi.string().length(66).pattern(/^0x[a-fA-F0-9]{64}$/).required()
});