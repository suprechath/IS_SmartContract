import Joi from 'joi';

export const prepareInvestmentSchema = Joi.object({
    projectId: Joi.string().uuid().required(),
    amount: Joi.number().positive().required()
});

export const recordInvestmentSchema = Joi.object({
    project_id: Joi.string().uuid().required(),
    amount: Joi.number().positive().required(),
    transaction_hash: Joi.string().length(66).required()
});