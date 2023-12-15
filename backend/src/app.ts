import express from 'express';
import cookieParser from 'cookie-parser';
import fileUpload from 'express-fileupload';
import cors from 'cors';
import 'dotenv/config';
// for swagger documentation
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';

// import all routes here
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
// cors middleware
const whitelist = [
  'https://honpetechnology.avrean.net',
  'http://localhost:3000',
  'http://localhost:3206',
  'http://localhost:3222',
];

const corsOptions: cors.CorsOptions = {
  credentials: true,
  origin: whitelist,
};
app.use(cors(corsOptions));
// router middleware
app.use('/api/v1', user);
app.use('/api/v1', payment);
app.use('/api/v1', notification);
// error handler middleware
app.use(errorHandler);
// export app js
export = app;
