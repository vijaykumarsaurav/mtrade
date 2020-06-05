import axios from 'axios';

import AuthService from "./AuthService";
import {SL_AD_LOGIN_URL,SL_AD_LOGOUT_URL} from "../../utils/config";

class UserService {

    login(credentials, key) {

     //   return axios.post(STORE_API_BASE_URL + '/auth/portal-login', credentials, { 'headers': { 'X-Server-Key': '8786gfhy' } });
         // return axios.post(SL_AD_LOGIN_URL, credentials,  { 'headers': { 'MyServerKey': key }});
          return axios.post(SL_AD_LOGIN_URL, credentials, '');

    } 
    logout() {
     //   return axios.post(STORE_API_BASE_URL + '/auth/portal-login', credentials, { 'headers': { 'X-Server-Key': '8786gfhy' } });
          return axios.get(SL_AD_LOGOUT_URL, AuthService.getHeader());
    }

} 

export default new UserService();
