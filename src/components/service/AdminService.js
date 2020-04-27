import axios from 'axios';
import AuthService from "./AuthService";
import  * as apiConstant from "../../utils/config";

class AdminService {

    getStaticData(role){
        return axios.get(apiConstant.VERIFICATION_STATIC_DATA + '?role=' + role, AuthService.getHeader());
    }
    getListOfRoles(){
        return axios.get(apiConstant.LIST_OF_ROLES , AuthService.getHeader());
    }

    getRoleDetails(id){
        return axios.get(apiConstant.ROLE_DETAILS_BY_ID+id , AuthService.getHeader());
    }


    downlaodAllOfferData(){
        return axios.get(apiConstant.RETAILER_API_OFFER_DOWNLOAD, AuthService.getHeader());
    }

    uploadRetailer(formData){
        return axios.post(apiConstant.RETAILER_ONBOARD, formData, AuthService.getHeader());
    }

    uploadOffer(formData){
        return axios.post(apiConstant.RETAILER_API_OFFER_UPLOAD, formData, AuthService.getHeader());
    }

    deleteRetailer(formData){
        return axios.post(apiConstant.RETAILER_DELETE, formData, AuthService.getHeader());
    }

    searchRetailer(lapuNumber){
        return axios.get(apiConstant.RETAILER_SEARCH+"?laId=" +lapuNumber , AuthService.getHeader());
    }

    sentReportToEmail(formData,api ){
        return axios.post(apiConstant.RETAILER_REPORT_BASEAPI+api, formData, AuthService.getHeader());
    }

    // listActiveProduct(){lapuNumber
    //     return axios.get(apiConstant.PRODUCT_API_BASE_URL, AuthService.getHeader());
    // }


    // deleteProduct(productId){
    //     return axios.delete(apiConstant.PRODUCT_API_BASE_URL + '/' + productId, AuthService.getHeader());
    // }


}



export default new AdminService();
