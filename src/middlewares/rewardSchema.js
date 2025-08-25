import Joi from 'joi';

export const getClaimSchema = Joi.object({
    projectId: Joi.string().uuid().required()
});

export const recordClaimSchema = Joi.object({
    projectId: Joi.string().uuid().required(),
    amount: Joi.number().positive().required(),
    transactionHash: Joi.string().length(66).required()
});