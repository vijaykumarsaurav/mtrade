import axios from 'axios';

import AuthService from "./AuthService";
import {CIRCLE_API_BASE_URL, PORTAL_STORE_API_BASE_URL, STORE_API_BASE_URL,SL_AD_LOGIN_URL,SL_AD_LOGOUT_URL} from "../../utils/config";

class StoreService {

    login(credentials, key) {

     //   return axios.post(STORE_API_BASE_URL + '/auth/portal-login', credentials, { 'headers': { 'X-Server-Key': '8786gfhy' } });
         // return axios.post(SL_AD_LOGIN_URL, credentials,  { 'headers': { 'MyServerKey': key }});
          return axios.post(SL_AD_LOGIN_URL, credentials, '');

    }
    logout() {
     //   return axios.post(STORE_API_BASE_URL + '/auth/portal-login', credentials, { 'headers': { 'X-Server-Key': '8786gfhy' } });
          return axios.get(SL_AD_LOGOUT_URL, AuthService.getHeader());
    }

    fetchStoreById(storeId) {
        return axios.get(PORTAL_STORE_API_BASE_URL + '/' + storeId, AuthService.getHeader());
    }

    listStore(){
        return axios.get(PORTAL_STORE_API_BASE_URL + '?onlyActive=false', AuthService.getHeader());
    }

    updateStore(store) {
        return axios.post("" + PORTAL_STORE_API_BASE_URL, store, AuthService.getHeader());
    }

    markAttendance(attendance) {
        return axios.post(STORE_API_BASE_URL + '/cro/attendance', attendance, AuthService.getHeader());
    }

    save(store) {
        return axios.post("" + PORTAL_STORE_API_BASE_URL, store, AuthService.getHeader());
    }

    listCircles() {
        return axios.get(CIRCLE_API_BASE_URL + '/portal?onlyActive=true', AuthService.getHeader());
    }

}

export default new StoreService();
