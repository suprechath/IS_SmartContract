import { handleResponse } from '../utils/responseHandler.js';

export const validate = (schema) => (req, res, next) => {
    const dataToValidate = { ...req.params, ...req.body, ...req.query };
    const { error, value } = schema.validate(dataToValidate, {
        abortEarly: false,
        stripUnknown: true,
    });

    if (error) {
        return handleResponse(res, 400, error.details[0].message, error.details);
    }

    req.body = value;
    next();
};