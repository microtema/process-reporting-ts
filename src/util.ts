import {EventData} from "./models";
import Mustache from 'mustache'

export function waitFor(delayInMs: number) {

    return new Promise(resolve => setTimeout(resolve, delayInMs));
}

export function parseExpression(expression: string | undefined, payload: any): string | null {

    if (!expression) {
        return null;
    }

    if (!payload) {
        return null;
    }

    let context = payload;

    if (payload instanceof Array) {
        context = {"items": payload};
    }

    return Mustache.render(expression, context)
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

    return parameters
}

export function getPayload(parameterNames: string[], methodArguments: any[]) {

    const payload: Record<string, any> = {}

    for (let index = 0; index < parameterNames.length; index++) {

        const param = parameterNames[index]

        payload[param] = methodArguments[index]
    }

    return payload;
}

export function serializePayload(payload: any, maskProperties: Record<string, string | Function> | undefined) {

    if (!payload) {
        return payload
    }

    if (typeof payload === 'string') {
        return payload
    }

    if (!maskProperties) {

        return JSON.stringify(payload)
    }

    return JSON.stringify(payload, (k, v) => {

        if (!maskProperties.hasOwnProperty(k)) {

            return v
        }

        const mask = maskProperties[k]

        if (typeof mask === 'function') {
            return mask(v)
        }

        return mask
    })
}

export function maskPassword(pwd: string | undefined | null) {
    return pwd !== undefined ? '*****' : pwd
}

export function maskBinary(binary: any[] | undefined | null) {
    return binary ? 'bytes [' + binary.length + ']' : binary
}
