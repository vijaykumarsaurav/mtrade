import axios from 'axios';
import AuthService from "./AuthService";
import  * as amsConstant from "../../utils/config";

class QueueService {

    listQueue(){
        return axios.get(amsConstant.QUEUE_API_BASE_URL+ '?onlyActive=false', AuthService.getHeader());
    }

    listActiveQueue(){
        return axios.get(amsConstant.QUEUE_API_BASE_URL, AuthService.getHeader());
    }

    getOne(queueId){
        return axios.get(amsConstant.QUEUE_API_BASE_URL + '/' + queueId, AuthService.getHeader());
    }

    updateQueue(queue) {
        return axios.post(amsConstant.QUEUE_API_BASE_URL, queue, AuthService.getHeader());
    }

    addQueue(queue) {
        return axios.post(amsConstant.QUEUE_API_BASE_URL, queue, AuthService.getHeader());
    }

}

export default new QueueService();
