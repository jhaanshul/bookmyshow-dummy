import util from 'util';
import logger from '../utils/logger';

export default async (req, res, next) => {
    const t1 = new Date();
    logger.info('request logging middleware called');
    // log all details of the request

    res.on('finish', () => {
        const t2 = new Date();

        logger.info('/***************************');
        logger.info('logging request info in info middleware');
        logger.info(`Accessed URL: ${req.originalUrl}`);
        logger.info(`Method: ${req.method}`);
        logger.info(`Request query: ${util.inspect(req.query, false, null)}`);
        logger.info(`Request body: ${util.inspect(req.body, false, null)}`);
        logger.info(`Request headers: ${util.inspect(req.headers, false, null)}`);
        logger.info(`sent statusCode: ${res.statusCode}`);
        logger.info('******************************/');
        const userId = req.headers ? req.headers.userId : null;
        // add a check to log only info and no errors.
        logger.info(res.statusCode, parseInt(res.statusCode, 10));
        if (res.statusCode && parseInt(res.statusCode, 10) < 300) {
            logger.info({
                URL: req.originalUrl,
                method: req.method,
                query: req.query,
                params: req.params,
                body: req.body,
                userId,
                statusCode: res.statusCode,
                headers: req.headers
            });
        }
    });
    const t2 = new Date();
    logger.info('Time spent in req logging module : ', t2.getTime() - t1.getTime());
    return next();
};
