import express from 'express';
import bodyParser from 'body-parser';
import config from 'config';
import http from 'http';
import cors from 'cors';
import routes from './routes/routes';
import requestLogger from './middlewares/req-logger';
import errorHandler from './middlewares/error-handler';
import authorization from './middlewares/authorization';
import logger from './utils/logger';

const { port } = config;
const router = express.Router();
const app = express();

const server = http.createServer(app);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true,
}));
app.use(requestLogger);
app.use(cors());

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,OPTIONS,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, ' +
    'Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers,Authorization, userid');
    next();
});
app.use(authorization);

app.use(router);


server.listen(port, () => {
    const serverHost = server.address().address;
    const serverPort = server.address().port;
    logger.info('Server listening at http://%s:%s', serverHost, serverPort);
});

routes(app);

// error handling middleware
app.use(errorHandler);

