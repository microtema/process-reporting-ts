import interceptHandler from './aop'
import {ReportEvent, ReportStatus} from "./models";
import axios from 'axios'

jest.mock('axios')
const mockedAxios = axios as jest.Mocked<typeof axios>

describe("Intercept on function", () => {

    const events:ReportEvent[] = []

    beforeEach(() => {

        events.length = 0

        mockedAxios.post.mockImplementation((url:string, data:any) => {
            events.push(data)
            return Promise.resolve(data)
        })

        process.env.REPORTING_SERVER = 'http://localhost:8080'
        process.env.REPORTING_PROCESS_ID = 'process-id'
        process.env.REPORTING_PROCESS_VERSION = '1.0'
        process.env.REPORTING_EVENT_CATEGORY = 'UnitTest'
    })

    afterEach(() => {

        jest.resetAllMocks();
    });

    test('should complete', async () => {

        const fn = function StartEvent_1(input:any) {

            return {output: input}
        }

        const sut = interceptHandler(fn, {
            startEvent: true,
            instanceIdExpression: '{{ input }}',
            keyExpression: '{{ input }}'
        })

        // GIven
        const input = 'foo'

        const answer = await sut(input)

        expect(answer).toEqual({output: input})

        expect(events.length).toEqual(2)
        expect(mockedAxios.post).toHaveBeenCalledWith('http://localhost:8080/reporting-service/rest/api/report', events[0])
        expect(mockedAxios.post).toHaveBeenCalledWith('http://localhost:8080/reporting-service/rest/api/report', events[1])

        expect(events[0].status).toEqual(ReportStatus.STARTED)
        expect(events[0].payload).toEqual(JSON.stringify({input}))
        expect(events[0].elementId).toEqual('StartEvent_1')
        expect(events[0].transactionId).toEqual(input)
        expect(events[0].referenceType).toEqual(process.env.REPORTING_EVENT_CATEGORY)
        expect(events[0].referenceId).toEqual(input)
        expect(events[0].startEvent).toEqual(true)
        expect(events[0].endEvent).toEqual(false)
        expect(events[0].multipleInstanceIndex).toEqual('0.0')
        expect(events[0].errorMessage).not.toBeDefined()
        expect(events[0].processId).toEqual(process.env.REPORTING_PROCESS_ID)
        expect(events[0].processVersion).toEqual(process.env.REPORTING_PROCESS_VERSION)
        expect(events[0].executionId).toBeDefined()
        expect(events[0].eventTime).toBeDefined()
        expect(events[0].startedBy).toEqual('system')

        expect(events[1].status).toEqual(ReportStatus.COMPLETED)
        expect(events[1].payload).toEqual(JSON.stringify({output: input}))
        expect(events[1].elementId).toEqual('StartEvent_1')
        expect(events[1].transactionId).toEqual(input)
        expect(events[1].referenceType).toEqual('UnitTest')
        expect(events[1].referenceId).toEqual(input)
        expect(events[1].startEvent).toEqual(true)
        expect(events[1].endEvent).toEqual(false)
        expect(events[1].multipleInstanceIndex).toEqual('0.0')
        expect(events[1].errorMessage).not.toBeDefined()
        expect(events[1].processId).toEqual(process.env.REPORTING_PROCESS_ID)
        expect(events[1].processVersion).toEqual(process.env.REPORTING_PROCESS_VERSION)
        expect(events[1].executionId).toBeDefined()
        expect(events[1].eventTime).toBeDefined()
        expect(events[1].startedBy).toEqual('system')
    })

    test('should terminate', async () => {

        const fn = function StartEvent_1(message:string) {

            throw new Error('Business Error')
        }

        const sut = interceptHandler(fn, {
            endEvent: true,
            instanceIdExpression: '{{ message }}',
            keyExpression: '{{ message }}'
        })

        // GIven
        const message = 'foo'

        try {
            await sut(message)
        }catch (e) {
            expect(e).toEqual(new Error('Business Error'))
        }

        expect(events.length).toEqual(2)
        expect(mockedAxios.post).toHaveBeenCalledWith('http://localhost:8080/reporting-service/rest/api/report', events[0])
        expect(mockedAxios.post).toHaveBeenCalledWith('http://localhost:8080/reporting-service/rest/api/report', events[1])

        expect(events[0].status).toEqual(ReportStatus.STARTED)
        expect(events[0].payload).toEqual(JSON.stringify({message}))
        expect(events[0].elementId).toEqual('StartEvent_1')
        expect(events[0].transactionId).toEqual(message)

        expect(events[0].referenceId).toEqual(message)
        expect(events[0].startEvent).toEqual(false)
        expect(events[0].endEvent).toEqual(true)
        expect(events[0].multipleInstanceIndex).toEqual('0.0')
        expect(events[0].errorMessage).not.toBeDefined()
        expect(events[0].processId).toEqual(process.env.REPORTING_PROCESS_ID)
        expect(events[0].processVersion).toEqual(process.env.REPORTING_PROCESS_VERSION)
        expect(events[0].executionId).toBeDefined()
        expect(events[0].eventTime).toBeDefined()
        expect(events[0].startedBy).toEqual('system')

        expect(events[1].status).toEqual(ReportStatus.ERROR)
        expect(events[1].payload).not.toBeDefined()
        expect(events[1].elementId).toEqual('StartEvent_1')
        expect(events[1].transactionId).toEqual(message)

        expect(events[1].referenceId).toEqual(message)
        expect(events[1].startEvent).toEqual(false)
        expect(events[1].endEvent).toEqual(true)
        expect(events[1].multipleInstanceIndex).toEqual('0.0')
        expect(events[1].errorMessage).toEqual('Error: Business Error')
        expect(events[1].processId).toEqual(process.env.REPORTING_PROCESS_ID)
        expect(events[1].processVersion).toEqual(process.env.REPORTING_PROCESS_VERSION)
        expect(events[1].executionId).toBeDefined()
        expect(events[1].eventTime).toBeDefined()
        expect(events[1].startedBy).toEqual('system')
    })
})