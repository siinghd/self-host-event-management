import app from './app';
import connectWithDb from './config/db';

// connect with databases
connectWithDb();

// start server
app.listen(process.env.PORT, () => {
  console.log(`Server is running at port: ${process.env.PORT}`);
});
