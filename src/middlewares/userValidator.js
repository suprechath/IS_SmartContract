import Joi from "joi";
import { handleResponse } from '../utils/responseHandler.js';

const registerSchema = Joi.object({
    wallet_address: Joi.string().length(42).required(),
    name: Joi.string().min(3).required(),
    email: Joi.string().email().required(),
    nonce: Joi.string().required(),
    role: Joi.string().valid('Investor', 'Project Creator').required()
});

export const validateRegisterInput = (req, res, next) => {
    const { error } = registerSchema.validate(req.body);
    if (error) {
        return handleResponse(res, 400, error.details[0].message, error.details[0].context.value);
    }
    next();
}

