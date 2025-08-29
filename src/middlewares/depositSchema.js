import Joi from 'joi';

export const prepareDepositSchema = Joi.object({
    projectId: Joi.string().uuid().required(),
    amount: Joi.number().positive().required()
});