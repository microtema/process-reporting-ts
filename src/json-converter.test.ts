import json from './json.converter'

describe('JSON Parser', () => {

    describe('JSON Deflate', () => {

        const sut = json.deflate

        it('deflate simple json', () => {

            const data = {name: 'foo', age: 40, married: true}

            const answer = sut(data)

            expect(answer).toBeDefined()
            expect(answer).toEqual({name: 'foo', age: 40, married: true})
        })

        it('deflate nested json', () => {

            const data = {
                name: 'foo',
                age: 40,
                married: true,
                options: {height: 100}
            }

            const answer = sut(data)

            expect(answer).toBeDefined()
            expect(answer).toEqual({name: 'foo', age: 40, married: true, 'options.height': 100})
        })

        it('deflate nested array', () => {

            const data = {name: 'foo', age: 40, married: true, options: [{height: 100}]}

            const answer = sut(data)

            expect(answer).toBeDefined()
            expect(answer).toEqual({name: 'foo', age: 40, married: true, 'options.0.height': 100})
        })
    })

    describe('JSON Inflate', () => {

        const sut = json.inflate

        it('inflate simple json', () => {

            const data = {name: 'foo', age: 40, married: true}

            const answer = sut(data)

            expect(answer).toBeDefined()
            expect(answer).toEqual({name: 'foo', age: 40, married: true})
        })

        it('inflate nested simple json', () => {

            const data = {name: 'foo', age: 40, married: true, 'options.height': 100}

            const answer = sut(data)

            expect(answer).toBeDefined()
            expect(answer).toEqual({name: 'foo', age: 40, married: true, options: {height: 100}})
        })

        it('inflate nested json', () => {

            const data = {name: 'foo', age: 40, married: true, 'options.height': 100, 'options.width': 200}

            const answer = sut(data)

            expect(answer).toBeDefined()
            expect(answer).toEqual({name: 'foo', age: 40, married: true, options: {height: 100, width: 200}})
        })

        it('inflate nested nested json', () => {

            const data = {
                name: 'foo',
                age: 40,
                married: true,
                'options.dimension.height': 100,
                'options.dimension.width': 200
            }

            const answer = sut(data)

            expect(answer).toBeDefined()
            expect(answer).toEqual({
                name: 'foo',
                age: 40,
                married: true,
                options: {dimension: {height: 100, width: 200}}
            })
        })

        it('inflate nested array', () => {

            const data = {name: 'foo', age: 40, married: true, 'options.0.height': 100, 'options.0.width': 200}

            const answer = sut(data)

            expect(answer).toBeDefined()
            expect(answer).toEqual({name: 'foo', age: 40, married: true, options: [{height: 100, width: 200}]})
        })
    })

})