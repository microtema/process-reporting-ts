import axios from 'axios'
import listProcesses, {ProcessData} from './bpmn.utils'

function registerProcess() {

    const url =process.env.REPORTING_SERVER  + '/reporting-service/rest/api/definition'

    listProcesses().forEach((it:Promise<ProcessData>) => {
            it.then((data:ProcessData) => {
                axios.post(url, data)
                    .then(it => console.log('Process [' + data.fileName + '] successfully registered.'))
                    .catch(e => console.log('Unable to register Process!', data))
            })
        })
}

registerProcess()
