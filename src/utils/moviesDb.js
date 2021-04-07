import bluebird from 'bluebird';
import mysql from 'mysql';
import config from 'config';
import logger from './logger';

// const poolConfig = {
//     host: config.moviesDb.host,
//     port: process.env.MYSQL_PORT || config.moviesDb.port,
//     user: config.moviesDb.user,
//     password: process.env.MYSQL_PASSWORD || config.moviesDb.password,
//     database: config.moviesDb.database
// };

const poolConfig = {
    host: process.env.MYSQL_HOST,
    database: process.env.MYSQL_DATABASE,
    port: process.env.MYSQL_PORT,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    connectionLimit: 10
}

logger.info('poolConfig: ', poolConfig);
const moviesDb = mysql.createPool(poolConfig);
bluebird.promisifyAll(moviesDb);

moviesDb.runQuery = async function (sql, params) {
    try {
        const t1 = new Date();
        const result = await moviesDb.queryAsync(sql, params);
        const t2 = new Date();
        logger.info('time taken in sql query (ms) : ', t2.getTime() - t1.getTime());
        return result;
    } catch (ex) {
        throw new Error(JSON.stringify({
            statusCode: 500,
            sqlCode: ex.code,
            message: ex.sqlMessage || 'Something went wrong'
        }));
    }
};

moviesDb.on('acquire', (connection) => {
    // logger.info('Connection %d acquired', connection.threadId);
});

moviesDb.on('release', (connection) => {
    // logger.info('Connection %d released', connection.threadId);
});

moviesDb.on('enqueue', () => {
    // logger.info('Waiting for available connection slot');
});

moviesDb.on('error', (err) => {
    logger.fatal('moviesDb error ', err.code); // 'ER_BAD_DB_ERROR'
});

(async function () {
    try {
        await moviesDb.queryAsync('select 1', []);
        logger.info(`Connected to moviesDb: ${poolConfig.host}`);
    } catch (ex) {
        logger.error(`Error connecting to moviesDb :  ${ex}`);
        process.exit(0);
    }
}());

export default moviesDb;