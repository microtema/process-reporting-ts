import {v4 as uuidv4} from 'uuid';

import {
    ProcessReportingService,
    ReportEvent,
    ReportStatus,
    getParameters,
    waitFor,
    getReferenceId,
    BpmnElementOptions,
    EventData
} from './index';

const processReportingService = new ProcessReportingService()

export function BpmnElement(options: BpmnElementOptions): DecoratorFunction {

    let transactionId:string | undefined;
    if (options.startEvent) {
       transactionId = uuidv4()
    }

    /**
     * target: The prototype of the class (Object)
     * propertyKey: The name of the method (string | symbol).
     * descriptor: A TypedPropertyDescriptor — see the type, leveraging the Object.defineProperty under the hood.
     *
     * NOTE: It's very important here we do not use arrow function otherwise 'this' will be messed up due
     * to the nature how arrow function defines this inside.
     *
     */
    return function (target: Record<string, any>, propertyKey: string, descriptor: TypedPropertyDescriptor<any>) {

        const originalFunc = descriptor.value;

        descriptor.value = function async(...args: any[]) {

            //  console.log(`Start ${propertyKey} function`, `${this.constructor.name}.${propertyKey}`);

            const params = getParameters(originalFunc)

            const payload = getPayload(params, args, options.startEvent === true)
            const referenceId = getReferenceId(payload, options.keyExpression)

            const reportEvent = {
                payload: JSON.stringify(payload),
                referenceId: referenceId,
                status: ReportStatus.STARTED,
                transactionId: transactionId,
                eventTime: new Date()
            } as ReportEvent

            return descriptorFunction(originalFunc, this, args, options, reportEvent, 0)

            // filter is parameter names: to not log them

            //  logger.debug(`${propertyKey} function Input Names is ${params}`);
            //  logger.debug(`${propertyKey} function Input Parameters is ${args}`);
        };

        return descriptor;
    }
}

function publishEvent(options: BpmnElementOptions, reportEvent: ReportEvent) {

    reportEvent.elementId = options.bpmnElementId

    if (options.processId) {
        reportEvent.processId = options.processId
    }

    reportEvent.startEvent = options.startEvent === true
    reportEvent.endEvent = options.endEvent === true

    processReportingService.fireEvent(reportEvent)
}

async function descriptorFunction(originalFunc: Function, scope: any, args: any, options: BpmnElementOptions, reportEvent: ReportEvent, retryCount: number) {

    publishEvent(options, reportEvent)

    try {

        // console.log('args', args)
        const answer = originalFunc.apply(scope, args)
        // console.log('answer', answer)

        const payload = JSON.stringify(answer)
        const status = ReportStatus.COMPLETED

        const newReportEvent = {...reportEvent, ...{payload, status}}

        publishEvent(options, newReportEvent);

        return answer;
    } catch (e: any) {

        const retries = Math.max(0, options.retries || 0)
        const delay = Math.max(250, options.delay || 0)

        const newReportEvent = {...reportEvent, ...{errorMessage: e}}

        if (options.suppressException) {

            newReportEvent.status = ReportStatus.WARNING

            publishEvent(options, newReportEvent)
            return null
        }

        if (retryCount == retries) {

            newReportEvent.status = ReportStatus.ERROR
            publishEvent(options, newReportEvent)
            return null
        }

        await waitFor(delay);

        newReportEvent.status = ReportStatus.RESTARTED

        return descriptorFunction(originalFunc, scope, args, options, newReportEvent, retryCount + 1)
    }
}

export function getPayload(parameterNames: string[], methodArguments: any[], startEvent: boolean) {

    const payload: any = {}

    for (let index = 0; index < parameterNames.length; index++) {

        const param = parameterNames[index];
        let methodArgument = methodArguments[index];

        if (startEvent) {

            // This is entry point on Controller
            const eventData = eventDataConverter(methodArgument);

            // enrichEventData(eventData);

            // ReportingLocalContextHolder.set(eventData);
            // ReportingContextHolder.set(eventData);

            // return eventData.eventAttachment || eventData.eventPayload

        } else if (isByteArray(methodArgument)) {

            // methodArgument = "Binary [ " + FileUtils.byteCountToDisplaySize(length) + " ]";
            methodArgument = "Binary [ " + methodArgument.byteLength + " ]";
        }

        payload[param] = methodArgument
    }

    return payload;
}

function isByteArray(array: any) {

    return array && array.byteLength !== undefined;
}

function eventDataConverter(methodArguments: any[]): EventData {

    return {
        eventAttachment: methodArguments
    } as EventData
}

export type DecoratorFunction = (target: Record<string, any>, propertyKey: string, descriptor: TypedPropertyDescriptor<any>) => TypedPropertyDescriptor<any>;