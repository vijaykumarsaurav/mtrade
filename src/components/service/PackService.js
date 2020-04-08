import axios from 'axios';
import AuthService from "./AuthService";
import  * as amsConstant from "../../utils/config";

class ProductService {

    listProduct(){
        return axios.get(amsConstant.PRODUCT_API_BASE_URL+ '?onlyActive=false', AuthService.getHeader());
    }

    listActiveProduct(){
        return axios.get(amsConstant.PRODUCT_API_BASE_URL, AuthService.getHeader());
    }

    getOne(productId){
        return axios.get(amsConstant.PRODUCT_API_BASE_URL + '/' + productId, AuthService.getHeader());
    }

    updateProduct(product) {
        return axios.post(amsConstant.PRODUCT_API_BASE_URL, product, AuthService.getHeader());
    }


    uploadPackImage(formData) {
        return axios.post(amsConstant.UPLAOD_PACK_IMAGE, formData, AuthService.getHeader());
    }

    addPack(pack) {
        return axios.post(amsConstant.SAVE_PACK, pack, AuthService.getHeader());
    }

    addBanner(pack) {
        return axios.post(amsConstant.SAVE_BANNER, pack, AuthService.getHeader());
    }

    updateBanner(pack) {
        return axios.post(amsConstant.UPDATE_BANNER, pack, AuthService.getHeader());
    }



    getOneBanner(id) {
        return axios.get(amsConstant.GET_ONE_BANNER+"?bannerId="+id, AuthService.getHeader());

    }
    deleteProduct(productId){
        return axios.delete(amsConstant.PRODUCT_API_BASE_URL + '/' + productId, AuthService.getHeader());
    }

    upload(formData){
        return axios.post(amsConstant.STORE_API_BASE_URL + '/resource/upload', formData, AuthService.getHeader());
    }

}

export default new ProductService();
