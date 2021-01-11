import axios from 'axios';

import AuthService from "./AuthService";
import {SL_AD_LOGIN_URL,SL_AD_LOGOUT_URL} from "../../utils/config";

class UserService {

    login(credentials, key) {

        console.log(credentials)
     //   return axios.post(STORE_API_BASE_URL + '/auth/portal-login', credentials, { 'headers': { 'X-Server-Key': '8786gfhy' } });
         // return axios.post(SL_AD_LOGIN_URL, credentials,  { 'headers': { 'MyServerKey': key }});
          return axios.post(SL_AD_LOGIN_URL, credentials, '');

    } 
    checkapi(url, credentials) {
        console.log(credentials);
        //   return axios.post(STORE_API_BASE_URL + '/auth/portal-login', credentials, { 'headers': { 'X-Server-Key': '8786gfhy' } });
             return axios.post(url, credentials, { Origin: '125.17.6.6' ,   Host: '125.17.6.6' } );
       }
    logout() {
     //   return axios.post(STORE_API_BASE_URL + '/auth/portal-login', credentials, { 'headers': { 'X-Server-Key': '8786gfhy' } });
          return axios.get(SL_AD_LOGOUT_URL, AuthService.getHeader());
    }

    imageLoad(filename) {
             return axios.get('http://localhost/'+ filename, AuthService.getImageHeader());
             

            // return axios.put('http://localhost/'+ filename, filename, {
            //     headers: {
            //       'Content-Type': 'image/png', 
            //      'token': localStorage.getItem("token")
            //     }
            //   });
    }

} 

export default new UserService();
