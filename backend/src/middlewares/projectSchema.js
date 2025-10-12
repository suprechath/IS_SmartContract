import Joi from 'joi';

export const createProjectSchema = Joi.object({
    // Off-chain fields
    title: Joi.string().min(3).max(255).required(),
    project_overview: Joi.string().min(10).optional(),
    proposed_solution: Joi.string().optional(),
    location: Joi.string().required(),
    cover_image_url: Joi.string().uri().optional(),
    tags: Joi.array().items(Joi.string()).required(),
    co2_reduction: Joi.number().positive().optional(),
    projected_roi: Joi.number().positive().required(),
    projected_payback_period_months: Joi.number().positive().optional(),
    project_plan_url: Joi.string().uri().required(),
    technical_specifications_urls: Joi.array().items(Joi.string().uri()).optional(),
    third_party_verification_urls: Joi.array().items(Joi.string().uri()).optional(),
    // On-chain fields
    funding_USDC_goal: Joi.number().integer().positive().required().messages({
        'number.base': 'Funding goal must be a positive number.'
    }),
    funding_duration_second: Joi.number().integer().positive().required().messages({
        'number.base': 'Funding duration must be a positive number of seconds.'
    }),
    platform_fee_percentage: Joi.number().integer().min(0).max(10000).optional().default(500), // Default to 5%
    reward_fee_percentage: Joi.number().integer().min(0).max(10000).optional().default(300), // Default to 3%
    usdc_contract_address: Joi.string()
        .pattern(/^0x[a-fA-F0-9]{40}$/)
        .optional()
});

export const updateProjectSchema = Joi.object({
    projectId: Joi.string().uuid().required(),
    // Off-chain fields (optional)
    title: Joi.string().min(3).max(255).optional(),
    project_overview: Joi.string().min(10).optional(),
    proposed_solution: Joi.string().optional(),
    location: Joi.string().optional(),
    cover_image_url: Joi.string().uri().optional(),
    tags: Joi.array().items(Joi.string()).optional(),
    CO2_reduction: Joi.number().positive().optional(),
    projected_roi: Joi.number().positive().optional(),
    projected_payback_period_months: Joi.number().positive().optional(),
    project_plan_url: Joi.string().uri().optional(),
    technical_specifications_urls: Joi.array().items(Joi.string().uri()).optional(),
    third_party_verification_urls: Joi.array().items(Joi.string().uri()).optional(),
    // On-chain fields (optional)
    funding_USDC_goal: Joi.number().integer().positive().optional().messages({
        'number.base': 'Funding goal must be a positive number.'
    }),
    funding_duration_second: Joi.number().integer().positive().optional().messages({
        'number.base': 'Funding duration must be a positive number of seconds.'
    }),
    platform_fee_percentage: Joi.number().integer().min(0).max(10000).optional(),
    reward_fee_percentage: Joi.number().integer().min(0).max(10000).optional(),
});

export const prepareOnchainDeploymentSchema = Joi.object({
    projectId: Joi.string().uuid().required()
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
        })
});

export const prepareMintTokensSchema = Joi.object({
    projectId: Joi.string().uuid().required(),
    batchLimit: Joi.number().integer().positive().required().messages({
        'number.base': 'Batch limit must be a positive number.'
    })
});
