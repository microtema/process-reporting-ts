import Axios from 'axios-observable'
import {ReportEvent} from './index';
import {ProcessReportingConfiguration} from './models';

export class ProcessReportingService {

    private readonly http: Axios;
    private readonly config: ProcessReportingConfiguration;

    constructor() {
        this.config = {
            disabled: (process.env.DISABLED || 'true') === 'true',
            processId: process.env.PROCESS_ID,
            processName: process.env.SERVER_NAME,
            processDescription: process.env.SERVER_DESCRIPTION,
            retentionTime: process.env.RETENTION_TIME,
            processVersion: process.env.PROCESS_VERSION || '1.0',
            server: process.env.SERVER,
            maxEventContentLimit: parseInt(process.env.START_ELEMENT_ID || '2000'),
            startElementId: process.env.START_ELEMENT_ID
        } as ProcessReportingConfiguration

        this.http = Axios.create({});
    }

    fireEvent(event: ReportEvent): void {

        if (!event.processId) {
            event.processVersion = this.config.processId
        }

        event.processVersion = this.config.processVersion
        event.eventTime = new Date()

        const url = this.config.server + '/api/report'

        console.log('post Event: ', url, JSON.stringify(event))
    }
}