import axios from 'axios'
import listProcesses, {ProcessData} from './bpmn.utils'

const processHeartBeatHandler = async (timer:any, context: any):Promise<void> => {

    const url = process.env.REPORTING_SERVER  + '/reporting-service/rest/api/definition/heart-beat'

    listProcesses()
        .forEach((it:Promise<ProcessData>) => {
            it.then(async (data:ProcessData) => {

                const {processId, processVersion} = data

                try {
                    const response = await axios.post<any>(url, {processId, processVersion, eventTime: new Date()})
                    context.log('HeartBeat successfully sent', response.data.lastHeartBeat)
                } catch (e) {
                    context.error('Unable to sent HeartBeat',e)
                }
            })
        })
}

export default processHeartBeatHandler
