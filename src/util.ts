import {EventData} from "./models";
import Mustache from 'mustache'

export function waitFor(delayInMs: number) {

    return new Promise(resolve => setTimeout(resolve, delayInMs));
}

export function getParameters(func: Function) {

    const str: string = func.toString();

    const startBracket = str.indexOf('(');
    if (startBracket < 0) {
        return [];
    }

    const endBracket = str.indexOf(')', startBracket);
    if (endBracket < 0) {
        return [];
    }

    const paramsString = str.substring(startBracket + 1, endBracket);
    if (paramsString.length === 0) {
        return [];
    }

    const parameters = paramsString.split(',').map(e => e.trim());

    for (let index = 0; index < parameters.length; index++) {
        parameters[index] = parameters[index].split(' ')[0]
        parameters[index] = parameters[index].replace('...', '')
    }

    return parameters;
}

export function getReferenceId(payload: any, keyExpression?: string) {

   // console.log("keyExpression: ", keyExpression, payload)

    if (!payload) {
        return null;
    }

    if (!keyExpression) {
        return null;
    }

    let context = payload;

    if (payload instanceof Array) {
        context = {"items": payload};
    }

    return Mustache.render(keyExpression, context)
}
