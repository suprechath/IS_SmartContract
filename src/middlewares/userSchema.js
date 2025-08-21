import Joi from "joi";

export const registerSchema = Joi.object({
    wallet_address: Joi.string().length(42).required(),
    name: Joi.string().min(3).required(),
    email: Joi.string().email().required(),
    nonce: Joi.string().required(),
    role: Joi.string().valid('Investor', 'Project Creator').required()
});

export const updateUserSchema = Joi.object({
    name: Joi.string().min(3).optional(),
    email: Joi.string().email().optional()
});
