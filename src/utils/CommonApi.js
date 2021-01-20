import ActivationService from "../components/service/ActivationService";
import {resolveResponse} from "../utils/ResponseHandler";


export default function getKycTotalToBeProcessed(){
    ActivationService.getKycTotalToBeProcessed("PROCESS_CUSTOMER_KYC").then(res => {
        let data = resolveResponse(res);  
        if(data.result){
            if(document.getElementById('acqRecordId')){
                document.getElementById('acqRecordId').innerHTML = "Acquisition records to be processed: " + data.result.pendingCount; 
            }
            // if(document.getElementById('resubmitRecordId')){
            //     document.getElementById('resubmitRecordId').innerHTML = "Resubmit records to be processed: " + data.result.resubmitCount; 
            // }
        }       
       
    });
}



