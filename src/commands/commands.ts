import { Command } from './command.js';
import { remind } from './remind.js';

const commands: Record<string, Command> = {
    remind
};

export default commands;
