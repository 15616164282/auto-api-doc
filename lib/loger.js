import chalk from "chalk";

export const error = (log) => {
  console.log(chalk.bold.red(`[auto_api]: ${log}`));
};

export const success = (log) => {
  console.log(chalk.bold.green(`[auto_api]: ${log}`));
};
