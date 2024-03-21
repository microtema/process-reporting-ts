const deflateImpl =  (json:any, prefix:string, jsonPart:any) => {

    const keys = Object.keys(jsonPart);

    keys.forEach((key:string) => {

        let _prefix:string

        if (jsonPart[key] && typeof jsonPart[ key ] === 'object') {

            const _currPrefix = key.concat('.');

            _prefix = prefix ? prefix.concat(_currPrefix) : _currPrefix

            deflateImpl(json, _prefix, jsonPart[ key ])

        } else {
            _prefix = prefix ? prefix.concat(key) : key

            json[(_prefix)] = jsonPart[ key ]
        }
    })

    return json
}

const inflateImpl =  (json:any, key:string, jsonPart:any) => {

    const keys = Object.keys(jsonPart)

    keys.forEach((key:string) => {

        const parts:string[] = key.split('.') // 'options.0.height'

        if (parts.length > 1) {

            const preKey = parts[0] // 'options'
            const postKey = key.substring(preKey.length+1) // '0.height'
            const position = postKey.split('.')[0] // '0'
            const isArray = isNumeric(position)

            const _jsonPart:any = {}

            if(isArray) {

                const nestedObject = json[preKey] || []

                json[(preKey)] = nestedObject // assign new value

                const propName = postKey.substring(position.length+1)
                const index = Number.parseInt(position)

                _jsonPart[(propName)] = jsonPart[key]

                const obj = nestedObject[index] || {}

                nestedObject[index] = obj

                inflateImpl(obj, postKey, _jsonPart)

            } else {

                const nestedObject = json[preKey] ||  {}

                json[(preKey)] = nestedObject // assign new value

                _jsonPart[(postKey)] = jsonPart[key]
                inflateImpl(nestedObject, postKey, _jsonPart)
            }

        } else {

            json[(key)] = jsonPart[ key ]
        }
    })

    return json
}

const isNumeric = (str:string):boolean => {

    return !Number.isNaN( Number.parseInt(str))
}

const deflate =  (json:any) => deflateImpl({}, '', json)

const inflate =(json:any) => inflateImpl({}, '', json)

export default {deflate, inflate}