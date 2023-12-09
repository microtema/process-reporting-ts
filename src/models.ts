export enum ReportStatus {
    QUEUED = 'QUEUED',
    STARTED = 'STARTED',
    RESTARTED = 'RESTARTED',
    COMPLETED = 'COMPLETED',
    WARNING = 'WARNING',
    ERROR = 'ERROR'
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
    payload: string;

    /**
     * Event meta information
     */
    params: any;

    startEvent: boolean;

    endEvent: boolean;
}

export interface BpmnElementOptions {
    id: string,
    processId?: string,
    retries?: number,
    delay?: number,
    suppressException?: boolean,
    startEvent?: boolean,
    endEvent?: boolean,
    keyExpression?:string
}

export interface ProcessReportingConfiguration {

    disabled: boolean;

    processId: string;

    processName: string;

    processDescription: string;

    retentionTime: string;

    processVersion: string;

    server: string;

    maxEventContentLimit: number;//2000;

    startElementId: string;
}

export interface EventData {
    /**
     * Unique ID of event, UUID
     */
    eventId: string

    /**
     * Who trigger the event, [user, technical-user, machine, ...]
     */
    eventTriggeredBy: string,

    /**
     * Category of event, [user, invoice, billing, ...]
     */
    eventCategory: string,

    /**
     * Version of Event
     */
    eventVersion: string,

    /**
     * Timestamp of event
     */
    eventTriggeredAt: Date,

    /**
     * Name of event, [UserCreated, UserDeleted, UserUpdated, ...]
     */
    eventName: string,

    /**
     * JSON as String to be converted to generic type, or any generic type that is serializable
     */
    eventAttachment: any,

    /**
     * JSON as String to be converted to generic type, or any generic type that is serializable
     */
    eventPayload: any,

    /**
     * Origin of event, [application-a, system-b, component-c]
     */
    eventOrigin: string,

    /**
     * Technical meta information of retry the same event
     */
    eventRetryCount: number,

    /**
     * Unique execution id of event, same event id may have different execution id
     */
    eventExecutionId: string
}