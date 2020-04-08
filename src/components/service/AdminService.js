import axios from 'axios';
import AuthService from "./AuthService";
import  * as amsConstant from "../../utils/config";

class AdminService {

    getStaticData(role){
        return axios.get(amsConstant.VERIFICATION_STATIC_DATA + '?role=' + role, AuthService.getHeader());
    }

    uploadRetailer(formData){
        return axios.post(amsConstant.RETAILER_ONBOARD, formData, AuthService.getHeader());
    }

    deleteRetailer(formData){
        return axios.post(amsConstant.RETAILER_DELETE, formData, AuthService.getHeader());
    }

    searchRetailer(lapuNumber){
        return axios.get(amsConstant.RETAILER_SEARCH+"?laId=" +lapuNumber , AuthService.getHeader());
    }

    sentReportToEmail(formData,api ){
        return axios.post(amsConstant.RETAILER_REPORT_BASEAPI+api, formData, AuthService.getHeader());
    }

    // listActiveProduct(){lapuNumber
    //     return axios.get(amsConstant.PRODUCT_API_BASE_URL, AuthService.getHeader());
    // }


    // deleteProduct(productId){
    //     return axios.delete(amsConstant.PRODUCT_API_BASE_URL + '/' + productId, AuthService.getHeader());
    // }


}



export default new AdminService();
