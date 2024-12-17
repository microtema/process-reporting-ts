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

        it('deflate nested array within primitive elements‚', () => {

            const data = {name: 'foo', age: 40, married: true, options: ['RED', 'BLUE']}

            const answer = sut(data)

            expect(answer).toBeDefined()
            expect(answer).toEqual({name: 'foo', age: 40, married: true, 'options.0': 'RED', 'options.1': 'BLUE'})
        })

        it('deflate nested array within mixed elements‚', () => {

            const data = {name: 'foo', age: 40, married: true, options: ['RED', true, 1, {foo:'bar'}]}

            const answer = sut(data)

            expect(answer).toBeDefined()
            expect(answer).toEqual({name: 'foo', age: 40, married: true, 'options.0': 'RED', 'options.1': true, 'options.2': 1, 'options.3.foo': 'bar'})
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

        it('inflate nested array within primitive elements', () => {

            const data = {name: 'foo', age: 40, married: true, 'options.0': 'RED', 'options.1': 'BLUE'}

            const answer = sut(data)

            expect(answer).toBeDefined()
            expect(answer).toEqual({name: 'foo', age: 40, married: true, options: ['RED', 'BLUE']})
        })

        it('deflate nested array within mixed elements‚', () => {

            const data = {name: 'foo', age: 40, married: true, 'options.0': 'RED', 'options.1': true, 'options.2': 1, 'options.3.foo': 'bar'}

            const answer = sut(data)

            expect(answer).toBeDefined()
            expect(answer).toEqual({name: 'foo', age: 40, married: true, options: ['RED', true, 1, {foo:'bar'}]})
        })
    })

    describe('JSON Deflate & Inflate', () => {

        it('deflate and inflate back', () => {

            const data = {
                "leadId": "MB123456789",
                "firstName": "Alice",
                "lastName": "Johnson",
                "email": "alice.johnson@samplemail.com",
                "phone": "+123456789",
                "company": "Mercedes-Benz",
                "position": "Fleet Manager",
                "leadSource": "Event - Auto Show",
                "status": "New",
                "score": 85,
                "segment": "Enterprise",
                "createdAt": "2024-10-14T08:00:00Z",
                "updatedAt": "2024-10-14T08:00:00Z",
                "assignedTo": {
                    "userId": "user_67890",
                    "name": "Robert Brown",
                    "email": "robert.brown@leadmanager.com"
                },
                "tags": ["automotive", "luxury", "high-value"],
                "notes": [
                    {
                        "noteId": "note_002",
                        "author": "Robert Brown",
                        "content": "Met Alice at the Auto Show. She is interested in discussing fleet options for corporate clients.",
                        "createdAt": "2024-10-14T09:45:00Z"
                    }
                ],
                "customFields": {
                    "industry": "Automotive",
                    "annualRevenue": "50M-100M",
                    "numberOfEmployees": 10000
                },
                "address": {
                    "street": "1 Mercedes Drive",
                    "city": "Stuttgart",
                    "state": "Baden-Württemberg",
                    "postalCode": "70327",
                    "country": "Germany"
                },
                "activityHistory": [
                    {
                        "activityId": "activity_003",
                        "type": "Email",
                        "subject": "Follow-Up Email Sent",
                        "timestamp": "2024-10-15T09:00:00Z",
                        "status": "Delivered"
                    },
                    {
                        "activityId": "activity_004",
                        "type": "Meeting",
                        "subject": "Initial Meeting Scheduled",
                        "timestamp": "2024-10-20T14:00:00Z",
                        "status": "Upcoming",
                        "notes": "Discussing fleet purchase options and potential discounts for large orders."
                    }
                ],
                "leadStage": "Qualification",
                "nextFollowUp": "2024-10-20T14:00:00Z",
                "preferences": {
                    "contactMethod": "Phone",
                    "preferredContactTime": "Afternoon"
                }
            }

            const deflate = json.deflate(data)
            expect(deflate).toBeDefined()

            const inflate = json.inflate(deflate)
            expect(inflate).toBeDefined()

            expect(inflate).toEqual(data)
        })
    })

})