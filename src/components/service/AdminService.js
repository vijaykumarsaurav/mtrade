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

    

    //from pack service
    uploadPackImage(formData) {
        return axios.post(apiConstant.UPLAOD_PACK_IMAGE, formData, AuthService.getHeader());
    }

    addPack(pack) {
        return axios.post(apiConstant.SAVE_PACK, pack, AuthService.getHeader());
    }

    addBanner(pack) {
        return axios.post(apiConstant.SAVE_BANNER, pack, AuthService.getHeader());
    }

    updateBanner(pack) {
        return axios.post(apiConstant.UPDATE_BANNER, pack, AuthService.getHeader());
    }

    getOneBanner(id) {
        return axios.get(apiConstant.GET_ONE_BANNER+"?bannerId="+id, AuthService.getHeader());

    }

    //retailer admin service
    listPack(data){
        // return axios.get(apiConstant.RECHARGE_PACK_LISTING , '');
        return axios.post(apiConstant.RECHARGE_PACK_LISTING, data, AuthService.getHeader());
 
     }
 
 
     getAllBanner(data){
         return axios.post(apiConstant.GET_ALL_BANNERS_DETAILS,data,  AuthService.getHeader());
     }
 

     searchMSISDN(id) {
        return axios.get(apiConstant.SEARCH_BY_MSISDN+"?msisdn="+id, AuthService.getHeader());
    }



}



export default new AdminService();
