import AuthService from "../components/service/AuthService";
import Notify from "./Notify";

export function resolveResponse(response, msg) {
   
    let data = {};
        if (response.status === 200) {
            console.log(response,"RESPONSE@@@@@@@@@@@")
            data = response.data;
            if(data.status === 200 || data.status === 201) {
                // if(data.message){
                //     Notify.showSuccess(data.message);
                // }
            }else if(data.status === 400 || data.status === 401 || data.status === 403) {
              //  Notify.showError("We need to authenticate you. Please login again.");
                localStorage.clear();
                //return window.location.replace("/#/login");
                return Promise.reject(window.location.replace("/#/login"));
            }else {
               // console.log(data.message,"XXXX");
                Notify.showError(data.message);
                return Promise.reject(data.message);
            }
        }
        // else {
        //     Notify.showError(data.message);
        //     return Promise.reject(data.message);
        // }
        return data;
}