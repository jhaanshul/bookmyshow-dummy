export default async (err, req, res, next) => {
    try {
        if (err.statusCode && !err.developerMessage) {
            switch (err.statusCode) {
            case 500: {
                err.developerMessage = 'Internal server error';
                break;
            }
            case 400: {
                err.developerMessage = 'Bad Request';
                break;
            }
            case 401: {
                err.developerMessage = 'Unauthorized';
                break;
            }
            case 403: {
                err.developerMessage = 'Forbidden';
                break;
            }
            case 404: {
                err.developerMessage = 'Entity not found';
                break;
            }
            case 426: {
                err.developerMessage = 'Login Required';
                err.message = 'Please login to continue';
                break;
            }
            default: {
                err.developerMessage = err.message || 'Unknown Error Occurred';
            }
            }
        }
        if (!err.userMessage && err.message) {
            err.userMessage = err.message;
        }
    } catch (ex) {
    // logger.fatal('Exception : ', ex);
        return res.status(500)
            .send(JSON.stringify({
                statusCode: 500,
                developerMessage: 'Internal server error',
                userMessage: 'Internal server error',
            }));
    }
    return res.status(err.statusCode || 500)
        .send(JSON.stringify(err));
};
