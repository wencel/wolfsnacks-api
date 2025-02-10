import chalk from 'chalk';
import app from './app.js';

const port = process.env.PORT;

app.listen(port, () => {
  console.log(chalk.bgGreen(`App running in port ${port}`));
});
