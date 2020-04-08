import axios from 'axios';
import AuthService from "./AuthService";
import  * as amsConstant from "../../utils/config";

class ActivationService {

    
    listDocs(data){
        //return axios.post(amsConstant.VERIFY_DOCS_LISTING, data, { 'headers': { 'ContentType': 'application/json' } });
      return axios.post(amsConstant.VERIFY_DOCS_LISTING,data, AuthService.getHeader() );
    }

    listActiveProduct(){
        return axios.get(amsConstant.PRODUCT_API_BASE_URL, AuthService.getHeader());
    }

    getOneVerify(productId){
        //return axios.get(amsConstant.VERIFY_DOCS_BY_ID + '&txnId=' + productId, AuthService.getHeader());
        return axios.get(amsConstant.VERIFY_DETAILS + '&txnId=' + productId, AuthService.getHeader());
    }

    getOneDataEntry(productId){
        return axios.get(amsConstant.DATAENTRY_DETAILS + '&txnId=' + productId, AuthService.getHeader());
    }


    saveDataEntry(postdata){
        return axios.post(amsConstant.SAVE_DATAENTRY_DETAILS, postdata, AuthService.getHeader());
    }

    unlockTransectionsSkip(postdata){
        return axios.post(amsConstant.UNLOCK_SKIP_VERIFICATION, postdata, AuthService.getHeader());
    }
    
    getStaticData(role){
        return axios.get(amsConstant.VERIFICATION_STATIC_DATA + '?role=' + role, AuthService.getHeader());
    }

    approveDocs(product) {
        return axios.post(amsConstant.VERIFY_DOCS_APPROVE, product, AuthService.getHeader());
    }

    searchMobileNo(mobile) {
        return axios.get(amsConstant.SEARCH_BY_MOBILE_NO+ '?role=DE&mobileNumber='+mobile, AuthService.getHeader());
    }

    deleteProduct(productId){
        return axios.delete(amsConstant.PRODUCT_API_BASE_URL + '/' + productId, AuthService.getHeader());
    }

    searchDistributer(object){
        return axios.post(amsConstant.DISTRIBUTER_SEARCH+'?mobileNumber='+object.mobileNumber+'&simNumber='+object.simNumber,  object,  AuthService.getHeader());
    }

    
    uploadDistrubuter(formData){
        return axios.post(amsConstant.DISTRIBUTER_UPLOAD, formData, AuthService.getHeader());
    }

    upload(formData){
        return axios.post(amsConstant.STORE_API_BASE_URL + '/resource/upload', formData, AuthService.getHeader());
    }

    testApi(formData){
        return axios.post(amsConstant.TESTAPI  , formData, AuthService.getHeader());
    }


    
}



export default new ActivationService();
