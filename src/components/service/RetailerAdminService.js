import axios from 'axios';
import AuthService from "./AuthService";
import  * as amsConstant from "../../utils/config";

class RetailerAdminService {

    listPack(data){
       // return axios.get(amsConstant.RECHARGE_PACK_LISTING , '');
       return axios.post(amsConstant.RECHARGE_PACK_LISTING, data, AuthService.getHeader());

    }


    getAllBanner(data){
        return axios.post(amsConstant.GET_ALL_BANNERS_DETAILS,data,  AuthService.getHeader());
    }

    getOne(productId){
        return axios.get(amsConstant.PRODUCT_API_BASE_URL + '/' + productId, AuthService.getHeader());
    }

    updateProduct(product) {
        return axios.post(amsConstant.PRODUCT_API_BASE_URL, product, AuthService.getHeader());
    }

    addProduct(product) {
        return axios.post(amsConstant.PRODUCT_API_BASE_URL, product, AuthService.getHeader());
    }

    deleteProduct(productId){
        return axios.delete(amsConstant.PRODUCT_API_BASE_URL + '/' + productId, AuthService.getHeader());
    }

    upload(formData){
        return axios.post(amsConstant.STORE_API_BASE_URL + '/resource/upload', formData, AuthService.getHeader());
    }

}

export default new RetailerAdminService();
