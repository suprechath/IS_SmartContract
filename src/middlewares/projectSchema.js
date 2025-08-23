import Joi from 'joi';

export const createProjectSchema = Joi.object({
    title: Joi.string().min(3).max(255).required(),
    description: Joi.string().min(10).optional(),
    funding_goal: Joi.number().integer().positive().required().messages({
        'string.pattern.base': 'Funding goal must be a positive number.'
    }),
    funding_duration: Joi.number().integer().positive().required().messages({
        'number.base': 'Funding duration must be a positive number of seconds.'
    }),
    projected_roi: Joi.number().positive().optional(),
    projected_payback_period_months: Joi.number().positive().optional(),
    project_plan_url: Joi.string().uri().optional()
});

export const updateProjectSchema = Joi.object({
    projectId: Joi.string().uuid().required(),

    // All body fields are optional for a PATCH request
    title: Joi.string().min(5).max(255).optional(),
    description: Joi.string().min(20).optional(),
    funding_goal: Joi.string().pattern(/^[0-9]+$/).optional().messages({
        'string.pattern.base': 'Funding goal must be a positive number.'
    }),
    funding_duration: Joi.number().integer().positive().optional().messages({
        'number.base': 'Funding duration must be a positive number of seconds.'
    }),
    projected_roi: Joi.number().positive().optional(),
    projected_payback_period_months: Joi.number().positive().optional(),
    project_plan_url: Joi.string().uri().optional()
});

export const deployProjectTokenSchema = Joi.object({
    projectId: Joi.string().uuid().required()
});

export const deployProjectMgmtSchema = Joi.object({
    projectId: Joi.string().uuid().required(),
    tokenContractAddress: Joi.string()
        .pattern(/^0x[a-fA-F0-9]{40}$/)
        .required()
        .messages({
            'string.pattern.base': 'Token contract address must be a valid Ethereum address.',
            'any.required': 'Token contract address is required.',
        }),
});

export const onboardSchema = Joi.object({
    projectId: Joi.string().uuid().required(),
    tokenContractAddress: Joi.string()
        .pattern(/^0x[a-fA-F0-9]{40}$/)
        .required()
        .messages({
            'string.pattern.base': 'Token contract address must be a valid Ethereum address.',
            'any.required': 'Token contract address is required.',
        }),
    managementContractAddress: Joi.string()
        .pattern(/^0x[a-fA-F0-9]{40}$/)
        .required()
        .messages({
            'string.pattern.base': 'Management contract address must be a valid Ethereum address.',
            'any.required': 'Management contract address is required.',
        }),
});

export const prepareInvestmentSchema = Joi.object({
    projectId: Joi.string().uuid().required(),
    amount: Joi.number().positive().required()
});
