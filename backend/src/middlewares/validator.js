import { handleResponse } from '../utils/responseHandler.js';

export const validate = (schema) => (req, res, next) => {
    const dataToValidate = { ...req.params, ...req.body, ...req.query };
    const { error } = schema.validate(dataToValidate);

    if (error) {
        return handleResponse(res, 400, error.details[0].message, error.details[0]);
    }
    next();
};