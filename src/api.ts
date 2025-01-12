import axios from 'axios'
import {listProcesses, ProcessData} from './bpmn.utils'

const register = async () => {

    return listProcesses().map((it: Promise<ProcessData>) => it.then(registerProcess))
}

const registerProcess = async (data: ProcessData) => {

    const url = process.env.REPORTING_SERVER + '/reporting-service/rest/api/definition'

    return axios.post(url, data)
        .then(it => console.log('Process [' + data.fileName + '] successfully registered.'))
        .catch(e => console.log('Unable to register Process!', data))
}

export default {register}