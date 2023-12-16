/* eslint-disable no-process-exit */
import mongoose from 'mongoose';
import { customLogger } from '../utils/methods';

const connectWithDb = () => {
  mongoose
    .connect(process.env.DATABASE_URL as string)
    .then(() => customLogger('', 'DB GOT CONNECTED'))
    .catch((error: Error) => {
      customLogger('', 'DB CONNECTION ISSUES', error);
      process.exit(1);
    });
};

export = connectWithDb;
