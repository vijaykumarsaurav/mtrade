import axios from 'axios';
import  * as amsConstant from "../../utils/config";
import AuthService from "./AuthService";

class AfService {

    listCros(){
        return axios.get(amsConstant.CRO_API_BASE_URL);
    }


    addCro(cro) {
        return axios.post(amsConstant.CRO_API_BASE_URL, cro, AuthService.getHeader());
    }

}

export default new AfService();
