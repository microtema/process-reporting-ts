import axios from 'axios'
import {listProcesses} from './bpmn.utils'

const processHeartBeatHandler = async (timer:any, context: any):Promise<void> => {

    const url = process.env.REPORTING_SERVER  + '/reporting-service/rest/api/definition/heart-beat'

    const processes = listProcesses()

    for (let index = 0; index < processes.length; index++) {

        const process = await processes[index]

        const {processId, processVersion} = process

        try {
            const response = await axios.post<any>(url, {processId, processVersion, eventTime: new Date()})
            context.log('HeartBeat successfully sent', response.data.lastHeartBeat)
        } catch (e) {
            context.error('Unable to sent HeartBeat',e)
        }
    }
}

export default processHeartBeatHandler
