import chalk from "chalk";
// const chalk = require("chalk");
import {command} from "./getConfig.js";

export const error = (log) => {
  console.log(chalk.bold.red(`[auto_${command}]: ${log}`));
};

export const success = (log) => {
  console.log(chalk.bold.green(`[auto_${command}]: ${log}`));
};
