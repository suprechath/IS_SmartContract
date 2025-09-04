// @param {object} res - The Express response object.
// @param {number} statusCode - The HTTP status code.
// @param {string} message - A descriptive message for the response.
// @param {object|null} data - The payload to send (optional).

export const handleResponse = (res, statusCode, message, data = null) => {
    res.status(statusCode).json({
        status: statusCode,
        message: message,
        data: data
    });
};