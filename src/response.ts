import { InteractionResponseFlags, InteractionResponseType } from 'discord-interactions';

export class JsonResponse extends Response {
    constructor(body: any, init?: ResponseInit) {
        const jsonBody = JSON.stringify(body);
        init = init ?? {
            headers: {
                'content-type': 'application/json;charset=UTF-8',
            },
        };
        super(jsonBody, init);
    }
}
