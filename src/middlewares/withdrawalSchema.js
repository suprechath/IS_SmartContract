import Joi from 'joi';

export const getWithdrawalSchema = Joi.object({
    projectId: Joi.string().uuid().required()
});

export const recordWithdrawalSchema = Joi.object({
    projectId: Joi.string().uuid().required(),
    transactionHash: Joi.string().length(66).pattern(/^0x[a-fA-F0-9]{64}$/).required().messages({
        'string.pattern.base': 'Transaction hash must be a valid 66-character hexadecimal string starting with "0x".'
    })
});