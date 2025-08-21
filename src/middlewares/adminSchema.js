import Joi from 'joi';

export const reviewProjectSchema = Joi.object({
    projectId: Joi.string().uuid().required(),
    status: Joi.string().valid('Approved', 'Rejected').required()
});