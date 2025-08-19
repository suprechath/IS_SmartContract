import Joi from 'joi';
import { handleResponse } from '../utils/responseHandler.js';

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
    wallet_address: Joi.string()
        .pattern(/^0x[a-fA-F0-9]{40}$/)
        .required()
        .messages({
            'string.pattern.base': 'Wallet address must be a valid Ethereum address.',
            'any.required': 'Wallet address is required.',
        }),
    signature: Joi.string()
        .required()
        .messages({
            'any.required': 'Signature is required.',
        }),
});

export const validateAuth = (schema) => (req, res, next) => {
    const dataToValidate = { ...req.params, ...req.body };
    const { error } = schema.validate(dataToValidate);

    if (error) {
        return handleResponse(res, 400, error.details[0].message, error.details[0]);
    }
    next();
};