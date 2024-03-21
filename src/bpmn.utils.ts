import axios from 'axios'
import BpmnModdle from 'bpmn-moddle'
import * as fs from 'fs'

export interface ProcessData  {
    processId: string
    fileName: string
    processDiagram: string
    processVersion: string
    boundedContext: string
    retentionTime: string
    eventTime: Date
}

export const listProcesses = (fileDir = './bpmn') => {

   return fs.readdirSync(fileDir, {withFileTypes: true})
        .filter(item => item.name.endsWith('.bpmn'))
        .map(it => {
            return {
                processDiagram: fs.readFileSync(fileDir + '/' +it.name, 'utf-8'),
                fileName: it.name
            } as ProcessData
        })
        .map(getProcessData)
}

const getProcessData = (data:ProcessData):Promise<ProcessData> => {

    const {processDiagram, fileName} = data

    const processVersion = process.env.REPORTING_PROCESS_VERSION || '1.0'
    const retentionTime = process.env.REPORTING_PROCESS_TTL || '7'

    return new Promise<any>((resolve) => {

        const moodle = new BpmnModdle()

        moodle.fromXML(processDiagram, {}).then((definition: any) => {

            const process = definition.rootElement.rootElements.find((r:any) => r.id.startsWith('Process_'))
            const {id, extensionElements} = process
            const properties:any = {}

            if (extensionElements) {

                const values = extensionElements.values
                for (let index = 0; index < values.length; index++) {

                    const val = values[index]
                    const children = val['$children']

                    for (let x = 0; x < children.length; x++) {
                        const child = children[x]
                        properties[(child.name)] = child.value
                    }
                }
            }

            const data = {
                processId: id,
                fileName,
                processDiagram,
                processVersion: properties.version || processVersion,
                boundedContext: properties['bounded-context'] || fileName.replace('.bpmn', '').toLowerCase(),
                retentionTime: properties['retention-time'] || retentionTime
            } as ProcessData

            resolve(data)
        })
    })
}
