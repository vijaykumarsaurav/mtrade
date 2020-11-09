import axios from 'axios';
import AuthService from "./AuthService";
import  * as apiConstant from "../../utils/config";

class ActivationService {

    listDocs(data){
        //return axios.post(apiConstant.VERIFY_DOCS_LISTING, data, { 'headers': { 'ContentType': 'application/json' } });
      return axios.post(apiConstant.VERIFY_DOCS_LISTING,data, AuthService.getHeader() );
    }
    listDocsResubmit(data){
        //return axios.post(apiConstant.VERIFY_DOCS_LISTING, data, { 'headers': { 'ContentType': 'application/json' } });
      return axios.post(apiConstant.VERIFY_DOCS_LISTING_RESUBMIT,data, AuthService.getHeader() );
    }
    
    getListOfRoles(){
        return axios.get(apiConstant.LIST_OF_ROLES , AuthService.getHeader());
    }

    getOneVerify(productId){
        //return axios.get(apiConstant.VERIFY_DOCS_BY_ID + '&txnId=' + productId, AuthService.getHeader());
        return axios.get(apiConstant.VERIFY_DETAILS + '?txnId=' + productId, AuthService.getHeader());
    }

    getOneDataEntry(productId){
        
        return axios.get(apiConstant.DATAENTRY_DETAILS + '?txnId=' + productId, AuthService.getHeader());
    }


    saveDataEntry(postdata){
        return axios.post(apiConstant.SAVE_DATAENTRY_DETAILS, postdata, AuthService.getHeader());
    }

    unlockTransectionsSkip(postdata){
        return axios.post(apiConstant.UNLOCK_SKIP_VERIFICATION, postdata, AuthService.getHeader());
    }
    
    getStaticData(role){
        return axios.get(apiConstant.VERIFICATION_STATIC_DATA + '?role=' + role, AuthService.getHeader());
    }

    getTotalToBeProcessed(){
        return axios.get(apiConstant.RECORD_TOBE_PROCESSED, AuthService.getHeader());
    }

    approveDocs(product) {
        return axios.post(apiConstant.VERIFY_DOCS_APPROVE, product, AuthService.getHeader());
    }

    searchMobileNo(mobile) {
        return axios.get(apiConstant.SEARCH_BY_MOBILE_NO+ '?role=DE&mobileNumber='+mobile, AuthService.getHeader());
    }

    searchDistributer(object){
        return axios.get(apiConstant.DISTRIBUTER_SEARCH+'?mobileNumber='+object.mobileNumber, AuthService.getHeader());
    }
    getOneVerify(txnId){
        return axios.get(apiConstant.VERIFY_DETAILS + '?txnId=' + txnId, AuthService.getHeader());
    }

    msisdnDocsView(formData){
        return axios.get(apiConstant.MSISDNDOCS_VIEW+ '?txnId=' + formData.txnId, AuthService.getHeader());
    } 
    
    searchDistributerResubmit(data){
       // return axios.get(apiConstant.DISTRIBUTER_SEARCH_RESUBMIT+'?mobileNumber='+object.mobileNumber, AuthService.getHeader());
       return axios.post(apiConstant.DISTRIBUTER_SEARCH_RESUBMIT , data, AuthService.getHeader());
    } 

    uploadDistrubuterResubmit(formData){
        return axios.post(apiConstant.DISTRIBUTER_UPLOAD_RESUBMIT, formData, AuthService.getHeader());
    } 

    checkSession(){
        return axios.get(apiConstant.CHECK_SESSION_API , AuthService.getHeader());
    } 


    
}



export default new ActivationService();
