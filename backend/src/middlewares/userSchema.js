import Joi from "joi";

export const registerSchema = Joi.object({
    // Off-chain data
    full_name: Joi.string().min(3).required(),
    date_of_birth: Joi.date().iso().required(),
    address: Joi.string().min(3).required(),
    identification_number: Joi.string().min(5).required(),
    email: Joi.string().email().required(),
    // On-chain data
    wallet_address: Joi.string().length(42).required(),
    role: Joi.string().valid('Investor', 'Project Creator').required(),
});

export const updateUserSchema = Joi.object({
    full_name: Joi.string().min(3).optional().allow(''),
    address: Joi.string().min(10).optional().allow(''),
    email: Joi.string().email().optional().allow('')
}).min(1);
