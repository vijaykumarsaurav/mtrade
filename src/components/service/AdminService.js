import axios from 'axios';
import AuthService from "./AuthService";
import  * as apiConstant from "../../utils/config";

class AdminService {

    login(credentials) {
         return axios.post(apiConstant.LOGIN_API, credentials, AuthService.loginHeader());
    } 

    logout(credentials) {
        return axios.post(apiConstant.LOGOUT_API, credentials, AuthService.getHeader());
     } 

    getUserData(formData){
        return axios.get(apiConstant.GET_USER_PROFILE, AuthService.getHeader());
    }

    getFunds(formData){
        return axios.get(apiConstant.GET_FUNDS, AuthService.getHeader());
    }

    retrieveOrderBook(formData){
        return axios.get(apiConstant.GetOrderBook, AuthService.getHeader());
    }
    retrieveTradeBook(formData){
        return axios.get(apiConstant.GetTradeBook, AuthService.getHeader());
    }
    
    retrieveallTradableInstruments(formData){
        return axios.get(apiConstant.GetAllTradableInstruments,'');
    }

    placeOrder(credentials) {
        return axios.post(apiConstant.PlaceOrderApi, credentials, AuthService.getHeader());
    } 
    modifyOrder(credentials) {
        return axios.post(apiConstant.modifyOrderApi, credentials, AuthService.getHeader());
    } 
    cancelOrder(credentials) {

        return axios.post(apiConstant.cancelOrderApi, credentials, AuthService.getHeader());
    } 

    getLTP(credentials) {
        return axios.post(apiConstant.GetLTPAPI, credentials, AuthService.getHeader());
    } 

    getHistoryData(credentials) {
        return axios.post(apiConstant.getCandleData, credentials, AuthService.getHeader());
    } 

    scanStocks(credentials) {
        return axios.post('https://chartink.com/screener/process', credentials, AuthService.getScannerHeader());
     } 

     autoCompleteSearch(query) {
        return axios.get('http://localhost:8081/search/'+query, '');
     } 
     saveWatchList(data) {
        return axios.get('http://localhost:8081/saveWatchList/'+data, '');
     } 
     addIntoStaticData(data) {
        return axios.post('http://localhost:8081/addIntoStaticData', data, '');
     }
     saveWatchListJSON(data) {
        return axios.post('http://localhost:8081/saveWatchListJSON', data, '');
     }
     getWatchListJSON() {
        return axios.get('/myJsonWatchList.json', '');
     } 
     getStaticData() {
        if(window.location.hostname == "vijaykumarsaurav.github.io")
        return axios.get('/mtrade/staticData.json', '');
        else
        return axios.get('/staticData.json', '');
     } 
     saveCandleHistory(data) {
        return axios.post('http://localhost:8081/saveCandleHistory', data,  '');
     } 

     getPosition(data){
        return axios.get(apiConstant.getPosition, AuthService.getHeader());
     }

     getAutoScanStock(){
        return axios.get(apiConstant.getScannedStocks, '');
     }

     getNSETopStock(){
        return axios.get(apiConstant.getNseTopStocks, '');
     }

     getSelectedStockFromDb(){
        return axios.get(apiConstant.getSelectedStock, '');
     }

    //  getBNcpdata(){
    //     return axios.get(apiConstant.'', AuthService.getHeader());
    //  }

}



export default new AdminService();
