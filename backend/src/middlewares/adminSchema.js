import Joi from 'joi';

export const reviewProjectSchema = Joi.object({
    projectId: Joi.string().uuid().required(),
    status: Joi.string().valid('Approved', 'Rejected').required()
});

export const recordFactorySchema = Joi.object({
    factoryAddress: Joi.string()
        .pattern(/^0x[a-fA-F0-9]{40}$/)
        .required()
        .messages({
            'string.pattern.base': 'factoryAddress must be a valid Ethereum address.',
            'any.required': 'factoryAddress is required.',
        }),
});

export const recordSchema = Joi.object({
    recordKey: Joi.string().required(),
    address: Joi.string()
        // .pattern(/^0x[a-fA-F0-9]{40}$/)
        .required()
        // .messages({
        //     'string.pattern.base': 'factoryAddress must be a valid Ethereum address.',
        //     'any.required': 'factoryAddress is required.',
        // }),
});