import { getUserDetails } from '../lib/dao/user-dao';
import logger from '../utils/logger';

export default async (req, res, next) => {
    try {
        const t1 = new Date();
        let username;
        let password;
        if (req.headers && req.headers.username && req.headers.password) {
            username = req.headers.username;
            password = req.headers.password;
        };
        if (username && password) {
            // user is an object containing userId, isVerified
            const user = await getUserDetails({username, password}) || {};
            console.log('user: ', user);
            if (user) {
                req.user = user;
                req.userId = user.id || null;
            }
        }
        const t2 = new Date();
        logger.info('Time spent in auth module : ', t2.getTime() - t1.getTime());
        return next();
    } catch (ex) {
        logger.fatal('Exception in authorization module : ', ex);
        return res.status(500)
            .send('Something went wrong')
            .end();
    }
};
