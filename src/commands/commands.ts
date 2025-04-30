import { Command } from './command.js';
import { remind, list_reminders } from './remind.js';
import { bored } from './bored.js';
import { getIntro, setIntro } from './bored.js';

const commands: Command[] = [remind, bored, list_reminders, getIntro, setIntro];

export default commands;
