import {fnDecorator} from 'pure-function-decorator'
import axios from 'axios'
import {v4 as uuidv4} from 'uuid'
import {BpmnElementOptions, ReportEvent, ReportStatus} from './models'
import {getParameters, getPayload, parseExpression, serializePayload} from './util'

const activities: Record<string, BpmnElementOptions> = {}

export const descriptorFunction = (origFunction: Function, bpmnElementOptions: BpmnElementOptions) => {

    /**
     * NOTE: It's very important here we do not use arrow function otherwise 'this' will be messed up due
     * to the nature how arrow function defines this inside.
     */
    return (async function (...args: []) {

        const params = getParameters(origFunction)
        const payload = getPayload(params, args)

        const transactionId = parseExpression(bpmnElementOptions.instanceIdExpression, payload)
        const referenceId = parseExpression(bpmnElementOptions.keyExpression, payload)
        const multipleInstanceIndex = parseExpression(bpmnElementOptions.multipleInstance, payload)
        const startedBy = parseExpression(bpmnElementOptions.startedByExpression, payload)
        const retryCount = 0

        const reportEvent = {
            payload: serializePayload(payload, bpmnElementOptions.maskParams),
            referenceId: referenceId,
            status: ReportStatus.STARTED,
            transactionId: transactionId,
            multipleInstanceIndex: (multipleInstanceIndex || 0) + '.' + (retryCount || 0),
            startedBy
        } as ReportEvent

        publishEvent(reportEvent, bpmnElementOptions)

        try {

            const response = await origFunction.apply(null, args)

            publishEvent({
                ...reportEvent, ...{
                    status: ReportStatus.COMPLETED,
                    payload: serializePayload(response, bpmnElementOptions.maskParams)
                }
            }, bpmnElementOptions)

            return response
        } catch (e) {

            publishEvent({
                ...reportEvent, ...{
                    status: ReportStatus.ERROR,
                    errorMessage: e + '',
                    payload: undefined
                }
            }, bpmnElementOptions)

            throw e
        }
    })
}

export const activityInterceptor = (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {

    const origFunction = descriptor.value
    const bpmnElementOptions = activities[origFunction.name]

    descriptor.value = descriptorFunction(origFunction, bpmnElementOptions)

    return descriptor
}

export function publishEvent(reportEvent: ReportEvent, bpmnElementOptions: BpmnElementOptions) {

    reportEvent.elementId = bpmnElementOptions.id as string

    if (bpmnElementOptions.processId) {
        reportEvent.processId = bpmnElementOptions.processId
    }

    reportEvent.startEvent = bpmnElementOptions.startEvent === true
    reportEvent.endEvent = bpmnElementOptions.endEvent === true
    reportEvent.executionId = uuidv4()

    if (reportEvent.startEvent) {

        reportEvent.referenceType = process.env.REPORTING_EVENT_CATEGORY
    } else if (reportEvent.endEvent && reportEvent.status === ReportStatus.COMPLETED) {

        reportEvent.status = ReportStatus.PROCESS_COMPLETED
    }

    const {transactionId} = reportEvent

    const [parentTransactionId] = transactionId.split(':')

    reportEvent.transactionId = parentTransactionId

    fireEvent(reportEvent)
}

export const fireEvent = (event: ReportEvent) => {

    const url = process.env.REPORTING_SERVER + '/reporting-service/rest/api/report'

    if (!event.processId) {
        event.processId = process.env.REPORTING_PROCESS_ID as string
    }

    event.eventTime = new Date()
    event.processVersion = process.env.REPORTING_PROCESS_VERSION as string
    event.startedBy = event.startedBy || 'system'

    axios.post(url, event)
        .catch(it => console.log('Unable to post Process [' + event.processId + '] event [' + event.elementId + ']!'))
}


export default <T>(activityHandler: any, options?: BpmnElementOptions):T => {

    activities[activityHandler.name] = options || {id: activityHandler.name}

    // override id from function name
    activities[activityHandler.name].id = activities[activityHandler.name].id || activityHandler.name
    activities[activityHandler.name].instanceIdExpression = activities[activityHandler.name].instanceIdExpression || '{{ context.triggerMetadata.instanceId }}'
    activities[activityHandler.name].startedByExpression = activities[activityHandler.name].startedByExpression || '{{ context.triggerMetadata.startedBy }}'

    return fnDecorator(activityInterceptor, activityHandler) as T
}