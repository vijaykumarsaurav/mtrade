import Notify from "./Notify";

export function resolveResponse(response, msg) {
   
    let data = {};
        if (response.status === 200) {
            data = response.data;
            if(data.status) {
                if(data.message){

                    if(msg !== 'noPop')
                    Notify.showSuccess(data.message);
                }
                return data;
            }else{
               // console.log('inside');
                Notify.showError(data.message);
                if(data.message === "Invalid Token"){
                    window.location.replace("#/login");
                }
                return Promise.reject(data.message);
            }
        }
        else if(response && !response.status){
            Notify.showError(data.message);
           // console.log('outside');
            window.location.replace("#/login");
           // return Promise.reject(data.message);
        }   
}