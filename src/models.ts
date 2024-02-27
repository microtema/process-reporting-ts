export enum ReportStatus {
    /**
     * Process/Activity has been queued
     */
    QUEUED = 'QUEUED',
    /**
     * Process/Activity has been started
     */
    STARTED = 'STARTED',
    /**
     * Process/Activity has been restarted
     */
    RESTARTED = 'RESTARTED',
    /**
     * Process/Activity has been completed
     */
    COMPLETED = 'COMPLETED',
    /**
     * Process/Activity has been terminated and should be deleted
     */
    TERMINATED = 'TERMINATED',

    PROCESS_COMPLETED = 'PROCESS_COMPLETED',
    /**
     * Process/Activity has warning, but will not stop the process
     */
    WARNING = 'WARNING',
    /**
     * Process/Activity has error and the process will be terminated
     */
    ERROR = 'ERROR',
}

export interface ReportEvent {
    /**
     * Camunda Element id
     */
    elementId: string;

    transactionId: string;

    /**
     * Camunda process id
     */
    processId: string;

    /**
     * Unique Execution id
     */
    executionId: string;

    /**
     * Camunda process version 1.0
     */
    processVersion: string;

    /**
     * Error message
     */
    errorMessage?: string;

    /**
     * Event status, [STARTED, COMPLETED, ERROR, ...]
     */
    status: ReportStatus;

    /**
     * Event timestamp
     */
    eventTime: Date;

    /**
     * Technical meta information of retry the same event
     */
    retryCount?: number;

    /**
     * NOTE: if size of payload or error message is longer then supported, we need to chunked in multiple parts
     */
    partCount: number;

    /**
     * Reference id/key of this event
     */
    referenceId?: string;

    /**
     * Bounded Context of this event, [user, invoice, billing, ...]
     */
    referenceType?: string;

    /**
     * Who trigger the event, [user, technical-user, machine, ...]
     */
    startedBy: string;

    /**
     * Multiple Instance Count for the same activity butt different data
     */
    multipleInstanceIndex: string;

    /**
     * Serialized JSON payload
     */
    payload?: string;

    /**
     * Event meta information
     */
    params: any;

    startEvent: boolean;

    endEvent: boolean;
}

export interface BpmnElementOptions {
    maskParams?: Record<string, string | Function>
    id?: string
    processId?: string
    multipleInstance?: string
    retries?: number
    delay?: number
    suppressException?: boolean
    startEvent?: boolean
    endEvent?: boolean
    instanceIdExpression?: string | Function
    keyExpression?: string | Function
    startedByExpression?: string | Function
    transactionIdExpression?: string | Function
}

export interface ProcessReportingConfiguration {
    disabled: boolean
    processId: string
    processName: string
    processDescription: string
    retentionTime: string
    processVersion: string
    server: string
    maxEventContentLimit: number //2000;
    startElementId: string
}

export interface EventData {
    /**
     * Unique ID of event, UUID
     */
    eventId: string

    /**
     * Who trigger the event, [user, technical-user, machine, ...]
     */
    eventTriggeredBy: string

    /**
     * Category of event, [user, invoice, billing, ...]
     */
    eventCategory: string

    /**
     * Version of Event
     */
    eventVersion: string

    /**
     * Timestamp of event
     */
    eventTriggeredAt: Date

    /**
     * Name of event, [UserCreated, UserDeleted, UserUpdated, ...]
     */
    eventName: string

    /**
     * JSON as String to be converted to generic type, or any generic type that is serializable
     */
    eventAttachment: any

    /**
     * JSON as String to be converted to generic type, or any generic type that is serializable
     */
    eventPayload: any

    /**
     * Origin of event, [application-a, system-b, component-c]
     */
    eventOrigin: string

    /**
     * Technical meta information of retry the same event
     */
    eventRetryCount: number

    /**
     * Unique execution id of event, same event id may have different execution id
     */
    eventExecutionId: string
}