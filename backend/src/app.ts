import express from 'express';
import cookieParser from 'cookie-parser';
import fileUpload from 'express-fileupload';
import cors from 'cors';
import 'dotenv/config';
// for swagger documentation
import * as swaggerUi from 'swagger-ui-express';
import * as YAML from 'yamljs';

// import all routes here
import helmet from 'helmet';
import user from './routes/user.route';
import payment from './routes/payment.route';
import backblaze from './routes/backblaze.route';
import notification from './routes/notification.route';

import errorHandler from './middlewares/errorHanlder';

const app: express.Application = express();

const swaggerDocument = YAML.load('./swagger.yaml');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// regular middleware
app.use(express.json({ limit: '50mb' }));
app.use(
  express.urlencoded({
    extended: true,
    limit: '50mb',
  })
);
// cookies and file middleware
app.use(cookieParser());
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: '/tmp/',
  })
);
// helment
app.use(helmet());

// cors middleware
const corsOptions: cors.CorsOptions = {
  credentials: true,
  origin: process.env.WHITE_LIST,
};
app.use(cors(corsOptions));
// router middleware
app.use('/api/v1', user);
app.use('/api/v1', payment);
app.use('/api/v1', notification);
app.use('/api/v1', backblaze);
// error handler middleware
app.use(errorHandler);
// export app js
export = app;
