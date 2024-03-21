import {beforeEach, describe, expect, test} from '@jest/globals'
import {faker} from '@faker-js/faker'
import sut from './ProcessHeartBeat'

import axios from 'axios'

jest.mock('./bpmn.utils', () => ({
    ...jest.requireActual('./bpmn.utils'),
    listProcesses: jest.fn(() => [Promise.resolve({processId:'1', processVersion:'1.0'})])
}));

jest.mock('axios')
const mockedAxios = axios as jest.Mocked<typeof axios>

describe('Process reporting heartbeat', () => {

    let context: any
    let timer: any

    process.env = {
        REPORTING_SERVER : faker.string.uuid(),
    }

    beforeEach(() => {

        jest.resetModules() // Most important - it clears the cache

        context = {
            log: jest.fn(),
            error: jest.fn()
        }
        timer = {}
    });

    test('should be triggered', async () => {

        // Given
        const lastHeartBeat = new Date()
        mockedAxios.post.mockResolvedValue(Promise.resolve({data: {lastHeartBeat}}));

        // When
        await sut(timer, context)

        // Then
        expect(axios.post).toHaveBeenCalled()
        expect(context.log).toHaveBeenCalledWith('HeartBeat successfully sent', lastHeartBeat)
        expect(context.error).not.toHaveBeenCalled()
    });

    test('should not be triggered', async () => {

        // Given
        mockedAxios.post.mockResolvedValue(Promise.reject('Error'));

        // When
        await sut(timer, context)

        // Then
        expect(axios.post).toHaveBeenCalled();
        expect(context.log).not.toHaveBeenCalled();
        expect(context.error).toHaveBeenCalledWith('Unable to sent HeartBeat', 'Error');
    });
})