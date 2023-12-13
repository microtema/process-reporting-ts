import {getParameters as sut} from './util'

describe('Util', () => {

    test('get function params on empty params', () => {

        const fn = () => {
        }

        const answer = sut(fn)

        expect(answer).toBeDefined()
        expect(answer).toEqual([])
    })

    test('get function params wth types', () => {

        const fn = (a: any, b: any) => a + b

        const answer = sut(fn)

        expect(answer).toBeDefined()
        expect(answer).toEqual(['a', 'b'])
    })

    test('get function destructing params wth types', () => {

        const fn = ({a, b}: { a: number, b: number }) => a + b

        const answer = sut(fn)

        expect(answer).toBeDefined()
        expect(answer).toEqual(['a', 'b'])
    })

    test('get function params wth mixed types', () => {

        const fn = ({a, b, c}: { a: number, b: number, c:[] }, foo: string, {h}:{h:boolean}) => a + b

        const answer = sut(fn)

        expect(answer).toBeDefined()
        expect(answer).toEqual(['a', 'b', 'c', 'foo','h'])
    })

    test('get function params wth multiple destructing types', () => {

        const fn = ({a, b}: { a: number, b: number }, {foo}: { foo: string }) => a + b

        const answer = sut(fn)

        expect(answer).toBeDefined()
        expect(answer).toEqual(['a', 'b', 'foo'])
    })

    test('get function params wth var args', () => {

        const fn = (...args:[]) => true

        const answer = sut(fn)

        expect(answer).toBeDefined()
        expect(answer).toEqual(['args'])
    })
})