import axios from 'axios';
import AuthService from "./AuthService";
import {SEGMENT_API_BASE_URL} from "../../utils/config";

class SegmentService {

    listSegment(){
        return axios.get(SEGMENT_API_BASE_URL+ '?onlyActive=false', AuthService.getHeader());
    }

    listActiveSegments(){
        return axios.get(SEGMENT_API_BASE_URL+ '?onlyActive=true', AuthService.getHeader());
    }

    getOne(segmentId){
        return axios.get(SEGMENT_API_BASE_URL + '/' + segmentId, AuthService.getHeader());
    }

    updateSegment(segment) {
        return axios.post("" + SEGMENT_API_BASE_URL, segment, AuthService.getHeader());
    }

    addSegment(segment) {
        return axios.post("" + SEGMENT_API_BASE_URL, segment, AuthService.getHeader());
    }

    deleteSegment(segmentId){
        return axios.delete(SEGMENT_API_BASE_URL + '/' + segmentId, AuthService.getHeader());
    }

}

export default new SegmentService();
