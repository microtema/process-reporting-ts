import axios from 'axios'
import * as path from 'path'
import {listProcesses, ProcessData} from './bpmn.utils'

const register = async (folderPath: any = null) => {

    const bpmnFolderPath = folderPath || path.join(process.cwd(), 'bpmn')

    return listProcesses(bpmnFolderPath).map((it: Promise<ProcessData>) => it.then(registerProcess))
}

const registerProcess = async (data: ProcessData) => {

    const url = process.env.REPORTING_SERVER + '/reporting-service/rest/api/definition'

    return axios.post(url, data)
        .then(it => console.log('Process [' + data.fileName + '] successfully registered.'))
        .catch(e => console.log('Unable to register Process!', data))
}

const hearBeatProcess = async (data: ProcessData) => {

    const url = process.env.REPORTING_SERVER + '/reporting-service/rest/api/definition/heart-beat'

    return axios.post(url, {...data, eventTime: new Date()})
        .then(it => console.log('Heartbeat from process [' + data.fileName + '] successfully sent.'))
        .catch(e => console.log('Unable to send a process heartbeat!', data))
}

const heartBeat = async (folderPath: any = null) => {

    const bpmnFolderPath = folderPath || path.join(process.cwd(), 'bpmn')

    return listProcesses(bpmnFolderPath).map((it: Promise<ProcessData>) => it.then(hearBeatProcess))
}

export default {register, heartBeat}