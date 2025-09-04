import Joi from 'joi';

export const prepareInvestmentSchema = Joi.object({
    projectId: Joi.string().uuid().required(),
    amount: Joi.number().positive().required()
});