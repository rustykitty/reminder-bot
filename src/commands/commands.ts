import { Command } from './command.js';
import { remind } from './remind.js';
import { bored } from './bored.js';

const commands: Record<string, Command> = {
    remind,
    bored,
};

export default commands;
