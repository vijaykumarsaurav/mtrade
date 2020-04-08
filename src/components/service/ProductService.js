import axios from 'axios';
import AuthService from "./AuthService";
import  * as amsConstant from "../../utils/config";

class ProductService {

    listProduct(){
      //  return axios.get(amsConstant.PRODUCT_API_BASE_URL+ '?onlyActive=false', AuthService.getHeader());
        return axios.post(amsConstant.PRODUCT_API_BASE_URL, { isFtr : false}, AuthService.getHeader());

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

export default new ProductService();
