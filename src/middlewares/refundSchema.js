import Joi from 'joi';

export const getRefundSchema = Joi.object({
    projectId: Joi.string().uuid().required()
});

export const recordRefundSchema = Joi.object({
    projectId: Joi.string().uuid().required(),
    amount: Joi.number().negative().required(),
    transactionHash: Joi.string().length(66).required()
});