import {
    InteractionResponseType,
    InteractionType,
    InteractionResponseFlags,
} from 'discord-interactions';
import * as DAPI from 'discord-api-types/v10';

interface Command {
    options?: DAPI.APIApplicationCommandOption[];
    execute: (
        interaction: DAPI.APIApplicationCommandInteraction,
        env: Env,
    ) => Promise<DAPI.APIInteractionResponse>;
    formSubmitHandler?: (
        interaction: DAPI.APIModalInteractionResponse,
        env: Env,
    ) => Promise<DAPI.APIInteractionResponse>;
    data: DAPI.RESTPostAPIApplicationCommandsJSONBody;
}
