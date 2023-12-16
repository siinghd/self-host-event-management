import { customLogger } from './utils/methods';
import app from './app';
import connectWithDb from './config/db';

// connect with databases
connectWithDb();

// start server
app.listen(process.env.PORT, () => {
  customLogger('info', `Server is running at port: ${process.env.PORT}`);
});
