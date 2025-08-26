import Joi from 'joi';

export const nonceSchema = Joi.object({
    walletAddress: Joi.string()
        .pattern(/^0x[a-fA-F0-9]{40}$/) // Ethereum address pattern
        .required()
        .messages({
            'string.pattern.base': 'Wallet address must be a valid Ethereum address.',
            'any.required': 'Wallet address is required.',
        }),
});

export const verifySchema = Joi.object({
    nonceToken: Joi.string()
        .regex(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_.+/=]*$/) // Standard JWT pattern
        .required()
        .messages({
            'string.pattern.base': 'A valid nonce token is required.',
            'any.required': 'The nonceToken is required.',
        }),
    signature: Joi.string()
        .required()
        .messages({
            'any.required': 'Signature is required.',
        }),
});