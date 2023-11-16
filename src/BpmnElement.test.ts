import {BpmnElement} from "./BpmnElement";
import {ProcessReportingService, ReportEvent, ReportStatus} from "./index";

describe("intercept", () => {

    const events: Array<ReportEvent> = []

    ProcessReportingService.prototype.fireEvent = jest.fn((event: ReportEvent) => {
        events.push(event)
    })

    beforeEach(() => {
        events.length = 0
    })

    test('should be COMPLETED', async () => {

        // Given
        class Service {

            @BpmnElement({bpmnElementId: 'StartEvent_1', startEvent: true})
            execute(foo: string): Record<string, string> {
                return {key: "foo", value: foo}
            }
        }

        const sut = new Service();

        // When
        const answer = await sut.execute('bar')

        expect(answer).toMatchSnapshot()

        // Then
        expect(events.length).toBe(2);
        expect(events[0].status).toBe(ReportStatus.STARTED);
        expect(events[1].status).toBe(ReportStatus.COMPLETED);
    })

    test('should be ERROR', async () => {

        // Given
        class Service {

            @BpmnElement({bpmnElementId: 'StartEvent_1'})
            execute(foo: string): string {
                throw new Error("Unable to execute!")
            }
        }

        const sut = new Service();

        // When
        const answer = await sut.execute('foo')

        // Then
        expect(answer).toMatchSnapshot()

        expect(events.length).toBe(2);
        expect(events[0].status).toBe(ReportStatus.STARTED);
        expect(events[1].status).toBe(ReportStatus.ERROR);
    })

    test('should be WARNING', async () => {

        // Given
        class Service {

            @BpmnElement({bpmnElementId: 'StartEvent_1', suppressException: true})
            execute(foo: string): string {
                throw new Error("Unable to convert!")
            }
        }

        const sut = new Service();

        // When
        const answer = await sut.execute('foo')

        // Then
        expect(answer).toMatchSnapshot()

        expect(events.length).toBe(2);
        expect(events[0].status).toBe(ReportStatus.STARTED);
        expect(events[1].status).toBe(ReportStatus.WARNING);
    })

    test('should be RESTARTED', async () => {

        // Given
        class Service {

            @BpmnElement({bpmnElementId: 'StartEvent_1', retries: 2})
            execute(foo: string): string {
                throw new Error("Unable to convert!")
            }
        }

        const sut = new Service();

        // When
        const answer = await sut.execute('foo')

        // Then
        expect(answer).toMatchSnapshot()

        expect(events.length).toBe(4);
        expect(events[0].status).toBe(ReportStatus.STARTED);
        expect(events[1].status).toBe(ReportStatus.RESTARTED);
        expect(events[2].status).toBe(ReportStatus.RESTARTED);
        expect(events[3].status).toBe(ReportStatus.ERROR);
    })

    test('should be COMPLETED with referenceId', async () => {

        // Given
        class Service {
            @BpmnElement({bpmnElementId: 'StartEvent_1', startEvent: true, keyExpression: '{{data.ID}}'})
            execute(data: any, convert: boolean) {

                return convert ? data.ID : null
            }
        }

        const sut = new Service();

        // When
        const answer = await sut.execute({'ID': 'event-id'}, true)

        expect(answer).toMatchSnapshot()

        // Then
        expect(events.length).toBe(2);

        let event = events[0]
        expect(event.status).toBe(ReportStatus.STARTED);

        expect(ProcessReportingService.prototype.fireEvent).toHaveBeenCalledWith(event)

        event = events[1]
        expect(event.status).toBe(ReportStatus.COMPLETED);
        expect(ProcessReportingService.prototype.fireEvent).toHaveBeenLastCalledWith(events[1])
    })
});

