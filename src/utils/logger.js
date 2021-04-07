import log4js from 'log4js';
import config from 'config';

log4js.configure({
    appenders: { console: { type: 'console'} },
    categories: { default: { appenders: ['console'], level: 'info' },
    cheese: { appenders: ['console'], level: 'error' } }
});

const logger = log4js.getLogger(config.loggerServiceName);

export default logger;
